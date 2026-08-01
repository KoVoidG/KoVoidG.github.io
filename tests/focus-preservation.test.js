/**
 * Property 19: Render preserves focus
 *
 * **Validates: Requirements 4.10**
 *
 * For any valid projects.json document and for any focusable element focused
 * before rendering, `document.activeElement` is the same connected element after
 * rendering, and no node containing it was removed or replaced.
 *
 * renderList never moves focus to any element — it operates only on the two
 * list containers and leaves document.activeElement unchanged.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { createDocument } from './setup.js';
import { validProject } from './generators.js';

// Set up globalThis.document before importing the module that uses it
const env = createDocument();
globalThis.document = env.document;

const { renderList } = await import('../js/modules/projects.js');

describe('Property 19: Render preserves focus', () => {
  /**
   * Helper: get the featured template and container from a document.
   */
  function getTemplateAndContainer(doc) {
    const template = doc.getElementById('featured-card-template');
    const container = doc.querySelector('[data-featured-list]');
    return { template, container };
  }

  /**
   * Helper: get various focusable elements outside the project containers.
   * These elements should never lose focus when renderList runs.
   */
  function getFocusableElements(doc) {
    const elements = [];

    // Skip link
    const skipLink = doc.querySelector('.skip-link');
    if (skipLink) elements.push(skipLink);

    // Nav links
    const navLinks = doc.querySelectorAll('.site-nav__link');
    for (const link of navLinks) {
      elements.push(link);
    }

    // CTA button in nav
    const cta = doc.querySelector('.site-nav__cta');
    if (cta) elements.push(cta);

    // Hero buttons
    const heroButtons = doc.querySelectorAll('.hero__actions .btn');
    for (const btn of heroButtons) {
      elements.push(btn);
    }

    // Main element (tabindex="-1")
    const main = doc.getElementById('main');
    if (main) elements.push(main);

    return elements;
  }

  it('focus on elements outside project containers is preserved after renderList', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const { document: doc } = createDocument();
          globalThis.document = doc;

          const { template, container } = getTemplateAndContainer(doc);
          if (!template || !container) return;

          const focusableElements = getFocusableElements(doc);
          if (focusableElements.length === 0) return;

          // Pick a random element to focus (deterministic within the property)
          for (const el of focusableElements) {
            // Set focus on this element
            el.focus();
            const activeBeforeRender = doc.activeElement;

            // Only test if focus actually took hold
            if (activeBeforeRender !== el) continue;

            // Call renderList with a valid project
            renderList([project], 'featured', container, template);

            // Focus must be unchanged
            expect(doc.activeElement).toBe(activeBeforeRender);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('document.activeElement before and after renderList points to the same element', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('featured'), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const { document: doc } = createDocument();
          globalThis.document = doc;

          const { template, container } = getTemplateAndContainer(doc);
          if (!template || !container) return;

          const focusableElements = getFocusableElements(doc);
          if (focusableElements.length === 0) return;

          // Focus the first available nav link
          const target = focusableElements[0];
          target.focus();

          const activeBeforeRender = doc.activeElement;
          if (activeBeforeRender !== target) return;

          // Render multiple projects
          renderList(projects, 'featured', container, template);

          // activeElement must be unchanged
          expect(doc.activeElement).toBe(activeBeforeRender);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('renderList never moves focus to any element (no focus() calls inside renderList)', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const { document: doc } = createDocument();
          globalThis.document = doc;

          const { template, container } = getTemplateAndContainer(doc);
          if (!template || !container) return;

          // Focus an element outside the containers
          const skipLink = doc.querySelector('.skip-link');
          if (!skipLink) return;
          skipLink.focus();
          if (doc.activeElement !== skipLink) return;

          // Spy on focus calls by wrapping HTMLElement.prototype.focus
          const focusCalls = [];
          const origFocus = doc.defaultView.HTMLElement.prototype.focus;
          doc.defaultView.HTMLElement.prototype.focus = function (...args) {
            focusCalls.push(this);
            return origFocus.apply(this, args);
          };

          try {
            renderList([project], 'featured', container, template);

            // renderList must not have called focus() on any element
            expect(focusCalls.length).toBe(0);
          } finally {
            // Restore original focus
            doc.defaultView.HTMLElement.prototype.focus = origFocus;
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('focus on body remains on body after renderList (default focus state)', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const { document: doc } = createDocument();
          globalThis.document = doc;

          const { template, container } = getTemplateAndContainer(doc);
          if (!template || !container) return;

          // Default state: activeElement is body
          const activeBeforeRender = doc.activeElement;

          renderList([project], 'featured', container, template);

          // Focus must still be on body (or wherever it was)
          expect(doc.activeElement).toBe(activeBeforeRender);
        }
      ),
      { numRuns: 10 }
    );
  });
});
