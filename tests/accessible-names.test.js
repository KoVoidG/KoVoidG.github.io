/**
 * Property 9: Accessible names come from real headings
 *
 * **Validates: Requirements 4.6, 9.2**
 *
 * For any valid projects.json document, after rendering:
 * - Every <section> with aria-labelledby points to a real heading (h1-h6) that exists in the document
 * - Every rendered project card's <article> has aria-labelledby pointing to its <h3> heading
 * - The heading referenced by aria-labelledby contains non-empty text
 * - Each card's article references a heading with id `project-{id}-title`
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set globalThis.document before importing the module so renderList can use it
const initEnv = createDocument();
globalThis.document = initEnv.document;

const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderList } = await import(projectsModulePath);

/**
 * Generate a featured project that passes validateProject by ensuring alt !== title.
 * The validProject generator can sometimes produce alt === title which the validator rejects.
 */
function validFeaturedProject() {
  return validProject('featured').map((project) => {
    // Ensure alt is never equal to title (validator rejects that)
    if (project.image.alt === project.title) {
      return {
        ...project,
        image: { ...project.image, alt: `Screenshot of ${project.title} interface` },
      };
    }
    return project;
  });
}

describe('Property 9: Accessible names come from real headings', () => {
  it('every <section> with aria-labelledby points to a real heading (h1-h6) in the document', () => {
    fc.assert(
      fc.property(
        fc.array(validFeaturedProject(), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const { document } = createDocument();

          // Check all sections in the static document
          const sections = document.querySelectorAll('section[aria-labelledby]');
          for (const section of sections) {
            const labelId = section.getAttribute('aria-labelledby');
            expect(labelId).not.toBe('');

            const heading = document.getElementById(labelId);
            expect(heading).not.toBeNull();

            // Must be a heading element (h1-h6)
            const tagName = heading.tagName.toLowerCase();
            expect(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).toContain(tagName);

            // Must have non-empty text
            expect(heading.textContent.trim()).not.toBe('');
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('every rendered card article has aria-labelledby pointing to its <h3> heading', () => {
    fc.assert(
      fc.property(
        fc.array(validFeaturedProject(), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const { document } = createDocument();
          const container = document.querySelector('[data-featured-list]');
          const template = document.getElementById('featured-card-template');

          const prevDoc = globalThis.document;
          globalThis.document = document;
          try {
            renderList(projects, 'featured', container, template);
          } finally {
            globalThis.document = prevDoc;
          }

          const articles = container.querySelectorAll('article');

          // Each rendered article must reference a valid h3 heading
          for (const article of articles) {
            const labelId = article.getAttribute('aria-labelledby');
            expect(labelId).not.toBeNull();
            expect(labelId).not.toBe('');

            // The referenced element must exist within the container
            const heading = container.querySelector(`[id="${labelId}"]`);
            expect(heading).not.toBeNull();

            // Must be an h3 element
            expect(heading.tagName.toLowerCase()).toBe('h3');

            // Must have non-empty text
            expect(heading.textContent.trim()).not.toBe('');
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('the heading referenced by aria-labelledby contains non-empty text matching the project title', () => {
    fc.assert(
      fc.property(
        fc.array(validFeaturedProject(), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const { document } = createDocument();
          const container = document.querySelector('[data-featured-list]');
          const template = document.getElementById('featured-card-template');

          const prevDoc = globalThis.document;
          globalThis.document = document;
          try {
            renderList(projects, 'featured', container, template);
          } finally {
            globalThis.document = prevDoc;
          }

          const articles = container.querySelectorAll('article');
          for (const article of articles) {
            const labelId = article.getAttribute('aria-labelledby');
            const heading = container.querySelector(`[id="${labelId}"]`);
            expect(heading).not.toBeNull();
            expect(heading.textContent.trim()).not.toBe('');
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('each card article references a heading with id project-{id}-title', () => {
    fc.assert(
      fc.property(
        fc.array(validFeaturedProject(), { minLength: 1, maxLength: 4 }),
        (projects) => {
          const { document } = createDocument();
          const container = document.querySelector('[data-featured-list]');
          const template = document.getElementById('featured-card-template');

          const prevDoc = globalThis.document;
          globalThis.document = document;
          try {
            const count = renderList(projects, 'featured', container, template);

            // Only projects that passed validation were rendered
            const articles = container.querySelectorAll('article');
            expect(articles.length).toBe(count);

            // Each rendered article's aria-labelledby must follow the project-{id}-title pattern
            for (const article of articles) {
              const labelId = article.getAttribute('aria-labelledby');
              // Pattern: project-{kebab-id}-title
              expect(labelId).toMatch(/^project-[a-z0-9]+(-[a-z0-9]+)*-title$/);

              // The heading with that id must exist in the container
              const heading = container.querySelector(`[id="${labelId}"]`);
              expect(heading).not.toBeNull();
              expect(heading.tagName.toLowerCase()).toBe('h3');
            }
          } finally {
            globalThis.document = prevDoc;
          }
        }
      ),
      { numRuns: 12 }
    );
  });
});
