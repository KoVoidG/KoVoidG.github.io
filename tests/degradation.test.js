/**
 * Property 20: Invalid input degrades, never throws
 *
 * **Validates: Requirements 4.9, 5.3, 5.11, 5.12**
 *
 * Verifies that the rendering pipeline degrades gracefully on invalid input:
 * 1. `renderList` never throws for any input (including null, undefined, arrays of garbage)
 * 2. Invalid items in a mixed array are skipped gracefully (only valid items render)
 * 3. `initProjects` handles invalid fetch responses without throwing
 * 4. The fallback is shown when zero valid featured cards are produced
 * 5. Console warnings are emitted for skipped invalid entries
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { arbitraryJson, validProject } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set up a jsdom document globally so that renderList can call document.createDocumentFragment()
const env = createDocument();
globalThis.document = env.document;

const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderList, initProjects } = await import(projectsModulePath);

describe('Property 20: Invalid input degrades, never throws', () => {
  let document, template, otherTemplate, featuredList, otherList;

  beforeAll(() => {
    document = env.document;
    template = document.getElementById('featured-card-template');
    otherTemplate = document.getElementById('other-item-template');
    featuredList = document.querySelector('[data-featured-list]');
    otherList = document.querySelector('[data-other-list]');
  });

  it('renderList never throws for arrays of arbitrary garbage', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryJson(), { minLength: 0, maxLength: 8 }),
        fc.constantFrom('featured', 'other'),
        (items, kind) => {
          const container = document.createElement('ul');
          const tmpl = kind === 'featured' ? template : otherTemplate;

          // Must not throw regardless of what items contain
          expect(() => {
            renderList(items, kind, container, tmpl);
          }).not.toThrow();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('invalid items in a mixed array are skipped; only valid items render', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(arbitraryJson(), { minLength: 1, maxLength: 4 }),
          fc.array(validProject('other'), { minLength: 1, maxLength: 3 })
        ),
        ([garbage, valid]) => {
          const mixed = [...garbage, ...valid];
          const container = document.createElement('ul');

          const count = renderList(mixed, 'other', container, otherTemplate);

          // Count must equal the number of valid items (garbage is skipped)
          expect(count).toBe(valid.length);
          // Container has exactly `count` children
          expect(container.children.length).toBe(valid.length);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('console warnings are emitted for each skipped invalid entry', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryJson(), { minLength: 1, maxLength: 5 }),
        (garbage) => {
          const container = document.createElement('ul');
          const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

          try {
            renderList(garbage, 'featured', container, template);

            // One warning per invalid entry
            expect(warnSpy).toHaveBeenCalledTimes(garbage.length);
            // Each warning message mentions "Skipping invalid"
            for (const call of warnSpy.mock.calls) {
              expect(call[0]).toMatch(/Skipping invalid/);
            }
          } finally {
            warnSpy.mockRestore();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('initProjects handles invalid fetch responses without throwing', () => {
    fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Payload missing arrays
          fc.constant({ foo: 'bar' }),
          fc.constant({ featured: 'not-an-array', other: [] }),
          fc.constant({ featured: [], other: 'not-an-array' }),
          // Non-object payload
          fc.constant(null),
          fc.constant(42),
          fc.constant('string-payload'),
          fc.constant([]),
          // Empty arrays (valid shape but zero cards)
          fc.constant({ featured: [], other: [] })
        ),
        async (payload) => {
          // Configure fetch stub to return the invalid payload
          env.stubs.fetch.reset();
          env.stubs.fetch.setResponse(payload);

          const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

          try {
            // Must not throw
            await expect(initProjects()).resolves.not.toThrow();
          } finally {
            errorSpy.mockRestore();
            warnSpy.mockRestore();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('fallback is shown when zero valid featured cards are produced', () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(arbitraryJson(), { minLength: 0, maxLength: 4 }),
        async (garbage) => {
          // Reset fetch to return garbage in the featured array
          env.stubs.fetch.reset();
          env.stubs.fetch.setResponse({ featured: garbage, other: [] });

          // Re-hide the fallback before each run
          const fallback = document.querySelector('[data-fallback]');
          if (fallback) fallback.setAttribute('hidden', '');

          const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

          try {
            await initProjects();

            // Since garbage items are all invalid, zero featured cards render
            // The fallback must be visible (hidden attribute removed)
            if (fallback) {
              expect(fallback.hasAttribute('hidden')).toBe(false);
            }
          } finally {
            errorSpy.mockRestore();
            warnSpy.mockRestore();
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
