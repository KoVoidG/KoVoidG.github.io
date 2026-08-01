/**
 * Property 16: Internal references stay relative
 *
 * **Validates: Requirements 15.1, 14.4**
 *
 * All internal resource references (CSS links, script src, font preloads,
 * image src) use relative paths with no leading slash. After rendering
 * projects, any image src attributes in cards start with "assets/" (relative)
 * not "/" or "http". The only absolute URLs in the document are external links
 * (https://github.com/..., https://linkedin.com/..., etc.) and the
 * canonical/og:url meta tags.
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
 * Check if a URL is an allowed absolute URL (external link or meta tag value).
 * External links to github, linkedin, x.com, etc. and mailto: are allowed.
 */
function isAllowedAbsoluteUrl(url) {
  if (url.startsWith('https://')) return true;
  if (url.startsWith('mailto:')) return true;
  return false;
}

/**
 * Check if an element is in a context where absolute URLs are expected:
 * - <link rel="canonical">
 * - <meta property="og:url">
 * - <meta property="og:image"> (may be absolute for social sharing)
 * - <a> elements (external links are allowed to be absolute https://)
 * - JSON-LD script blocks
 * - Person structured data
 */
function isAbsoluteUrlContext(element, attrName) {
  const tag = element.tagName.toLowerCase();

  // <a href="https://..."> external links are fine
  if (tag === 'a' && attrName === 'href') return true;

  // <link rel="canonical"> must be absolute
  if (tag === 'link' && element.getAttribute('rel') === 'canonical') return true;

  // <meta property="og:url"> and <meta property="og:image"> are absolute
  if (tag === 'meta') {
    const prop = element.getAttribute('property');
    if (prop === 'og:url' || prop === 'og:image') return true;
  }

  return false;
}

describe('Property 16: Internal references stay relative', () => {
  it('all stylesheet, script, preload, and img references use relative paths (no leading slash)', () => {
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

          // Collect all internal resource references
          const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
          const scripts = document.querySelectorAll('script[src]');
          const preloads = document.querySelectorAll('link[rel="preload"]');
          const images = document.querySelectorAll('img');

          // Stylesheets: href must not start with "/"
          for (const el of stylesheets) {
            const href = el.getAttribute('href');
            expect(href).not.toBeNull();
            expect(href.startsWith('/')).toBe(false);
            expect(href.startsWith('http')).toBe(false);
          }

          // Scripts: src must not start with "/"
          for (const el of scripts) {
            const src = el.getAttribute('src');
            expect(src).not.toBeNull();
            expect(src.startsWith('/')).toBe(false);
            expect(src.startsWith('http')).toBe(false);
          }

          // Preloads: href must not start with "/"
          for (const el of preloads) {
            const href = el.getAttribute('href');
            expect(href).not.toBeNull();
            expect(href.startsWith('/')).toBe(false);
            expect(href.startsWith('http')).toBe(false);
          }

          // Images: src must not start with "/"
          for (const el of images) {
            const src = el.getAttribute('src');
            if (src && src.length > 0) {
              expect(src.startsWith('/')).toBe(false);
              expect(src.startsWith('http')).toBe(false);
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('rendered project card images start with "assets/" (relative)', () => {
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

          // All card images must use relative paths starting with "assets/"
          const cardImages = container.querySelectorAll('img');
          for (const img of cardImages) {
            const src = img.getAttribute('src');
            expect(src).not.toBeNull();
            expect(src.startsWith('assets/')).toBe(true);
            expect(src.startsWith('/')).toBe(false);
            expect(src.startsWith('http')).toBe(false);
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('only absolute URLs in the document are external links and canonical/og meta tags', () => {
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

          // Collect all href and src attributes from resource elements
          // (not <a> or canonical/og meta — those are allowed to be absolute)
          const resourceSelectors = [
            'link[rel="stylesheet"]',
            'script[src]',
            'link[rel="preload"]',
            'img',
          ];

          for (const sel of resourceSelectors) {
            const elements = document.querySelectorAll(sel);
            for (const el of elements) {
              const attr = sel.includes('[src]') || el.tagName.toLowerCase() === 'img' ? 'src' : 'href';
              const value = el.getAttribute(attr);
              if (value && value.length > 0) {
                // Internal resources must never be absolute
                expect(value.startsWith('/')).toBe(false);
                expect(value.startsWith('http://')).toBe(false);
                expect(value.startsWith('https://')).toBe(false);
              }
            }
          }

          // Verify that absolute URLs only appear in allowed contexts
          const allElements = document.querySelectorAll('[href], [src]');
          for (const el of allElements) {
            const href = el.getAttribute('href');
            const src = el.getAttribute('src');

            if (href && (href.startsWith('https://') || href.startsWith('http://'))) {
              // Must be an allowed absolute URL context
              expect(isAbsoluteUrlContext(el, 'href')).toBe(true);
            }

            if (src && (src.startsWith('https://') || src.startsWith('http://') || src.startsWith('/'))) {
              // src on resource elements must never be absolute
              const tag = el.tagName.toLowerCase();
              if (tag === 'img' || tag === 'script') {
                expect(src.startsWith('/')).toBe(false);
                expect(src.startsWith('http')).toBe(false);
              }
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });
});
