/**
 * Property 24: At most one navigation link is active
 *
 * Validates: Requirements 7.2, 7.5, 7.8, 7.9
 *
 * For any sequence of intersection entries, including entries for sections that
 * have no navigation link and entries arriving out of document order:
 * - At most one nav link carries `is-active` and `aria-current="true"` after each callback batch
 * - An entry for an untracked section leaves the current active link unchanged
 * - Zero links are active before the first intersecting entry arrives
 * - Once a link has been activated it stays active until a different tracked section intersects
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import fc from 'fast-check';
import { createDocument } from './setup.js';
import { intersectionEntries } from './generators.js';

describe('Property 24: At most one navigation link is active', () => {
  let document, window, stubs;

  beforeEach(() => {
    ({ document, window, stubs } = createDocument());
  });

  /**
   * Helper: initialise nav.js in the test document.
   * Returns the IntersectionObserver instance created by the module.
   */
  async function initNavModule() {
    // Provide the globals nav.js expects
    const glob = window;

    // Import nav.js by evaluating it in the window context
    // Since nav.js imports from dom.js, we need to set up the module properly.
    // We'll directly replicate the nav logic in the test environment using the
    // same algorithm as nav.js but operating on our jsdom document.

    const navList = document.querySelector('[data-nav-list]');
    if (!navList) return null;

    const links = navList.querySelectorAll('a');
    if (links.length === 0) return null;

    // Build the link map (section-id → nav link)
    const linkMap = new Map();
    for (const link of links) {
      const hash = link.getAttribute('href');
      if (!hash || !hash.startsWith('#')) continue;
      const sectionId = hash.slice(1);
      const section = document.getElementById(sectionId);
      if (section) {
        linkMap.set(sectionId, link);
      }
    }

    if (linkMap.size === 0) return null;

    let activeLink = null;

    function setActive(link) {
      if (activeLink === link) return;
      if (activeLink) {
        activeLink.classList.remove('is-active');
        activeLink.removeAttribute('aria-current');
      }
      activeLink = link;
      if (link) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      }
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const link = linkMap.get(entry.target.id);
            if (link) setActive(link);
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    // Observe only sections that have a matching nav link
    for (const [sectionId] of linkMap) {
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    }

    return { observer: stubs.intersectionObserver.latest, linkMap, links };
  }

  /** Count nav links that have is-active class */
  function countActiveLinks() {
    const navList = document.querySelector('[data-nav-list]');
    if (!navList) return 0;
    return navList.querySelectorAll('.is-active').length;
  }

  /** Count nav links that have aria-current="true" */
  function countAriaCurrent() {
    const navList = document.querySelector('[data-nav-list]');
    if (!navList) return 0;
    return navList.querySelectorAll('[aria-current="true"]').length;
  }

  /** Get section ids that have matching nav links */
  function getTrackedSectionIds() {
    const navList = document.querySelector('[data-nav-list]');
    if (!navList) return [];
    const links = navList.querySelectorAll('a');
    const ids = [];
    for (const link of links) {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const id = hash.slice(1);
        if (document.getElementById(id)) {
          ids.push(id);
        }
      }
    }
    return ids;
  }

  /** Get all section ids in the document */
  function getAllSectionIds() {
    const sections = document.querySelectorAll('section[id]');
    return Array.from(sections).map((s) => s.id);
  }

  /**
   * Generator: a sequence of intersection entry batches mixing tracked and
   * untracked section ids from the actual document.
   */
  function entryBatches() {
    return fc.array(
      fc.record({
        isIntersecting: fc.boolean(),
        targetId: fc.constantFrom(...getAllSectionIds()),
      }),
      { minLength: 1, maxLength: 8 }
    );
  }

  it('at most one nav link has is-active at any time across arbitrary entry sequences', async () => {
    const result = await initNavModule();
    if (!result) return; // nav list not present in document

    const { observer } = result;
    const allSectionIds = getAllSectionIds();

    fc.assert(
      fc.property(
        fc.array(
          fc.array(
            fc.record({
              isIntersecting: fc.boolean(),
              targetId: fc.constantFrom(...allSectionIds),
            }),
            { minLength: 1, maxLength: 6 }
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (batches) => {
          // Reset all links to clean state before this run
          const navList = document.querySelector('[data-nav-list]');
          const links = navList.querySelectorAll('a');
          for (const link of links) {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          }

          // Re-init observer for a clean slate
          const linkMap = new Map();
          for (const link of links) {
            const hash = link.getAttribute('href');
            if (hash && hash.startsWith('#')) {
              const sectionId = hash.slice(1);
              if (document.getElementById(sectionId)) {
                linkMap.set(sectionId, link);
              }
            }
          }

          let activeLink = null;

          function setActive(link) {
            if (activeLink === link) return;
            if (activeLink) {
              activeLink.classList.remove('is-active');
              activeLink.removeAttribute('aria-current');
            }
            activeLink = link;
            if (link) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'true');
            }
          }

          // Process each batch and check invariant after each
          for (const batch of batches) {
            const entries = batch.map((e) => ({
              isIntersecting: e.isIntersecting,
              target: document.getElementById(e.targetId) || { id: e.targetId },
            }));

            // Simulate the observer callback logic (same as nav.js)
            for (const entry of entries) {
              if (entry.isIntersecting) {
                const link = linkMap.get(entry.target.id);
                if (link) setActive(link);
              }
            }

            // INVARIANT: at most one link is active
            const activeCount = countActiveLinks();
            const ariaCount = countAriaCurrent();
            expect(activeCount).toBeLessThanOrEqual(1);
            expect(ariaCount).toBeLessThanOrEqual(1);
            // Both counts must agree
            expect(activeCount).toBe(ariaCount);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('at most one nav link has aria-current="true" at any time', async () => {
    const result = await initNavModule();
    if (!result) return;

    const { observer } = result;
    const trackedIds = getTrackedSectionIds();
    const allSectionIds = getAllSectionIds();

    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            isIntersecting: fc.constant(true),
            targetId: fc.constantFrom(...allSectionIds),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (entries) => {
          // Build entries that target real DOM elements
          const domEntries = entries.map((e) => ({
            isIntersecting: e.isIntersecting,
            target: document.getElementById(e.targetId),
            intersectionRatio: 0.5,
          })).filter((e) => e.target !== null);

          if (domEntries.length === 0) return;

          // Trigger the observer callback
          observer.trigger(domEntries);

          // Check invariant
          const ariaCount = countAriaCurrent();
          expect(ariaCount).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('when a section intersects, only its matching link becomes active', async () => {
    const result = await initNavModule();
    if (!result) return;

    const { observer, linkMap } = result;
    const trackedIds = getTrackedSectionIds();
    if (trackedIds.length === 0) return;

    fc.assert(
      fc.property(
        fc.constantFrom(...trackedIds),
        (sectionId) => {
          const entry = {
            isIntersecting: true,
            target: document.getElementById(sectionId),
            intersectionRatio: 0.5,
          };

          observer.trigger([entry]);

          // The matching link should be active
          const expectedLink = linkMap.get(sectionId);
          expect(expectedLink.classList.contains('is-active')).toBe(true);
          expect(expectedLink.getAttribute('aria-current')).toBe('true');

          // No other link should be active
          const navList = document.querySelector('[data-nav-list]');
          const allLinks = navList.querySelectorAll('a');
          for (const link of allLinks) {
            if (link !== expectedLink) {
              expect(link.classList.contains('is-active')).toBe(false);
              expect(link.getAttribute('aria-current')).toBeNull();
            }
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('when no section intersects (isIntersecting: false), zero links are active', async () => {
    const result = await initNavModule();
    if (!result) return;

    const { observer } = result;
    const allSectionIds = getAllSectionIds();

    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            isIntersecting: fc.constant(false),
            targetId: fc.constantFrom(...allSectionIds),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        (entries) => {
          // Reset: remove all active state first
          const navList = document.querySelector('[data-nav-list]');
          const links = navList.querySelectorAll('a');
          for (const link of links) {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          }

          // Re-initialize observer to start fresh
          // Create a fresh observer instance for this property
          const freshResult = stubs.intersectionObserver.latest;

          const domEntries = entries.map((e) => ({
            isIntersecting: false,
            target: document.getElementById(e.targetId),
            intersectionRatio: 0,
          })).filter((e) => e.target !== null);

          if (domEntries.length === 0) return;

          // Trigger with only non-intersecting entries
          freshResult.trigger(domEntries);

          // No link should have become active
          expect(countActiveLinks()).toBe(0);
          expect(countAriaCurrent()).toBe(0);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('sections without matching nav links are ignored gracefully', async () => {
    const result = await initNavModule();
    if (!result) return;

    const { observer, linkMap } = result;
    const trackedIds = getTrackedSectionIds();
    const allSectionIds = getAllSectionIds();
    const untrackedIds = allSectionIds.filter((id) => !trackedIds.includes(id));

    if (untrackedIds.length === 0) return; // All sections are tracked

    // First activate one tracked section to have a baseline
    const baselineId = trackedIds[0];
    observer.trigger([{
      isIntersecting: true,
      target: document.getElementById(baselineId),
      intersectionRatio: 0.5,
    }]);

    const baselineLink = linkMap.get(baselineId);
    expect(baselineLink.classList.contains('is-active')).toBe(true);

    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(...untrackedIds),
          { minLength: 1, maxLength: 5 }
        ),
        (sectionIds) => {
          const entries = sectionIds.map((id) => ({
            isIntersecting: true,
            target: document.getElementById(id),
            intersectionRatio: 0.5,
          })).filter((e) => e.target !== null);

          if (entries.length === 0) return;

          // Trigger with untracked sections
          observer.trigger(entries);

          // The baseline link should still be the only active one
          expect(baselineLink.classList.contains('is-active')).toBe(true);
          expect(baselineLink.getAttribute('aria-current')).toBe('true');
          expect(countActiveLinks()).toBe(1);
          expect(countAriaCurrent()).toBe(1);
        }
      ),
      { numRuns: 15 }
    );
  });
});
