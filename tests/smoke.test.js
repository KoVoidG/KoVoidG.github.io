/**
 * Smoke test — verifies the test harness boots and generators produce valid shapes.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { createDocument } from './setup.js';
import {
  validProject,
  hostileString,
  arbitraryJson,
  projectData,
  revealTargets,
  intersectionEntries,
} from './generators.js';

describe('Test harness', () => {
  it('creates a jsdom document from index.html', () => {
    const { document, window } = createDocument();
    expect(document).toBeDefined();
    expect(document.querySelector('h1')).not.toBeNull();
    expect(document.getElementById('hero')).not.toBeNull();
    expect(window.fetch).toBeDefined();
    expect(window.matchMedia).toBeDefined();
    expect(window.IntersectionObserver).toBeDefined();
  });

  it('fetch stub returns configurable responses', async () => {
    const { window, stubs } = createDocument();
    stubs.fetch.setResponse({ featured: [{ id: 'test' }], other: [] });
    const res = await window.fetch('data/projects.json');
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.featured[0].id).toBe('test');
  });

  it('matchMedia stub responds to reduced motion', () => {
    const { window, stubs } = createDocument();
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
    stubs.matchMedia.setReducedMotion(true);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
  });

  it('IntersectionObserver stub tracks instances', () => {
    const { window, stubs } = createDocument();
    const observer = new window.IntersectionObserver(() => {});
    expect(stubs.intersectionObserver.instances.length).toBe(1);
    expect(stubs.intersectionObserver.latest).toBe(observer);
  });
});

describe('Generators', () => {
  it('validProject(featured) produces schema-conformant objects', () => {
    fc.assert(
      fc.property(validProject('featured'), (project) => {
        expect(project.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(project.title.trim().length).toBeGreaterThan(0);
        expect(project.tagline.trim().length).toBeGreaterThan(0);
        expect(project.summary.length).toBeGreaterThanOrEqual(200);
        expect(project.role.trim().length).toBeGreaterThan(0);
        expect(Number.isInteger(project.year)).toBe(true);
        expect(['shipped', 'wip', 'archived']).toContain(project.status);
        expect(project.tech.length).toBeGreaterThanOrEqual(3);
        expect(project.tech.length).toBeLessThanOrEqual(6);
        expect(project.highlights.length).toBeGreaterThanOrEqual(2);
        expect(project.highlights.length).toBeLessThanOrEqual(4);
        expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);
        expect(project.image.src).toMatch(/^assets\/img\/.+\.webp$/);
        expect(project.image.width).toBeGreaterThan(0);
        expect(project.image.height).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });

  it('validProject(other) produces compact objects without summary/highlights/image', () => {
    fc.assert(
      fc.property(validProject('other'), (project) => {
        expect(project.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(project.title.trim().length).toBeGreaterThan(0);
        expect(project.tagline.trim().length).toBeGreaterThan(0);
        expect(Number.isInteger(project.year)).toBe(true);
        expect(project.tech.length).toBeGreaterThanOrEqual(3);
        expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);
        // Must not have these keys
        expect(project.summary).toBeUndefined();
        expect(project.highlights).toBeUndefined();
        expect(project.image).toBeUndefined();
      }),
      { numRuns: 10 }
    );
  });

  it('hostileString() produces non-empty adversarial strings', () => {
    fc.assert(
      fc.property(hostileString(), (s) => {
        expect(typeof s).toBe('string');
        expect(s.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });

  it('arbitraryJson() produces various JSON-compatible values', () => {
    fc.assert(
      fc.property(arbitraryJson(), (value) => {
        // Should not throw — any value is acceptable
        expect(true).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  it('projectData() produces valid paired arrays with unique ids', () => {
    fc.assert(
      fc.property(projectData(), (data) => {
        expect(data.featured.length).toBeGreaterThanOrEqual(3);
        expect(data.featured.length).toBeLessThanOrEqual(4);
        expect(data.other.length).toBeGreaterThanOrEqual(4);
        expect(data.other.length).toBeLessThanOrEqual(8);
        // All ids should be unique across both arrays
        const allIds = [...data.featured, ...data.other].map((p) => p.id);
        expect(new Set(allIds).size).toBe(allIds.length);
      }),
      { numRuns: 5 }
    );
  });

  it('revealTargets() produces DOM-like objects with classList API', () => {
    fc.assert(
      fc.property(revealTargets(), (targets) => {
        for (const t of targets) {
          expect(t.dataset.reveal).toBe('');
          expect(typeof t.classList.add).toBe('function');
          expect(typeof t.classList.contains).toBe('function');
        }
      }),
      { numRuns: 5 }
    );
  });

  it('intersectionEntries() produces observer-shaped entries', () => {
    fc.assert(
      fc.property(intersectionEntries(), (entries) => {
        expect(entries.length).toBeGreaterThanOrEqual(1);
        for (const e of entries) {
          expect(typeof e.intersectionRatio).toBe('number');
          expect(e.intersectionRatio).toBeGreaterThanOrEqual(0);
          expect(e.intersectionRatio).toBeLessThanOrEqual(1);
          expect(typeof e.isIntersecting).toBe('boolean');
          expect(e.target.id).toBeDefined();
        }
      }),
      { numRuns: 5 }
    );
  });
});
