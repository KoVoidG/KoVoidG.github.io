/**
 * Property 12: Rendered URLs are https-only
 *
 * **Validates: Requirements 16.3, 16.7**
 *
 * Every href attribute in rendered cards uses https:// scheme only.
 * Links with http://, ftp://, javascript:, data:, or relative URLs are never rendered.
 * The renderCard function only renders links that pass the https:// check.
 * Image src in rendered cards follows the allowed URL pattern (relative paths for
 * local assets are acceptable for images).
 */

import { describe, it, expect } from '@jest/globals';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { validProject } from './generators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load index.html for the template
const htmlPath = resolve(__dirname, '..', 'index.html');
const htmlSource = readFileSync(htmlPath, 'utf-8');

// Import the module under test
const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { renderCard } = await import(projectsModulePath);

/**
 * Create a fresh DOM and return the featured card template element.
 */
function getTemplate() {
  const dom = new JSDOM(htmlSource, {
    url: 'http://localhost:8000/',
    contentType: 'text/html',
  });
  return dom.window.document.getElementById('featured-card-template');
}

/**
 * Generator: URL schemes that are forbidden in href attributes.
 */
const forbiddenSchemeUrl = () =>
  fc.oneof(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/.-_'), { minLength: 1, maxLength: 30 })
      .map((path) => `http://${path}.com/${path}`),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/.-_'), { minLength: 1, maxLength: 30 })
      .map((path) => `ftp://${path}.com/${path}`),
    fc.constant('javascript:alert(1)'),
    fc.constant('javascript:void(0)'),
    fc.constant('data:text/html,<script>alert(1)</script>'),
    fc.constant('data:text/plain,hello'),
    fc.constant('vbscript:msgbox'),
    fc.constant('file:///etc/passwd'),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/.-'), { minLength: 1, maxLength: 20 })
      .map((path) => `/${path}`),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/.-'), { minLength: 1, maxLength: 20 })
      .map((path) => `./local/${path}`),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789/.-'), { minLength: 1, maxLength: 20 })
      .map((path) => `//cdn.example.com/${path}`)
  );

describe('Property 12: Rendered URLs are https-only', () => {
  it('every href in a rendered card from a valid project uses https://', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);

          const anchors = fragment.querySelectorAll('a[href]');
          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            expect(href.startsWith('https://')).toBe(true);
          }
        }
      ),
      { numRuns: 15 }
    );
  });

  it('projects with forbidden-scheme links render no href carrying that scheme', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        forbiddenSchemeUrl(),
        (project, badUrl) => {
          // Replace all links with the forbidden URL
          const mutated = {
            ...project,
            links: { repo: badUrl, demo: badUrl, caseStudy: badUrl },
          };
          const template = getTemplate();
          const fragment = renderCard(mutated, template);

          const anchors = fragment.querySelectorAll('a[href]');
          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            // No rendered href should carry a non-https scheme
            expect(href.startsWith('https://')).toBe(true);
          }
          // With all links forbidden, no anchors should be rendered in the links list
          const linksList = fragment.querySelector('[data-links]');
          // Links list should be removed since no valid links
          expect(linksList).toBeNull();
        }
      ),
      { numRuns: 15 }
    );
  });

  it('mixed valid and invalid links render only the https:// ones', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        forbiddenSchemeUrl(),
        (project, badUrl) => {
          const validUrl = 'https://github.com/example/repo';
          // One valid link, rest forbidden
          const mutated = {
            ...project,
            links: { repo: validUrl, demo: badUrl, caseStudy: badUrl },
          };
          const template = getTemplate();
          const fragment = renderCard(mutated, template);

          const anchors = fragment.querySelectorAll('a[href]');
          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            expect(href.startsWith('https://')).toBe(true);
          }
          // Only the valid repo link should render
          const renderedHrefs = Array.from(anchors).map((a) => a.getAttribute('href'));
          expect(renderedHrefs).toContain(validUrl);
          // Forbidden URLs never appear
          expect(renderedHrefs).not.toContain(badUrl);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('image src uses local relative path (assets/img/...) not an arbitrary URL scheme', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          const template = getTemplate();
          const fragment = renderCard(project, template);

          const img = fragment.querySelector('img');
          const src = img.getAttribute('src');
          // Image src should be a local asset path starting with assets/ (relative for local images)
          expect(src.startsWith('assets/')).toBe(true);
          // Should not be an absolute URL with a dangerous scheme
          expect(src.startsWith('javascript:')).toBe(false);
          expect(src.startsWith('data:')).toBe(false);
          expect(src.startsWith('http://')).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('no rendered href contains javascript:, data:, vbscript:, or file: scheme', () => {
    const dangerousUrls = [
      'javascript:alert(1)',
      'javascript:void(0)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
      'file:///etc/passwd',
    ];

    fc.assert(
      fc.property(
        validProject('featured'),
        fc.constantFrom(...dangerousUrls),
        (project, dangerousUrl) => {
          const mutated = {
            ...project,
            links: { repo: dangerousUrl },
          };
          const template = getTemplate();
          const fragment = renderCard(mutated, template);

          // No anchor should have an href with a dangerous scheme
          const anchors = fragment.querySelectorAll('a[href]');
          for (const anchor of anchors) {
            const href = anchor.getAttribute('href');
            expect(href.startsWith('javascript:')).toBe(false);
            expect(href.startsWith('data:')).toBe(false);
            expect(href.startsWith('vbscript:')).toBe(false);
            expect(href.startsWith('file:')).toBe(false);
          }
        }
      ),
      { numRuns: 15 }
    );
  });
});
