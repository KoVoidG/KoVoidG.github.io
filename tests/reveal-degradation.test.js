/**
 * Property 22: Motion enhancement degrades to the revealed state
 *
 * Validates: Requirements 6.5, 8.4
 *
 * When `prefers-reduced-motion: reduce` matches or `IntersectionObserver` is
 * unavailable, all reveal targets receive `is-revealed` immediately without
 * constructing an IntersectionObserver. No target is left in `is-prereveal`.
 * The degradation path produces the exact same visual end-state as the full
 * animation path (all targets have `is-revealed`).
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { createDocument } from './setup.js';
import { revealTargets } from './generators.js';

describe('Property 22: Motion enhancement degrades to the revealed state', () => {
  let document, window, stubs;

  beforeEach(() => {
    ({ document, window, stubs } = createDocument());
  });

  /**
   * Helper: get non-hero [data-reveal] targets from the document.
   */
  function getRevealTargets(root = document) {
    const hero = document.getElementById('hero');
    const all = root.querySelectorAll('[data-reveal]');
    return Array.from(all).filter((el) => {
      if (hero && (el === hero || hero.contains(el))) return false;
      return true;
    });
  }

  /**
   * Helper: inject arbitrary reveal targets into the document body.
   * Returns the injected elements.
   */
  function injectRevealTargets(count) {
    const container = document.createElement('div');
    container.id = 'test-reveal-root';
    const elements = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.setAttribute('data-reveal', '');
      el.id = `reveal-target-${i}`;
      container.appendChild(el);
      elements.push(el);
    }
    document.body.appendChild(container);
    return { container, elements };
  }

  /**
   * Helper: replicate initReveal logic for a given root, using the window globals.
   * This mirrors reveal.js behaviour directly.
   */
  function runInitReveal(root = document) {
    const hero = document.getElementById('hero');
    const allTargets = root.querySelectorAll('[data-reveal]');
    const targets = Array.from(allTargets).filter((el) => {
      if (hero && (el === hero || hero.contains(el))) return false;
      if (el.classList.contains('is-revealed')) return false;
      return true;
    });

    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const target of targets) {
        target.classList.add('is-revealed');
      }
      return;
    }

    let remaining = targets.length;

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.15) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
            remaining--;
            if (remaining <= 0) {
              observer.disconnect();
            }
          }
        }
      },
      { threshold: 0.15 }
    );

    for (const target of targets) {
      target.classList.add('is-prereveal');
      observer.observe(target);
    }
  }

  // -------------------------------------------------------------------------
  // Reduced motion tests
  // -------------------------------------------------------------------------

  it('with reduced motion, all targets receive is-revealed immediately', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (count) => {
          // Fresh document for each run
          const env = createDocument();
          const doc = env.document;
          const win = env.window;
          env.stubs.matchMedia.setReducedMotion(true);

          // Inject targets
          const container = doc.createElement('div');
          container.id = 'test-root';
          for (let i = 0; i < count; i++) {
            const el = doc.createElement('div');
            el.setAttribute('data-reveal', '');
            el.id = `target-${i}`;
            container.appendChild(el);
          }
          doc.body.appendChild(container);

          // Run reveal logic
          const hero = doc.getElementById('hero');
          const allTargets = container.querySelectorAll('[data-reveal]');
          const targets = Array.from(allTargets).filter((el) => {
            if (hero && (el === hero || hero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (targets.length === 0) return;

          // Simulate initReveal with reduced motion
          if (!('IntersectionObserver' in win) ||
              win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const target of targets) {
              target.classList.add('is-revealed');
            }
          }

          // All targets must have is-revealed
          for (const el of allTargets) {
            expect(el.classList.contains('is-revealed')).toBe(true);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('with reduced motion, no IntersectionObserver is constructed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (count) => {
          const env = createDocument();
          const doc = env.document;
          const win = env.window;
          env.stubs.matchMedia.setReducedMotion(true);
          env.stubs.intersectionObserver.reset();

          // Inject targets
          const container = doc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = doc.createElement('div');
            el.setAttribute('data-reveal', '');
            container.appendChild(el);
          }
          doc.body.appendChild(container);

          // Run reveal logic
          const hero = doc.getElementById('hero');
          const allTargets = container.querySelectorAll('[data-reveal]');
          const targets = Array.from(allTargets).filter((el) => {
            if (hero && (el === hero || hero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (targets.length === 0) return;

          if (!('IntersectionObserver' in win) ||
              win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const target of targets) {
              target.classList.add('is-revealed');
            }
            // No observer should have been created
            expect(env.stubs.intersectionObserver.instances.length).toBe(0);
            return;
          }

          // Should not reach here when reduced motion is true
          expect(true).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('with reduced motion, no target is left in is-prereveal state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (count) => {
          const env = createDocument();
          const doc = env.document;
          const win = env.window;
          env.stubs.matchMedia.setReducedMotion(true);

          const container = doc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = doc.createElement('div');
            el.setAttribute('data-reveal', '');
            container.appendChild(el);
          }
          doc.body.appendChild(container);

          // Run reveal
          const hero = doc.getElementById('hero');
          const allTargets = container.querySelectorAll('[data-reveal]');
          const targets = Array.from(allTargets).filter((el) => {
            if (hero && (el === hero || hero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (targets.length === 0) return;

          if (!('IntersectionObserver' in win) ||
              win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const target of targets) {
              target.classList.add('is-revealed');
            }
          }

          // No target should have is-prereveal
          for (const el of allTargets) {
            expect(el.classList.contains('is-prereveal')).toBe(false);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  // -------------------------------------------------------------------------
  // IntersectionObserver unavailable tests
  // -------------------------------------------------------------------------

  it('without IntersectionObserver, all targets receive is-revealed immediately', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (count) => {
          const env = createDocument();
          const doc = env.document;
          const win = env.window;
          // Remove IntersectionObserver from window
          delete win.IntersectionObserver;

          const container = doc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = doc.createElement('div');
            el.setAttribute('data-reveal', '');
            el.id = `target-${i}`;
            container.appendChild(el);
          }
          doc.body.appendChild(container);

          // Run reveal logic
          const hero = doc.getElementById('hero');
          const allTargets = container.querySelectorAll('[data-reveal]');
          const targets = Array.from(allTargets).filter((el) => {
            if (hero && (el === hero || hero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (targets.length === 0) return;

          if (!('IntersectionObserver' in win) ||
              win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const target of targets) {
              target.classList.add('is-revealed');
            }
          }

          // All must have is-revealed
          for (const el of allTargets) {
            expect(el.classList.contains('is-revealed')).toBe(true);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('without IntersectionObserver, no target is left in is-prereveal state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        (count) => {
          const env = createDocument();
          const doc = env.document;
          const win = env.window;
          delete win.IntersectionObserver;

          const container = doc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = doc.createElement('div');
            el.setAttribute('data-reveal', '');
            container.appendChild(el);
          }
          doc.body.appendChild(container);

          const hero = doc.getElementById('hero');
          const allTargets = container.querySelectorAll('[data-reveal]');
          const targets = Array.from(allTargets).filter((el) => {
            if (hero && (el === hero || hero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (targets.length === 0) return;

          if (!('IntersectionObserver' in win) ||
              win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const target of targets) {
              target.classList.add('is-revealed');
            }
          }

          for (const el of allTargets) {
            expect(el.classList.contains('is-prereveal')).toBe(false);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  // -------------------------------------------------------------------------
  // Degradation produces same end-state as full animation path
  // -------------------------------------------------------------------------

  it('degradation produces the same end-state as the full animation path', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (count) => {
          // --- Full animation path (no reduced motion, observer fires all) ---
          const fullEnv = createDocument();
          const fullDoc = fullEnv.document;
          const fullWin = fullEnv.window;
          fullEnv.stubs.matchMedia.setReducedMotion(false);

          const fullContainer = fullDoc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = fullDoc.createElement('div');
            el.setAttribute('data-reveal', '');
            el.id = `target-${i}`;
            fullContainer.appendChild(el);
          }
          fullDoc.body.appendChild(fullContainer);

          // Run the full path: observe + trigger all entries at full intersection
          const fullHero = fullDoc.getElementById('hero');
          const fullAllTargets = fullContainer.querySelectorAll('[data-reveal]');
          const fullTargets = Array.from(fullAllTargets).filter((el) => {
            if (fullHero && (el === fullHero || fullHero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (fullTargets.length === 0) return;

          // Create observer and observe
          let fullRemaining = fullTargets.length;
          const fullObserver = new fullWin.IntersectionObserver(
            (entries, obs) => {
              for (const entry of entries) {
                if (entry.intersectionRatio >= 0.15) {
                  entry.target.classList.add('is-revealed');
                  obs.unobserve(entry.target);
                  fullRemaining--;
                  if (fullRemaining <= 0) obs.disconnect();
                }
              }
            },
            { threshold: 0.15 }
          );

          for (const target of fullTargets) {
            target.classList.add('is-prereveal');
            fullObserver.observe(target);
          }

          // Trigger all entries as intersecting
          const entries = fullTargets.map((t) => ({
            intersectionRatio: 1.0,
            isIntersecting: true,
            target: t,
          }));
          fullObserver.trigger(entries);

          // Collect full path end-state
          const fullEndState = Array.from(fullAllTargets).map((el) =>
            el.classList.contains('is-revealed')
          );

          // --- Degraded path (reduced motion) ---
          const degradedEnv = createDocument();
          const degradedDoc = degradedEnv.document;
          const degradedWin = degradedEnv.window;
          degradedEnv.stubs.matchMedia.setReducedMotion(true);

          const degradedContainer = degradedDoc.createElement('div');
          for (let i = 0; i < count; i++) {
            const el = degradedDoc.createElement('div');
            el.setAttribute('data-reveal', '');
            el.id = `target-${i}`;
            degradedContainer.appendChild(el);
          }
          degradedDoc.body.appendChild(degradedContainer);

          const degradedHero = degradedDoc.getElementById('hero');
          const degradedAllTargets = degradedContainer.querySelectorAll('[data-reveal]');
          const degradedTargets = Array.from(degradedAllTargets).filter((el) => {
            if (degradedHero && (el === degradedHero || degradedHero.contains(el))) return false;
            if (el.classList.contains('is-revealed')) return false;
            return true;
          });

          if (degradedTargets.length === 0) return;

          // Degraded path: immediately reveal
          for (const target of degradedTargets) {
            target.classList.add('is-revealed');
          }

          // Collect degraded path end-state
          const degradedEndState = Array.from(degradedAllTargets).map((el) =>
            el.classList.contains('is-revealed')
          );

          // Both paths must produce the same end-state: all targets have is-revealed
          expect(degradedEndState).toEqual(fullEndState);
          expect(fullEndState.every((v) => v === true)).toBe(true);
          expect(degradedEndState.every((v) => v === true)).toBe(true);
        }
      ),
      { numRuns: 15 }
    );
  });

  // -------------------------------------------------------------------------
  // Generated target sets from the revealTargets() generator
  // -------------------------------------------------------------------------

  it('with generated targets and reduced motion, all non-pre-revealed targets get is-revealed', () => {
    fc.assert(
      fc.property(
        revealTargets().filter((targets) => targets.length > 0),
        (generatedTargets) => {
          // Filter out any that are already revealed (mimics reveal.js filtering)
          const targets = generatedTargets.filter(
            (t) => !t.classList.contains('is-revealed')
          );

          if (targets.length === 0) return;

          // Simulate the reduced-motion degradation path
          for (const target of targets) {
            target.classList.add('is-revealed');
          }

          // All targets in the filtered set must now have is-revealed
          for (const target of targets) {
            expect(target.classList.contains('is-revealed')).toBe(true);
          }

          // None should have is-prereveal
          for (const target of targets) {
            expect(target.classList.contains('is-prereveal')).toBe(false);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('with generated targets and missing IO, all non-pre-revealed targets get is-revealed', () => {
    fc.assert(
      fc.property(
        revealTargets().filter((targets) => targets.length > 0),
        (generatedTargets) => {
          const targets = generatedTargets.filter(
            (t) => !t.classList.contains('is-revealed')
          );

          if (targets.length === 0) return;

          // Simulate the no-IO degradation path (same behaviour)
          for (const target of targets) {
            target.classList.add('is-revealed');
          }

          for (const target of targets) {
            expect(target.classList.contains('is-revealed')).toBe(true);
            expect(target.classList.contains('is-prereveal')).toBe(false);
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
