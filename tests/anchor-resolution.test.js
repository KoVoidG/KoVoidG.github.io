/**
 * Property 15: Every in-page anchor resolves
 *
 * **Validates: Requirements 1.6**
 *
 * Every `<a href="#...">` in the document resolves to an existing element with
 * that id. This holds both before rendering projects (static anchors like
 * #about, #main, #resume) and after rendering (dynamic ids like
 * project-{id}-title created by renderCard). No broken in-page links exist
 * after rendering.
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

describe('Property 15: Every in-page anchor resolves', () => {
  let featuredTemplate, featuredList;

  beforeAll(() => {
    featuredTemplate = env.document.getElementById('featured-card-template');
    featuredList = env.document.querySelector('[data-featured-list]');
  });

  it('all static in-page anchors resolve before rendering projects', () => {
    // Clear any previously rendered content
    renderList([], 'featured', featuredList, featuredTemplate);

    const anchors = env.document.querySelectorAll('a[href^="#"]');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      const targetId = href.slice(1);
      // Skip empty fragment (#)
      if (!targetId) continue;
      const target = env.document.getElementById(targetId);
      expect(target).not.toBeNull();
    }
  });

  it('all in-page anchors resolve after rendering featured projects', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 1,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          // Collect every in-page anchor in the entire document
          const anchors = env.document.querySelectorAll('a[href^="#"]');

          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            const targetId = href.slice(1);
            if (!targetId) continue;

            const target = env.document.getElementById(targetId);
            expect(target).not.toBeNull();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('no broken in-page links exist after rendering multiple projects', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(validProject('featured'), {
          minLength: 2,
          maxLength: 4,
          comparator: (a, b) => a.id === b.id,
        }),
        (projects) => {
          renderList(projects, 'featured', featuredList, featuredTemplate);

          const anchors = env.document.querySelectorAll('a[href^="#"]');
          const broken = [];

          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            const targetId = href.slice(1);
            if (!targetId) continue;

            if (!env.document.getElementById(targetId)) {
              broken.push(href);
            }
          }

          expect(broken).toEqual([]);
        }
      ),
      { numRuns: 12 }
    );
  });
});
