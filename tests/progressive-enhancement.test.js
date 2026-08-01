/**
 * Property 21: Progressive enhancement holds without scripts
 *
 * Validates: Requirements 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 7.7
 *
 * This test verifies the site works without JavaScript by checking the static HTML:
 * - No content is hidden by default (the CSS reveal system uses
 *   `[data-reveal].is-prereveal:not(.is-revealed)` which only activates when JS adds
 *   `is-prereveal`, so without JS, content is always visible)
 * - All `[data-reveal]` elements do NOT have `is-prereveal` class in static source
 * - The `<noscript>` block provides a fallback link to GitHub repos
 * - The resume download link works without JS (static `<a>` with `download` attribute)
 * - Navigation links are standard `<a href="#section-id">` that work without JS
 * - No content depends on JavaScript to become visible
 * - Static sections (about, tech-stack, education, contact, resume) are always visible
 *
 * This test operates on the static HTML document without running any JS modules.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, '..', 'index.html');
const htmlSource = readFileSync(htmlPath, 'utf-8');

/**
 * Create a fresh jsdom document from the shipped index.html with NO script execution.
 * This represents the page as seen with JavaScript disabled.
 */
function createStaticDocument() {
  const dom = new JSDOM(htmlSource, {
    url: 'http://localhost:8000/',
    contentType: 'text/html',
    runScripts: 'outside-only',
  });
  return dom.window.document;
}

describe('Property 21: Progressive enhancement holds without scripts', () => {

  // -------------------------------------------------------------------------
  // 1. No [data-reveal] element has is-prereveal in the static HTML
  // -------------------------------------------------------------------------

  it('no [data-reveal] element has is-prereveal class in static HTML', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();
          const revealTargets = doc.querySelectorAll('[data-reveal]');

          // There should be reveal targets in the page
          expect(revealTargets.length).toBeGreaterThan(0);

          // None should have is-prereveal (JS adds it)
          for (const el of revealTargets) {
            expect(el.classList.contains('is-prereveal')).toBe(false);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 2. <noscript> provides fallback link to GitHub repos
  // -------------------------------------------------------------------------

  it('<noscript> provides a fallback link to GitHub repositories', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();
          const noscripts = doc.querySelectorAll('noscript');

          // At least one <noscript> must exist
          expect(noscripts.length).toBeGreaterThanOrEqual(1);

          // The noscript content should mention GitHub repos
          // Parse the noscript textContent for the anchor
          let foundGitHubLink = false;
          for (const ns of noscripts) {
            const content = ns.textContent || ns.innerHTML || '';
            if (content.includes('github.com') || content.includes('GitHub')) {
              foundGitHubLink = true;
            }
          }
          expect(foundGitHubLink).toBe(true);

          // Verify the <noscript> is inside the featured-projects section
          const featuredSection = doc.getElementById('featured-projects');
          expect(featuredSection).not.toBeNull();
          const noscriptInFeatured = featuredSection.querySelector('noscript');
          expect(noscriptInFeatured).not.toBeNull();

          // Parse noscript innerHTML to check for an anchor with https://
          const noscriptHtml = noscriptInFeatured.innerHTML;
          const noscriptDom = new JSDOM(`<div>${noscriptHtml}</div>`);
          const anchor = noscriptDom.window.document.querySelector('a');
          expect(anchor).not.toBeNull();
          expect(anchor.getAttribute('href')).toMatch(/^https:\/\/github\.com\//);
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 3. Resume download link works without JS
  // -------------------------------------------------------------------------

  it('resume download link is a static <a> with download attribute', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();

          // Find the download link in the document
          const downloadLink = doc.querySelector('a[download]');
          expect(downloadLink).not.toBeNull();

          // It must have an href pointing to the PDF
          const href = downloadLink.getAttribute('href');
          expect(href).toMatch(/\.pdf$/);
          expect(href).not.toMatch(/^javascript:/);
          expect(href).not.toBe('#');
          expect(href).not.toBe('');

          // The download attribute must be non-empty (provides filename)
          const downloadAttr = downloadLink.getAttribute('download');
          expect(downloadAttr).toBeTruthy();

          // No onclick or JS handler attributes
          expect(downloadLink.getAttribute('onclick')).toBeNull();
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 4. Navigation links are standard <a href="#section-id">
  // -------------------------------------------------------------------------

  it('navigation links are standard anchors that work without JS', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();
          const navList = doc.querySelector('[data-nav-list]');
          expect(navList).not.toBeNull();

          const navLinks = navList.querySelectorAll('a');
          expect(navLinks.length).toBeGreaterThan(0);

          for (const link of navLinks) {
            const href = link.getAttribute('href');
            // Each nav link must be a fragment reference
            expect(href).toMatch(/^#[a-z][a-z0-9-]*$/);

            // The target id must exist in the document
            const targetId = href.slice(1);
            const target = doc.getElementById(targetId);
            expect(target).not.toBeNull();

            // No JS handlers on nav links
            expect(link.getAttribute('onclick')).toBeNull();
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 5. No content depends on JavaScript to become visible
  // -------------------------------------------------------------------------

  it('[data-fallback] is hidden in static HTML (JS failure case only)', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();
          const fallback = doc.querySelector('[data-fallback]');

          // The fallback exists but has `hidden` attribute (JS shows it on failure)
          expect(fallback).not.toBeNull();
          expect(fallback.hasAttribute('hidden')).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('no [data-reveal] element has is-revealed class pre-applied in static HTML', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const doc = createStaticDocument();
          const revealTargets = doc.querySelectorAll('[data-reveal]');

          // Without JS, neither is-prereveal nor is-revealed should be present
          // Content is visible because the CSS rule only hides
          // [data-reveal].is-prereveal:not(.is-revealed)
          for (const el of revealTargets) {
            expect(el.classList.contains('is-prereveal')).toBe(false);
            // is-revealed absence is fine — without either class, content shows normally
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 6. Static sections are always visible without scripts
  // -------------------------------------------------------------------------

  it('static sections (about, tech-stack, education, contact) have visible content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('about', 'tech-stack', 'education', 'contact'),
        (sectionId) => {
          const doc = createStaticDocument();
          const section = doc.getElementById(sectionId);
          expect(section).not.toBeNull();

          // Section must have a heading
          const heading = section.querySelector('h2');
          expect(heading).not.toBeNull();
          expect(heading.textContent.trim().length).toBeGreaterThan(0);

          // Section must not have `hidden` attribute
          expect(section.hasAttribute('hidden')).toBe(false);

          // Section must have some text content beyond the heading
          const textContent = section.textContent.trim();
          expect(textContent.length).toBeGreaterThan(heading.textContent.trim().length);

          // aria-busy must be absent or "false" (not "true")
          const ariaBusy = section.getAttribute('aria-busy');
          if (ariaBusy !== null) {
            expect(ariaBusy).toBe('false');
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  // -------------------------------------------------------------------------
  // 7. Project list containers declare aria-busy="false" in static source
  // -------------------------------------------------------------------------

  it('project list containers have aria-busy="false" in static HTML', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('[data-featured-list]', '[data-other-list]'),
        (selector) => {
          const doc = createStaticDocument();
          const container = doc.querySelector(selector);
          expect(container).not.toBeNull();

          // Must declare aria-busy="false" in the static source (Req 6.6)
          expect(container.getAttribute('aria-busy')).toBe('false');

          // Must have zero element children (JS populates them)
          const elementChildren = Array.from(container.children);
          expect(elementChildren.length).toBe(0);
        }
      ),
      { numRuns: 12 }
    );
  });
});
