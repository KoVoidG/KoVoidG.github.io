/**
 * Property 8: Absent optional fields leave no empty element
 *
 * **Validates: Requirements 4.5**
 *
 * When a featured project has absent optional fields (status, summary, role empty
 * or missing), the rendered card contains NO empty elements for those fields — they
 * are removed entirely. When highlights are absent/empty, the highlights list
 * container is removed. When no valid links exist, the links list container is
 * removed. When tech array is empty, the tech list container is removed.
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import of the ES module under test
const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderCard } = await import(projectsModulePath);

// Optional text fields that renderCard removes when absent/empty
const OPTIONAL_TEXT_FIELDS = ['summary', 'role', 'status'];

/**
 * Generator: a valid featured project with a random subset of optional text fields
 * removed, plus optionally empty highlights.
 */
function projectWithAbsentOptionals() {
  return fc.tuple(
    validProject('featured'),
    fc.subarray(OPTIONAL_TEXT_FIELDS, { minLength: 1, maxLength: OPTIONAL_TEXT_FIELDS.length }),
    fc.boolean() // whether to also remove highlights
  ).map(([project, fieldsToRemove, removeHighlights]) => {
    const modified = { ...project };
    const absentFields = [...fieldsToRemove];
    for (const field of fieldsToRemove) {
      delete modified[field];
    }
    if (removeHighlights) {
      modified.highlights = [];
      absentFields.push('highlights');
    }
    return { project: modified, absentFields };
  });
}

/**
 * Generator: a valid featured project with optional text fields set to whitespace.
 */
function projectWithWhitespaceOptionals() {
  return fc.tuple(
    validProject('featured'),
    fc.subarray(OPTIONAL_TEXT_FIELDS, { minLength: 1, maxLength: 3 })
  ).map(([project, fieldsToEmpty]) => {
    const modified = { ...project };
    for (const field of fieldsToEmpty) {
      modified[field] = '   ';
    }
    return { project: modified, absentFields: fieldsToEmpty };
  });
}

/**
 * Generator: a valid featured project with links that are all non-https (invalid),
 * so no links render and the container should be removed.
 */
function projectWithNoValidLinks() {
  return validProject('featured').map((project) => {
    const modified = { ...project };
    // Replace all link values with non-https URLs that renderCard skips
    modified.links = { repo: 'http://not-https.com/repo' };
    return modified;
  });
}

/**
 * Generator: a valid featured project with an empty tech array.
 */
function projectWithEmptyTech() {
  return validProject('featured').map((project) => {
    const modified = { ...project };
    modified.tech = [];
    return modified;
  });
}

describe('Property 8: Absent optional fields leave no empty element', () => {
  let document, template;

  beforeAll(() => {
    const env = createDocument();
    document = env.document;
    template = document.getElementById('featured-card-template');
  });

  it('absent optional fields have their hook elements removed entirely', () => {
    fc.assert(
      fc.property(
        projectWithAbsentOptionals(),
        ({ project, absentFields }) => {
          const fragment = renderCard(project, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          const hookSelectors = {
            summary: '[data-summary]',
            role: '[data-role]',
            status: '[data-status]',
            highlights: '[data-highlights]',
          };

          for (const field of absentFields) {
            const el = container.querySelector(hookSelectors[field]);
            expect(el).toBeNull();
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('whitespace-only optional fields have their hook elements removed', () => {
    fc.assert(
      fc.property(
        projectWithWhitespaceOptionals(),
        ({ project, absentFields }) => {
          const fragment = renderCard(project, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          const hookSelectors = {
            summary: '[data-summary]',
            role: '[data-role]',
            status: '[data-status]',
          };

          for (const field of absentFields) {
            const el = container.querySelector(hookSelectors[field]);
            expect(el).toBeNull();
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('when highlights are absent/empty the highlights list container is removed', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const modified = { ...project, highlights: [] };
          const fragment = renderCard(modified, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          expect(container.querySelector('[data-highlights]')).toBeNull();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('when no valid links exist the links list container is removed', () => {
    fc.assert(
      fc.property(
        projectWithNoValidLinks(),
        (project) => {
          const fragment = renderCard(project, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          expect(container.querySelector('[data-links]')).toBeNull();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('when tech array is empty the tech list container is removed', () => {
    fc.assert(
      fc.property(
        projectWithEmptyTech(),
        (project) => {
          const fragment = renderCard(project, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          expect(container.querySelector('[data-tech]')).toBeNull();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('no remaining optional hook element has empty or whitespace-only content', () => {
    fc.assert(
      fc.property(
        projectWithAbsentOptionals(),
        ({ project }) => {
          const fragment = renderCard(project, template);
          const container = document.createElement('div');
          container.appendChild(fragment);

          // Any optional hook that still exists must carry real content
          for (const selector of ['[data-summary]', '[data-role]', '[data-status]']) {
            const el = container.querySelector(selector);
            if (el) {
              expect(el.textContent.trim()).not.toBe('');
            }
          }

          // If highlights list exists, every li must have content
          const highlightsList = container.querySelector('[data-highlights]');
          if (highlightsList) {
            const items = highlightsList.querySelectorAll('li');
            expect(items.length).toBeGreaterThan(0);
            for (const item of items) {
              expect(item.textContent.trim()).not.toBe('');
            }
          }

          // If tech list exists, every li must have content
          const techList = container.querySelector('[data-tech]');
          if (techList) {
            const items = techList.querySelectorAll('li');
            for (const item of items) {
              expect(item.textContent.trim()).not.toBe('');
            }
          }

          // If links list exists, every anchor must have content
          const linksList = container.querySelector('[data-links]');
          if (linksList) {
            const anchors = linksList.querySelectorAll('a');
            for (const anchor of anchors) {
              expect(anchor.textContent.trim()).not.toBe('');
            }
          }
        }
      ),
      { numRuns: 15 }
    );
  });
});
