/**
 * Property 11: Text is never interpreted as markup
 *
 * **Validates: Requirements 16.2**
 *
 * Verifies that renderCard in js/modules/projects.js never interprets text content
 * as executable markup. Text containing HTML-like strings (e.g., <script>, <img>,
 * &lt;, onclick=) must be rendered as visible text, not as parsed HTML.
 *
 * Uses the hostileString() generator to produce adversarial XSS-like payloads in
 * project fields (title, tagline, summary, role, tech entries, highlight entries)
 * and confirms the rendered DOM never contains injected script elements, event
 * handlers, or additional child elements from malicious text.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validProject, hostileString } from './generators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the shipped index.html once to get the template element
const htmlPath = resolve(__dirname, '..', 'index.html');
const htmlSource = readFileSync(htmlPath, 'utf-8');

// Import renderCard from the projects module
const { renderCard } = await import(resolve(__dirname, '..', 'js', 'modules', 'projects.js'));

// Create one JSDOM for the template source — reuse across tests
const templateDom = new JSDOM(htmlSource, {
  url: 'http://localhost:8000/',
  contentType: 'text/html',
});
const templateDoc = templateDom.window.document;
const featuredTemplate = templateDoc.querySelector('#featured-card-template');

/**
 * Render a project and attach the fragment to a fresh container for inspection.
 */
function renderToContainer(project) {
  const fragment = renderCard(project, featuredTemplate);
  const container = templateDoc.createElement('div');
  container.appendChild(fragment);
  return container;
}

/**
 * Build a valid featured project with hostile strings injected into all text fields.
 */
function hostileProject() {
  return fc.tuple(
    validProject('featured'),
    hostileString(),
    hostileString(),
    hostileString(),
    hostileString(),
    hostileString(),
    hostileString()
  ).map(([base, titlePayload, taglinePayload, summaryPayload, rolePayload, techPayload, highlightPayload]) => ({
    ...base,
    title: titlePayload,
    tagline: taglinePayload,
    summary: summaryPayload,
    role: rolePayload,
    tech: base.tech.map(() => techPayload),
    highlights: base.highlights.map(() => highlightPayload),
  }));
}

describe('Property 11: Text is never interpreted as markup', () => {
  it('hostile strings in text fields are rendered as text, never as parsed HTML', () => {
    fc.assert(
      fc.property(hostileProject(), (project) => {
        const container = renderToContainer(project);

        // No script elements should exist in the rendered card
        const scripts = container.querySelectorAll('script');
        expect(scripts.length).toBe(0);

        // No elements with event handler attributes (onclick, onerror, onload, etc.)
        const allElements = container.querySelectorAll('*');
        for (const el of allElements) {
          for (const attr of el.attributes) {
            expect(attr.name.startsWith('on')).toBe(false);
          }
        }

        // No img elements injected beyond the one in the template
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(1);

        // No svg elements injected from hostile text
        const svgs = container.querySelectorAll('svg');
        expect(svgs.length).toBe(0);

        // No iframe, object, embed, or form elements from hostile text
        const dangerous = container.querySelectorAll('iframe, object, embed, form');
        expect(dangerous.length).toBe(0);
      }),
      { numRuns: 15 }
    );
  });

  it('the title field is rendered as literal textContent, not interpreted as HTML', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (base, payload) => {
          const project = { ...base, title: payload };
          const container = renderToContainer(project);

          const titleEl = container.querySelector('[data-title]');
          // The hostile string must appear as literal text content
          expect(titleEl.textContent).toBe(payload);
          // The element should have no child elements (only a text node)
          expect(titleEl.children.length).toBe(0);
        }
      ),
      { numRuns: 12 }
    );
  });

  it('tech entries containing hostile strings render as text in list items', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (base, payload) => {
          const project = { ...base, tech: base.tech.map(() => payload) };
          const container = renderToContainer(project);

          const techList = container.querySelector('[data-tech]');
          const techItems = techList.querySelectorAll('li');
          for (const item of techItems) {
            expect(item.textContent).toBe(payload);
            expect(item.children.length).toBe(0);
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('highlight entries containing hostile strings render as text in list items', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        (base, payload) => {
          const project = { ...base, highlights: base.highlights.map(() => payload) };
          const container = renderToContainer(project);

          const highlightsList = container.querySelector('[data-highlights]');
          const items = highlightsList.querySelectorAll('li');
          for (const item of items) {
            expect(item.textContent).toBe(payload);
            expect(item.children.length).toBe(0);
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('summary and role containing hostile strings are rendered as literal text', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        hostileString(),
        hostileString(),
        (base, summaryPayload, rolePayload) => {
          const project = { ...base, summary: summaryPayload, role: rolePayload };
          const container = renderToContainer(project);

          const summaryEl = container.querySelector('[data-summary]');
          const roleEl = container.querySelector('[data-role]');

          if (summaryPayload.trim()) {
            expect(summaryEl.textContent).toBe(summaryPayload);
            expect(summaryEl.children.length).toBe(0);
          }

          if (rolePayload.trim()) {
            expect(roleEl.textContent).toBe(rolePayload);
            expect(roleEl.children.length).toBe(0);
          }
        }
      ),
      { numRuns: 12 }
    );
  });

  it('no element in the rendered card carries an event handler attribute', () => {
    fc.assert(
      fc.property(hostileProject(), (project) => {
        const container = renderToContainer(project);

        const allElements = container.querySelectorAll('*');
        for (const el of allElements) {
          for (const attr of el.attributes) {
            expect(attr.name.toLowerCase().startsWith('on')).toBe(false);
          }
        }
      }),
      { numRuns: 15 }
    );
  });
});
