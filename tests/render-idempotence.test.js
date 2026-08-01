/**
 * Property 7: One card per project, and rendering is idempotent
 *
 * **Validates: Requirements 4.2, 4.11, 4.13**
 *
 * Verifies:
 * 1. The count returned by renderList equals the number of valid projects in the input
 * 2. Each valid project produces exactly one card/item in the container (one-to-one)
 * 3. Calling renderList twice with the same data produces the same DOM output (idempotent)
 * 4. Invalid projects are skipped and don't affect the count or DOM output
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject, arbitraryJson } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set up jsdom globals before importing the module under test,
// because renderList uses the global `document.createDocumentFragment()`
const env = createDocument();
globalThis.document = env.document;
globalThis.window = env.window;

const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderList, validateProject } = await import(projectsModulePath);

describe('Property 7: One card per project, and rendering is idempotent', () => {
  let featuredTemplate, otherTemplate;

  beforeAll(() => {
    featuredTemplate = env.document.getElementById('featured-card-template');
    otherTemplate = env.document.getElementById('other-item-template');
  });

  afterAll(() => {
    delete globalThis.document;
    delete globalThis.window;
  });

  it('count equals the number of valid featured projects', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('featured'), { minLength: 0, maxLength: 6 }),
        (projects) => {
          const container = env.document.createElement('ul');
          const count = renderList(projects, 'featured', container, featuredTemplate);
          const validCount = projects.filter((p) => validateProject(p, 'featured')).length;

          expect(count).toBe(validCount);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('count equals the number of valid other projects', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('other'), { minLength: 0, maxLength: 8 }),
        (projects) => {
          const container = env.document.createElement('ul');
          const count = renderList(projects, 'other', container, otherTemplate);
          const validCount = projects.filter((p) => validateProject(p, 'other')).length;

          expect(count).toBe(validCount);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('each valid featured project produces exactly one child in the container', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('featured'), { minLength: 1, maxLength: 5 }),
        (projects) => {
          const container = env.document.createElement('ul');
          const count = renderList(projects, 'featured', container, featuredTemplate);

          expect(container.children.length).toBe(count);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('each valid other project produces exactly one child in the container', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('other'), { minLength: 1, maxLength: 8 }),
        (projects) => {
          const container = env.document.createElement('ul');
          const count = renderList(projects, 'other', container, otherTemplate);

          expect(container.children.length).toBe(count);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('rendering the same featured data twice produces identical DOM output (idempotent)', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('featured'), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const container = env.document.createElement('ul');

          // First render
          renderList(projects, 'featured', container, featuredTemplate);
          const firstHTML = container.innerHTML;
          const firstChildCount = container.children.length;

          // Second render with the same data
          renderList(projects, 'featured', container, featuredTemplate);
          const secondHTML = container.innerHTML;
          const secondChildCount = container.children.length;

          expect(secondChildCount).toBe(firstChildCount);
          expect(secondHTML).toBe(firstHTML);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('rendering the same other data twice produces identical DOM output (idempotent)', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('other'), { minLength: 1, maxLength: 6 }),
        (projects) => {
          const container = env.document.createElement('ul');

          // First render
          renderList(projects, 'other', container, otherTemplate);
          const firstHTML = container.innerHTML;
          const firstChildCount = container.children.length;

          // Second render with the same data
          renderList(projects, 'other', container, otherTemplate);
          const secondHTML = container.innerHTML;
          const secondChildCount = container.children.length;

          expect(secondChildCount).toBe(firstChildCount);
          expect(secondHTML).toBe(firstHTML);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('invalid projects are skipped and do not affect count or DOM', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('featured'), { minLength: 1, maxLength: 3 }),
        fc.array(arbitraryJson(), { minLength: 1, maxLength: 3 }),
        (validProjects, invalidItems) => {
          // Mix valid and invalid items
          const mixed = [...validProjects, ...invalidItems];
          const container = env.document.createElement('ul');
          const count = renderList(mixed, 'featured', container, featuredTemplate);

          // Count should equal only the valid projects
          const expectedValid = mixed.filter((p) => validateProject(p, 'featured')).length;
          expect(count).toBe(expectedValid);
          expect(container.children.length).toBe(expectedValid);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('invalid projects among other items are skipped without affecting siblings', () => {
    fc.assert(
      fc.property(
        fc.array(validProject('other'), { minLength: 1, maxLength: 4 }),
        fc.array(arbitraryJson(), { minLength: 1, maxLength: 3 }),
        (validProjects, invalidItems) => {
          const mixed = [...validProjects, ...invalidItems];
          const container = env.document.createElement('ul');
          const count = renderList(mixed, 'other', container, otherTemplate);

          const expectedValid = mixed.filter((p) => validateProject(p, 'other')).length;
          expect(count).toBe(expectedValid);
          expect(container.children.length).toBe(expectedValid);
        }
      ),
      { numRuns: 12 }
    );
  });
});
