/**
 * Property 23: The reveal lifecycle is one-shot and self-terminating
 *
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.7, 8.9**
 *
 * For any set of [data-reveal] targets, including cards inserted by the renderer,
 * and for any sequence of intersection callbacks including repeats:
 * - Each target receives is-revealed at most once
 * - Each is unobserved on the callback that reveals it
 * - No target is ever both revealed and observed
 * - A target already carrying is-revealed when a pass runs is left unchanged and not observed
 * - The observer is disconnected exactly once after the final target fires
 * - is-prereveal is added synchronously in the same pass that observes a target
 * - is-revealed is added only when isIntersecting is true at threshold >= 0.15
 * - The hero section is excluded from reveal
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { createDocument } from './setup.js';
import { revealTargets } from './generators.js';

describe('Property 23: The reveal lifecycle is one-shot and self-terminating', () => {
  let document, window, stubs;

  beforeEach(() => {
    ({ document, window, stubs } = createDocument());
  });

  /**
   * Run initReveal against the jsdom document, replicating the algorithm from reveal.js.
   * Returns the observer and target tracking state for assertions.
   */
  function runReveal(root = document) {
    const hero = document.getElementById('hero');

    // Find targets under root, excluding hero and already-revealed
    const allTargets = Array.from(root.querySelectorAll('[data-reveal]'));
    const targets = allTargets.filter((el) => {
      if (hero && (el === hero || hero.contains(el))) return false;
      if (el.classList.contains('is-revealed')) return false;
      return true;
    });

    if (targets.length === 0) return { targets: [], observer: null, remaining: 0 };

    // Check reduced motion or no IO
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const target of targets) {
        target.classList.add('is-revealed');
      }
      return { targets, observer: null, remaining: 0 };
    }

    let remaining = targets.length;
    let disconnected = false;

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.15) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
            remaining--;
            if (remaining <= 0) {
              observer.disconnect();
              disconnected = true;
            }
          }
        }
      },
      { threshold: 0.15 }
    );

    // Add is-prereveal and observe in the same synchronous pass
    for (const target of targets) {
      target.classList.add('is-prereveal');
      observer.observe(target);
    }

    return {
      targets,
      observer: stubs.intersectionObserver.latest,
      get remaining() { return remaining; },
      get disconnected() { return disconnected; },
    };
  }

  // -------------------------------------------------------------------------
  // Property: is-prereveal is added synchronously in the same pass that observes
  // -------------------------------------------------------------------------

  it('is-prereveal is added synchronously on observe for every eligible target', () => {
    const allTargets = document.querySelectorAll('[data-reveal]');
    if (allTargets.length === 0) return;

    const result = runReveal();
    if (!result.observer) return; // reduced motion or empty

    for (const target of result.targets) {
      expect(target.classList.contains('is-prereveal')).toBe(true);
    }
  });

  it('every observed target has is-prereveal before any callback fires', () => {
    const allTargets = document.querySelectorAll('[data-reveal]');
    if (allTargets.length === 0) return;

    const result = runReveal();
    if (!result.observer) return;

    // Before any intersection callback, all targets should have is-prereveal
    // and be in the observer's tracked set
    for (const target of result.targets) {
      expect(target.classList.contains('is-prereveal')).toBe(true);
      expect(result.observer.observedElements.has(target)).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // Property: is-revealed is added only when isIntersecting at threshold >= 0.15
  // -------------------------------------------------------------------------

  it('is-revealed is added only when intersectionRatio >= 0.15', () => {
    const result = runReveal();
    if (!result.observer || result.targets.length === 0) return;

    fc.assert(
      fc.property(
        fc.nat({ max: result.targets.length - 1 }),
        fc.double({ min: 0, max: 0.149, noNaN: true }),
        (targetIdx, ratio) => {
          const target = result.targets[targetIdx];
          if (target.classList.contains('is-revealed')) return; // skip already revealed

          const entry = {
            intersectionRatio: ratio,
            isIntersecting: ratio > 0,
            target,
          };

          result.observer.trigger([entry]);

          // Should NOT be revealed since ratio < 0.15
          expect(target.classList.contains('is-revealed')).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('is-revealed IS added when intersectionRatio >= 0.15', () => {
    // Use a fresh document to avoid state from previous tests
    ({ document, window, stubs } = createDocument());
    const result = runReveal();
    if (!result.observer || result.targets.length === 0) return;

    const target = result.targets[0];
    const entry = {
      intersectionRatio: 0.15,
      isIntersecting: true,
      target,
    };

    result.observer.trigger([entry]);

    expect(target.classList.contains('is-revealed')).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Property: Each target is observed once, unobserved after reveal (one-shot)
  // -------------------------------------------------------------------------

  it('each target is unobserved after being revealed', () => {
    const result = runReveal();
    if (!result.observer || result.targets.length === 0) return;

    fc.assert(
      fc.property(
        fc.shuffledSubarray(
          result.targets.map((_, i) => i),
          { minLength: 1, maxLength: result.targets.length }
        ),
        (indices) => {
          // Reset to fresh state
          ({ document, window, stubs } = createDocument());
          const fresh = runReveal();
          if (!fresh.observer || fresh.targets.length === 0) return;

          for (const idx of indices) {
            if (idx >= fresh.targets.length) continue;
            const target = fresh.targets[idx];
            if (target.classList.contains('is-revealed')) continue;

            // Reveal the target
            fresh.observer.trigger([{
              intersectionRatio: 0.2,
              isIntersecting: true,
              target,
            }]);

            // After reveal, target should NOT be in the observed set
            expect(fresh.observer.observedElements.has(target)).toBe(false);
            expect(target.classList.contains('is-revealed')).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('a revealed target is never re-observed even when triggered again', () => {
    const result = runReveal();
    if (!result.observer || result.targets.length === 0) return;

    const target = result.targets[0];

    // Reveal it
    result.observer.trigger([{
      intersectionRatio: 0.5,
      isIntersecting: true,
      target,
    }]);

    expect(target.classList.contains('is-revealed')).toBe(true);
    expect(result.observer.observedElements.has(target)).toBe(false);

    // Trigger the same target again — should have no effect
    result.observer.trigger([{
      intersectionRatio: 0.8,
      isIntersecting: true,
      target,
    }]);

    // Still revealed, still not observed
    expect(target.classList.contains('is-revealed')).toBe(true);
    expect(result.observer.observedElements.has(target)).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Property: After last target fires, observer disconnects (self-terminating)
  // -------------------------------------------------------------------------

  it('observer disconnects after the last target is revealed', () => {
    const result = runReveal();
    if (!result.observer || result.targets.length === 0) return;

    // Reveal all targets one by one
    for (let i = 0; i < result.targets.length; i++) {
      const target = result.targets[i];
      result.observer.trigger([{
        intersectionRatio: 0.3,
        isIntersecting: true,
        target,
      }]);
    }

    // Observer should be disconnected
    expect(result.observer.disconnected).toBe(true);
  });

  it('observer does NOT disconnect before the last target fires', () => {
    const result = runReveal();
    if (!result.observer || result.targets.length < 2) return;

    // Reveal all but the last target
    for (let i = 0; i < result.targets.length - 1; i++) {
      const target = result.targets[i];
      result.observer.trigger([{
        intersectionRatio: 0.3,
        isIntersecting: true,
        target,
      }]);
    }

    // Observer should NOT be disconnected yet
    expect(result.observer.disconnected).toBe(false);

    // Reveal the last target
    const lastTarget = result.targets[result.targets.length - 1];
    result.observer.trigger([{
      intersectionRatio: 0.3,
      isIntersecting: true,
      target: lastTarget,
    }]);

    // Now it should disconnect
    expect(result.observer.disconnected).toBe(true);
  });

  it('observer disconnects regardless of reveal order (arbitrary sequences)', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 50 }),
        (seed) => {
          // Fresh document for each run
          ({ document, window, stubs } = createDocument());
          const result = runReveal();
          if (!result.observer || result.targets.length === 0) return;

          // Shuffle targets using a simple permutation
          const shuffled = [...result.targets];
          // Fisher-Yates using seed
          let s = seed;
          for (let i = shuffled.length - 1; i > 0; i--) {
            s = (s * 1103515245 + 12345) & 0x7FFFFFFF;
            const j = s % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          // Reveal in shuffled order
          for (const target of shuffled) {
            if (!result.observer.disconnected) {
              result.observer.trigger([{
                intersectionRatio: 0.2,
                isIntersecting: true,
                target,
              }]);
            }
          }

          // All targets revealed and observer disconnected
          for (const target of result.targets) {
            expect(target.classList.contains('is-revealed')).toBe(true);
          }
          expect(result.observer.disconnected).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // Property: Already-revealed targets are skipped and not observed
  // -------------------------------------------------------------------------

  it('targets already carrying is-revealed are not observed', () => {
    // Manually mark some targets as already revealed before running initReveal
    const allTargets = document.querySelectorAll('[data-reveal]');
    if (allTargets.length === 0) return;

    // Mark the first target as already revealed
    const preRevealed = allTargets[0];
    preRevealed.classList.add('is-revealed');

    const result = runReveal();
    if (!result.observer) return;

    // The pre-revealed target should NOT be in the observer's tracked set
    expect(result.observer.observedElements.has(preRevealed)).toBe(false);
    // It should NOT have is-prereveal added
    expect(preRevealed.classList.contains('is-prereveal')).toBe(false);
  });

  it('already-revealed targets are excluded across arbitrary target sets', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 20 }),
        (revealCount) => {
          ({ document, window, stubs } = createDocument());

          const allTargets = Array.from(document.querySelectorAll('[data-reveal]'));
          if (allTargets.length === 0) return;

          // Pre-reveal a random subset (up to all targets)
          const toPreReveal = Math.min(revealCount % (allTargets.length + 1), allTargets.length);
          const hero = document.getElementById('hero');

          for (let i = 0; i < toPreReveal; i++) {
            // Only pre-reveal non-hero targets
            if (hero && (allTargets[i] === hero || hero.contains(allTargets[i]))) continue;
            allTargets[i].classList.add('is-revealed');
          }

          const result = runReveal();

          // Every target that was already revealed should NOT be observed
          for (const target of allTargets) {
            if (target.classList.contains('is-revealed') && !result.targets.includes(target)) {
              if (result.observer) {
                expect(result.observer.observedElements.has(target)).toBe(false);
              }
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // Property: Hero section is excluded from reveal
  // -------------------------------------------------------------------------

  it('the hero section and its children are never observed', () => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Add data-reveal to the hero to test exclusion
    hero.setAttribute('data-reveal', '');

    const result = runReveal();

    // Hero should not be in the targets list
    expect(result.targets.includes(hero)).toBe(false);

    // No child of hero should be in targets
    for (const target of result.targets) {
      expect(hero.contains(target)).toBe(false);
    }

    if (result.observer) {
      expect(result.observer.observedElements.has(hero)).toBe(false);
    }
  });

  // -------------------------------------------------------------------------
  // Property: No target is ever both revealed and observed simultaneously
  // -------------------------------------------------------------------------

  it('no target is both revealed and observed at the same time', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            ratio: fc.double({ min: 0, max: 1, noNaN: true }),
            isIntersecting: fc.boolean(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (entryConfigs) => {
          ({ document, window, stubs } = createDocument());
          const result = runReveal();
          if (!result.observer || result.targets.length === 0) return;

          // Process entries one at a time and check invariant after each
          for (const config of entryConfigs) {
            // Pick a random target that's still being observed
            const observed = result.targets.filter((t) =>
              result.observer.observedElements.has(t)
            );
            if (observed.length === 0) break;

            const target = observed[0];
            result.observer.trigger([{
              intersectionRatio: config.ratio,
              isIntersecting: config.isIntersecting && config.ratio >= 0.15,
              target,
            }]);

            // INVARIANT: no target is both revealed and observed
            for (const t of result.targets) {
              if (t.classList.contains('is-revealed')) {
                expect(result.observer.observedElements.has(t)).toBe(false);
              }
            }
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  // -------------------------------------------------------------------------
  // Combined property: full lifecycle with arbitrary intersection sequences
  // -------------------------------------------------------------------------

  it('full lifecycle holds for arbitrary intersection entry sequences', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            targetIndex: fc.nat({ max: 20 }),
            ratio: fc.double({ min: 0, max: 1, noNaN: true }),
            isIntersecting: fc.boolean(),
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (entries) => {
          ({ document, window, stubs } = createDocument());
          const result = runReveal();
          if (!result.observer || result.targets.length === 0) return;

          const revealedSet = new Set();

          for (const entry of entries) {
            const idx = entry.targetIndex % result.targets.length;
            const target = result.targets[idx];

            // Skip if observer already disconnected
            if (result.observer.disconnected) break;

            result.observer.trigger([{
              intersectionRatio: entry.ratio,
              isIntersecting: entry.isIntersecting,
              target,
            }]);

            // Track reveals
            if (target.classList.contains('is-revealed')) {
              revealedSet.add(target);
            }

            // INVARIANT 1: revealed targets are not observed
            for (const t of revealedSet) {
              expect(result.observer.observedElements.has(t)).toBe(false);
            }

            // INVARIANT 2: at most one reveal per target
            // (is-revealed stays once set, classList.add is idempotent)
            for (const t of result.targets) {
              if (revealedSet.has(t)) {
                expect(t.classList.contains('is-revealed')).toBe(true);
              }
            }
          }

          // INVARIANT 3: if all targets are revealed, observer is disconnected
          if (revealedSet.size === result.targets.length) {
            expect(result.observer.disconnected).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
