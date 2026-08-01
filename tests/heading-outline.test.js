/**
 * Property 14: The heading outline survives rendering
 *
 * **Validates: Requirements 1.4**
 *
 * After rendering featured projects into the document:
 * 1. The document still has exactly one <h1>
 * 2. Headings descend without skipping levels (h1→h2→h3, no h1→h3 skip)
 * 3. Project cards add h3 headings inside the featured-projects section (under
 *    the section's h2), maintaining the correct nesting
 * 4. The heading hierarchy is valid regardless of how many projects render
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set globalThis.document before importing the module so renderList can use
// document.createDocumentFragment() internally
const initEnv = createDocument();
globalThis.document = initEnv.document;

const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderList } = await import(projectsModulePath);

/**
 * Ensure the generated project passes the validator (alt !== title).
 */
function validFeaturedProject() {
  return validProject('featured').map((project) => {
    if (project.image.alt === project.title) {
      return {
        ...project,
        image: { ...project.image, alt: `Screenshot of ${project.title} dashboard` },
      };
    }
    return project;
  });
}

/**
 * Collect all heading levels (1-6) in document order.
 */
function collectHeadingLevels(doc) {
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  return Array.from(headings).map((h) => parseInt(h.tagName[1], 10));
}

/**
 * Verify that the heading sequence never skips a level going deeper.
 * h1→h2→h3 is fine, h1→h3 is not. Going back up (h3→h2) is always allowed.
 */
function headingsNeverSkipLevel(levels) {
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    const curr = levels[i];
    // Going deeper by more than 1 level is a skip
    if (curr > prev + 1) {
      return { valid: false, at: i, from: prev, to: curr };
    }
  }
  return { valid: true };
}

describe('Property 14: The heading outline survives rendering', () => {
  it('exactly one h1 and no skipped heading levels after rendering 1-4 featured projects', () => {
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

          // 1. Exactly one <h1>
          const h1s = document.querySelectorAll('h1');
          expect(h1s.length).toBe(1);

          // 2. Headings never skip levels
          const levels = collectHeadingLevels(document);
          const result = headingsNeverSkipLevel(levels);
          expect(result.valid).toBe(true);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('project cards add h3 headings inside the featured-projects section under its h2', () => {
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

          const section = document.getElementById('featured-projects');
          expect(section).not.toBeNull();

          // The section must have its own h2
          const sectionH2 = section.querySelector('h2');
          expect(sectionH2).not.toBeNull();

          // Card headings inside the section must be h3
          const cardHeadings = container.querySelectorAll('h3');
          const renderedCount = container.querySelectorAll('article').length;
          expect(cardHeadings.length).toBe(renderedCount);

          // Each card h3 is inside the featured-projects section (nested under h2)
          for (const h3 of cardHeadings) {
            expect(section.contains(h3)).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('heading hierarchy is valid regardless of how many projects render', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }).chain((n) =>
          fc.array(validFeaturedProject(), { minLength: n, maxLength: n })
        ),
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

          // Full heading outline must start with h1 and never skip
          const levels = collectHeadingLevels(document);
          expect(levels.length).toBeGreaterThan(0);
          expect(levels[0]).toBe(1);

          const result = headingsNeverSkipLevel(levels);
          expect(result.valid).toBe(true);

          // No heading level beyond h3 should appear from our cards
          const cardHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          for (const h of cardHeadings) {
            const level = parseInt(h.tagName[1], 10);
            expect(level).toBe(3);
          }
        }
      ),
      { numRuns: 12 }
    );
  });
});
