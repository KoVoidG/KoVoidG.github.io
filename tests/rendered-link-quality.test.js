/**
 * Property 10: Rendered links are meaningful, addressable, and safe
 *
 * **Validates: Requirements 4.7, 4.8, 16.4**
 *
 * For any valid project, every rendered <a> has:
 * - Non-empty meaningful text content (not "Click here", "Link", "Here", "Read more", or empty)
 * - Link text follows the pattern: "View {title} source" / "Open {title} live demo" / "Read the {title} case study"
 * - An href attribute with an absolute https:// URL
 * - rel="noopener" on every external link
 * - Links appear in repo → demo → caseStudy order
 * - At most 3 links per card
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

/**
 * Create a template element matching the featured card template from index.html.
 * We pull it from the real document so we stay in sync with the source.
 */
function getTemplate() {
  const { document } = createDocument();
  return document.getElementById('featured-card-template');
}

/** Known meaningless link texts that must never appear */
const MEANINGLESS_TEXTS = ['link', 'click here', 'here', 'read more', ''];

/** The expected link kinds in contractual order */
const LINK_KINDS = [
  { key: 'repo', label: (title) => `View ${title} source` },
  { key: 'demo', label: (title) => `Open ${title} live demo` },
  { key: 'caseStudy', label: (title) => `Read the ${title} case study` },
];

describe('Property 10: Rendered links are meaningful, addressable, and safe', () => {
  it('every rendered link has non-empty meaningful text (not a banned phrase)', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = fragment.querySelectorAll('a');

          for (const anchor of anchors) {
            const text = anchor.textContent.trim();
            // Not empty
            expect(text.length).toBeGreaterThan(0);
            // Not one of the meaningless texts
            expect(MEANINGLESS_TEXTS).not.toContain(text.toLowerCase());
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('link text follows the label pattern from the project title', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = fragment.querySelectorAll('[data-links] a');

          // Build expected labels for this project's links
          const expectedLabels = LINK_KINDS
            .filter((kind) => project.links[kind.key])
            .map((kind) => kind.label(project.title));

          const actualTexts = Array.from(anchors).map((a) => a.textContent);

          expect(actualTexts).toEqual(expectedLabels);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('every rendered link has an href with an absolute https:// URL', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = fragment.querySelectorAll('[data-links] a');

          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            expect(href).not.toBeNull();
            expect(href).not.toBe('');
            expect(href).not.toBe('#');
            expect(href.startsWith('https://')).toBe(true);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('every external link has rel="noopener"', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = fragment.querySelectorAll('[data-links] a');

          for (const anchor of anchors) {
            const rel = anchor.getAttribute('rel');
            expect(rel).not.toBeNull();
            expect(rel).toContain('noopener');
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('links appear in repo → demo → caseStudy order', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = Array.from(fragment.querySelectorAll('[data-links] a'));

          // Determine which link keys are present in this project
          const presentKeys = LINK_KINDS
            .filter((kind) => project.links[kind.key])
            .map((kind) => kind.key);

          // For each rendered anchor, identify its kind from the URL
          const renderedKeys = anchors.map((a) => {
            const href = a.getAttribute('href');
            for (const kind of LINK_KINDS) {
              if (project.links[kind.key] === href) return kind.key;
            }
            return null;
          });

          // The rendered order must match the contractual order
          expect(renderedKeys).toEqual(presentKeys);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('renders at most 3 links per card', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);
          const anchors = fragment.querySelectorAll('[data-links] a');

          expect(anchors.length).toBeLessThanOrEqual(3);
        }
      ),
      { numRuns: 15 }
    );
  });
});
