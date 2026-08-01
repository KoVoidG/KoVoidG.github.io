/**
 * Property 17: Image dimensions precede insertion
 *
 * **Validates: Requirements 10.6**
 *
 * Every `<img>` in a rendered featured card has positive integer `width` and
 * `height` attributes set on the detached fragment BEFORE it would be inserted
 * into the document. Width and height are always >= 1 (positive integers, never
 * 0, never negative, never floating point, never empty strings).
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { validProject } from './generators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderCard } = await import(projectsModulePath);

/**
 * Create a minimal DOM with the featured card template for rendering.
 */
function createTemplateDOM() {
  const html = `<!DOCTYPE html><html><body>
    <template id="featured-card-template">
      <li class="project-card" data-reveal>
        <article class="project-card__body" aria-labelledby="">
          <img class="project-card__image" alt="" width="" height=""
               loading="lazy" decoding="async">
          <p class="label project-card__meta">
            <span data-year></span>
            <span data-status></span>
          </p>
          <h3 class="project-card__title" data-title></h3>
          <p class="project-card__tagline" data-tagline></p>
          <p class="project-card__summary" data-summary></p>
          <p class="project-card__role label" data-role></p>
          <ul class="tag-list" data-tech>
            <template data-tech-item><li class="tag"></li></template>
          </ul>
          <ul class="project-card__highlights" data-highlights>
            <template data-highlight-item><li></li></template>
          </ul>
          <ul class="link-list" data-links>
            <template data-link-item><li><a class="link" href="" rel="noopener"></a></li></template>
          </ul>
        </article>
      </li>
    </template>
  </body></html>`;

  const dom = new JSDOM(html, { url: 'http://localhost:8000/' });
  return dom.window.document.querySelector('#featured-card-template');
}

describe('Property 17: Image dimensions precede insertion', () => {
  const template = createTemplateDOM();

  it('rendered fragment carries positive integer width and height on img before DOM insertion', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const fragment = renderCard(project, template);

          // Fragment is detached — not yet inserted into any live document
          const img = fragment.querySelector('img');
          expect(img).not.toBeNull();

          const widthAttr = img.getAttribute('width');
          const heightAttr = img.getAttribute('height');

          // Attributes must be present and non-empty
          expect(widthAttr).not.toBeNull();
          expect(widthAttr).not.toBe('');
          expect(heightAttr).not.toBeNull();
          expect(heightAttr).not.toBe('');

          // Parse as numbers
          const w = Number(widthAttr);
          const h = Number(heightAttr);

          // Must be positive integers >= 1 (not zero, not floats)
          expect(Number.isInteger(w)).toBe(true);
          expect(Number.isInteger(h)).toBe(true);
          expect(w).toBeGreaterThanOrEqual(1);
          expect(h).toBeGreaterThanOrEqual(1);

          // String representation must be a clean integer (no decimal point)
          expect(widthAttr).toBe(String(Math.trunc(w)));
          expect(heightAttr).toBe(String(Math.trunc(h)));
        }
      ),
      { numRuns: 15 }
    );
  });
});
