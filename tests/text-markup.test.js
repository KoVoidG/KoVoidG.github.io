/**
 * Property 11: Text is never interpreted as markup
 *
 * **Validates: Requirements 16.2**
 *
 * For any project whose string fields contain hostile characters (<, >, &, quotes,
 * script tags, event handlers, etc.), the rendered card contains each string as a
 * text node whose textContent equals the input exactly, and the card's element-node
 * count equals the element-node count of an unfilled clone of the same template.
 * A generated title of `<img src=x onerror=alert(1)>` produces zero additional elements.
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { validProject, hostileString } from './generators.js';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderCard } = await import(projectsModulePath);

/**
 * Get the featured card template from a fresh document.
 */
function getTemplate() {
  const { document } = createDocument();
  return document.getElementById('featured-card-template');
}

/**
 * Count all descendant elements in a fragment/node.
 */
function countElements(root) {
  return root.querySelectorAll('*').length;
}

/**
 * Get the baseline element count for a rendered card with the same optional fields present.
 * Renders a safe project (no hostile chars) to establish the baseline.
 */
function getBaselineElementCount(template, project) {
  // Create a safe version of the project with no markup characters
  const safeProject = {
    ...project,
    title: 'Safe Title',
    tagline: 'A safe tagline here',
    summary: project.summary ? 'A'.repeat(200) : undefined,
    role: project.role ? 'Safe Role' : undefined,
    status: project.status || 'shipped',
    tech: project.tech.map((_, i) => `tech${i}`),
    highlights: project.highlights
      ? project.highlights.map((_, i) => `Highlight number ${i} detail here`)
      : undefined,
    image: {
      ...project.image,
      alt: 'Safe alt text for the image',
    },
  };
  const fragment = renderCard(safeProject, template);
  return countElements(fragment);
}

describe('Property 11: Text is never interpreted as markup', () => {
  it('hostile title text appears as literal text, not DOM elements', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          // Inject hostile string into title (must be ≤60 chars for validation)
          const title = hostile.slice(0, 60) || '<script>';
          const testProject = { ...project, title };
          const fragment = renderCard(testProject, template);

          // The title element's textContent must equal the hostile input exactly
          const titleEl = fragment.querySelector('[data-title]');
          expect(titleEl.textContent).toBe(title);

          // No script/img/iframe elements should appear from the hostile text
          const scripts = fragment.querySelectorAll('script');
          const imgs = fragment.querySelectorAll('img.injected, img[onerror]');
          const iframes = fragment.querySelectorAll('iframe');
          expect(scripts.length).toBe(0);
          expect(iframes.length).toBe(0);
          // The only img should be the card's own image, not an injected one
          const allImgs = fragment.querySelectorAll('img');
          expect(allImgs.length).toBe(1); // only the card's own image
        }
      ),
      { numRuns: 50 }
    );
  });

  it('hostile tagline text is rendered as literal text', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          const tagline = hostile.slice(0, 80) || '<img onerror=alert(1)>';
          const testProject = { ...project, tagline };
          const fragment = renderCard(testProject, template);

          const taglineEl = fragment.querySelector('[data-tagline]');
          expect(taglineEl.textContent).toBe(tagline);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('hostile summary text is rendered as literal text', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          // summary must be 200-600 chars and non-empty after trim (renderCard removes
          // the element when trim() is empty). Prefix with a visible character to guarantee
          // the value survives the trim check inside renderCard.
          const base = 'X' + hostile;
          const summary = base.repeat(Math.ceil(200 / Math.max(base.length, 1))).slice(0, 600);
          const paddedSummary = summary.length < 200
            ? summary + 'A'.repeat(200 - summary.length)
            : summary;
          const testProject = { ...project, summary: paddedSummary };
          const fragment = renderCard(testProject, template);

          const summaryEl = fragment.querySelector('[data-summary]');
          expect(summaryEl.textContent).toBe(paddedSummary);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('hostile tech items are rendered as literal text', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          // tech items must be ≤24 chars, at least 3 items
          const techItem = hostile.slice(0, 24) || '<b>XSS</b>';
          const testProject = {
            ...project,
            tech: [techItem, 'SafeTech2', 'SafeTech3'],
          };
          const fragment = renderCard(testProject, template);

          const techList = fragment.querySelector('[data-tech]');
          const items = techList.querySelectorAll('li');
          // First item should contain the hostile text literally
          expect(items[0].textContent).toBe(techItem);

          // No injected bold/script/etc elements inside the tech list
          const boldInTech = techList.querySelectorAll('b');
          expect(boldInTech.length).toBe(0);
          const scriptsInTech = techList.querySelectorAll('script');
          expect(scriptsInTech.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('hostile highlights are rendered as literal text', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          // highlights must be 20-120 chars
          const base = hostile.slice(0, 100) || '<svg onload=alert(1)>';
          const highlight = base.length < 20
            ? base + ' '.repeat(20 - base.length)
            : base;
          const testProject = {
            ...project,
            highlights: [
              highlight,
              'A safe highlight with enough length',
            ],
          };
          const fragment = renderCard(testProject, template);

          const highlightsList = fragment.querySelector('[data-highlights]');
          const items = highlightsList.querySelectorAll('li');
          expect(items[0].textContent).toBe(highlight);

          // No SVG elements should be injected
          const svgs = highlightsList.querySelectorAll('svg');
          expect(svgs.length).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('rendered card element count stays constant regardless of hostile input', () => {
    const template = getTemplate();

    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (project, hostile) => {
          // Get baseline from a safe render with same optional fields
          const baselineCount = getBaselineElementCount(template, project);

          // Inject hostile string into title
          const title = hostile.slice(0, 60) || '<script>alert(1)</script>';
          const testProject = { ...project, title };
          const fragment = renderCard(testProject, template);
          const hostileCount = countElements(fragment);

          // Element count must remain the same — hostile text creates no new elements
          expect(hostileCount).toBe(baselineCount);
        }
      ),
      { numRuns: 50 }
    );
  });
});
