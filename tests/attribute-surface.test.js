/**
 * Property 18: The rendered attribute surface stays within the allowed set
 *
 * **Validates: Requirements 9.4, 9.9, 9.12**
 *
 * After rendering projects with `renderList`, the document's attribute surface
 * stays within strict bounds:
 * 1. Only allowed ARIA attributes exist: aria-labelledby, aria-current, aria-busy,
 *    aria-hidden, aria-label
 * 2. No positive tabindex values exist anywhere in the document
 * 3. No role attribute except on elements that genuinely need it (img with role="img")
 * 4. No onclick, onload, or other event handler attributes exist
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set globalThis.document before importing the module so renderList can use
// document.createDocumentFragment()
const env = createDocument();
globalThis.document = env.document;

const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderList } = await import(projectsModulePath);

/** The complete set of allowed ARIA attributes per Requirement 9.12 */
const ALLOWED_ARIA = new Set([
  'aria-labelledby',
  'aria-current',
  'aria-busy',
  'aria-hidden',
  'aria-label',
  'aria-controls',
  'aria-expanded',
]);

describe('Property 18: The rendered attribute surface stays within the allowed set', () => {
  let featuredTemplate, featuredList;

  beforeAll(() => {
    featuredTemplate = env.document.getElementById('featured-card-template');
    featuredList = env.document.querySelector('[data-featured-list]');
  });

  it('only allowed ARIA attributes exist in the document after rendering', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 1,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          const allElements = env.document.querySelectorAll('*');
          for (const el of allElements) {
            for (const attr of el.attributes) {
              const name = attr.name.toLowerCase();
              if (name.startsWith('aria-')) {
                expect(ALLOWED_ARIA.has(name)).toBe(true);
              }
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('no positive tabindex values exist anywhere in the document', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 1,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          const elements = env.document.querySelectorAll('[tabindex]');
          for (const el of elements) {
            const value = parseInt(el.getAttribute('tabindex'), 10);
            expect(value).toBeLessThanOrEqual(0);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('no role attribute exists except on elements that need it', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 1,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          const elements = env.document.querySelectorAll('[role]');
          for (const el of elements) {
            const role = el.getAttribute('role');
            const tag = el.tagName.toLowerCase();
            // Only img elements with role="img" are acceptable
            if (tag === 'img') {
              expect(role).toBe('img');
            } else if (tag === 'svg') {
              expect(role).toBe('img');
            } else {
              // No other element should carry a role attribute
              expect(role).toBeNull();
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('no event handler attributes exist anywhere in the document', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 1,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          const allElements = env.document.querySelectorAll('*');
          for (const el of allElements) {
            for (const attr of el.attributes) {
              const name = attr.name.toLowerCase();
              // Event handlers start with "on" (onclick, onload, onerror, etc.)
              expect(name.startsWith('on')).toBe(false);
            }
          }
        }
      ),
      { numRuns: 12 }
    );
  });
});
