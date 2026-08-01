/**
 * Property 1: Project data schema conformance
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.7, 3.11
 *
 * Verifies the actual data/projects.json conforms to the project data contract:
 * - Top-level structure has only `featured` and `other` keys, both arrays
 * - Featured projects carry all required fields with correct types
 * - Other projects carry required fields and omit forbidden fields
 * - All keys are camelCase matching ^[a-z][a-zA-Z0-9]*$
 * - Link values start with https://
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectsPath = resolve(__dirname, '..', 'data', 'projects.json');
const raw = readFileSync(projectsPath, 'utf-8');
const projectData = JSON.parse(raw);

const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;
const VALID_STATUSES = ['shipped', 'wip', 'archived'];

const FEATURED_REQUIRED_FIELDS = [
  'id', 'title', 'tagline', 'summary', 'role', 'year', 'status', 'tech', 'highlights', 'links', 'image',
];

const OTHER_REQUIRED_FIELDS = ['id', 'title', 'tagline', 'year', 'tech', 'links'];
const OTHER_OPTIONAL_FIELDS = ['role', 'status'];
const OTHER_FORBIDDEN_FIELDS = ['summary', 'highlights', 'image'];

/**
 * Recursively check that all object keys match camelCase pattern.
 */
function allKeysCamelCase(obj, path = '') {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return [];
  const violations = [];
  for (const key of Object.keys(obj)) {
    if (!CAMEL_CASE.test(key)) {
      violations.push(`${path}.${key}`);
    }
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      violations.push(...allKeysCamelCase(obj[key], `${path}.${key}`));
    }
  }
  return violations;
}

describe('Property 1: Project data schema conformance', () => {
  it('top-level structure has only "featured" and "other" keys, both arrays (Req 3.1)', () => {
    const topKeys = Object.keys(projectData);
    expect(topKeys.sort()).toEqual(['featured', 'other']);
    expect(Array.isArray(projectData.featured)).toBe(true);
    expect(Array.isArray(projectData.other)).toBe(true);
    // Every element in both arrays is an object
    for (const item of projectData.featured) {
      expect(typeof item).toBe('object');
      expect(item).not.toBeNull();
      expect(Array.isArray(item)).toBe(false);
    }
    for (const item of projectData.other) {
      expect(typeof item).toBe('object');
      expect(item).not.toBeNull();
      expect(Array.isArray(item)).toBe(false);
    }
  });

  describe('featured projects have all required fields with correct types (Req 3.2)', () => {
    it.each(projectData.featured.map((p) => [p.id, p]))(
      '%s has all required fields',
      (_id, project) => {
        // All required fields present
        for (const field of FEATURED_REQUIRED_FIELDS) {
          expect(project).toHaveProperty(field);
        }

        // No extra keys beyond the required set
        const allowedKeys = new Set(FEATURED_REQUIRED_FIELDS);
        for (const key of Object.keys(project)) {
          expect(allowedKeys.has(key)).toBe(true);
        }

        // String fields are non-empty after trimming
        expect(typeof project.id).toBe('string');
        expect(project.id.trim().length).toBeGreaterThan(0);

        expect(typeof project.title).toBe('string');
        expect(project.title.trim().length).toBeGreaterThan(0);

        expect(typeof project.tagline).toBe('string');
        expect(project.tagline.trim().length).toBeGreaterThan(0);

        expect(typeof project.summary).toBe('string');
        expect(project.summary.trim().length).toBeGreaterThanOrEqual(200);
        expect(project.summary.trim().length).toBeLessThanOrEqual(600);

        expect(typeof project.role).toBe('string');
        expect(project.role.trim().length).toBeGreaterThan(0);

        // Year is integer
        expect(typeof project.year).toBe('number');
        expect(Number.isInteger(project.year)).toBe(true);

        // Status is one of the allowed values
        expect(typeof project.status).toBe('string');
        expect(VALID_STATUSES).toContain(project.status);

        // Tech is array of non-empty strings
        expect(Array.isArray(project.tech)).toBe(true);
        for (const t of project.tech) {
          expect(typeof t).toBe('string');
          expect(t.trim().length).toBeGreaterThan(0);
        }

        // Highlights is array of non-empty strings
        expect(Array.isArray(project.highlights)).toBe(true);
        for (const h of project.highlights) {
          expect(typeof h).toBe('string');
          expect(h.trim().length).toBeGreaterThan(0);
        }

        // Links is an object with at least one key
        expect(typeof project.links).toBe('object');
        expect(project.links).not.toBeNull();
        expect(Array.isArray(project.links)).toBe(false);
        expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);

        // Image is an object with src, alt, width, height
        expect(typeof project.image).toBe('object');
        expect(project.image).not.toBeNull();
        expect(Array.isArray(project.image)).toBe(false);
        expect(typeof project.image.src).toBe('string');
        expect(typeof project.image.alt).toBe('string');
        expect(project.image.alt.trim().length).toBeGreaterThan(0);
        expect(typeof project.image.width).toBe('number');
        expect(Number.isInteger(project.image.width)).toBe(true);
        expect(typeof project.image.height).toBe('number');
        expect(Number.isInteger(project.image.height)).toBe(true);
      }
    );
  });

  describe('other projects have required fields and omit forbidden fields (Req 3.3)', () => {
    it.each(projectData.other.map((p) => [p.id, p]))(
      '%s has correct field set',
      (_id, project) => {
        // All required fields present
        for (const field of OTHER_REQUIRED_FIELDS) {
          expect(project).toHaveProperty(field);
        }

        // No forbidden fields
        for (const field of OTHER_FORBIDDEN_FIELDS) {
          expect(project).not.toHaveProperty(field);
        }

        // Only allowed keys (required + optional)
        const allowedKeys = new Set([...OTHER_REQUIRED_FIELDS, ...OTHER_OPTIONAL_FIELDS]);
        for (const key of Object.keys(project)) {
          expect(allowedKeys.has(key)).toBe(true);
        }

        // Type checks on required fields
        expect(typeof project.id).toBe('string');
        expect(project.id.trim().length).toBeGreaterThan(0);

        expect(typeof project.title).toBe('string');
        expect(project.title.trim().length).toBeGreaterThan(0);

        expect(typeof project.tagline).toBe('string');
        expect(project.tagline.trim().length).toBeGreaterThan(0);

        expect(typeof project.year).toBe('number');
        expect(Number.isInteger(project.year)).toBe(true);

        expect(Array.isArray(project.tech)).toBe(true);
        for (const t of project.tech) {
          expect(typeof t).toBe('string');
          expect(t.trim().length).toBeGreaterThan(0);
        }

        expect(typeof project.links).toBe('object');
        expect(project.links).not.toBeNull();
        expect(Array.isArray(project.links)).toBe(false);
        expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);
      }
    );
  });

  describe('links values start with https:// (Req 3.5)', () => {
    const allProjects = [...projectData.featured, ...projectData.other];

    it.each(allProjects.map((p) => [p.id, p]))(
      '%s links are all https:// URLs',
      (_id, project) => {
        for (const [key, value] of Object.entries(project.links)) {
          expect(typeof value).toBe('string');
          expect(value.startsWith('https://')).toBe(true);
          // No whitespace
          expect(value).not.toMatch(/\s/);
          // Length bounded
          expect(value.length).toBeLessThanOrEqual(2048);
        }
      }
    );
  });

  describe('all keys are camelCase matching ^[a-z][a-zA-Z0-9]*$ (Req 3.11)', () => {
    it('top-level keys are camelCase', () => {
      for (const key of Object.keys(projectData)) {
        expect(key).toMatch(CAMEL_CASE);
      }
    });

    it('featured project keys are all camelCase', () => {
      for (const project of projectData.featured) {
        const violations = allKeysCamelCase(project, project.id);
        expect(violations).toEqual([]);
      }
    });

    it('other project keys are all camelCase', () => {
      for (const project of projectData.other) {
        const violations = allKeysCamelCase(project, project.id);
        expect(violations).toEqual([]);
      }
    });
  });

  describe('no unexpected keys in nested objects (Req 3.7)', () => {
    const ALLOWED_LINK_KEYS = ['repo', 'demo', 'caseStudy'];
    const ALLOWED_IMAGE_KEYS = ['src', 'alt', 'width', 'height'];

    it('links objects contain only allowed keys', () => {
      const allProjects = [...projectData.featured, ...projectData.other];
      for (const project of allProjects) {
        for (const key of Object.keys(project.links)) {
          expect(ALLOWED_LINK_KEYS).toContain(key);
        }
      }
    });

    it('image objects contain exactly src, alt, width, height', () => {
      for (const project of projectData.featured) {
        const imageKeys = Object.keys(project.image).sort();
        expect(imageKeys).toEqual(ALLOWED_IMAGE_KEYS.sort());
      }
    });
  });

  describe('property-based: schema holds for every project in the file', () => {
    const allFeatured = projectData.featured;
    const allOther = projectData.other;

    it('every featured project satisfies the full schema contract', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allFeatured),
          (project) => {
            // Required fields present with correct types
            expect(typeof project.id).toBe('string');
            expect(project.id.trim().length).toBeGreaterThan(0);
            expect(typeof project.title).toBe('string');
            expect(project.title.trim().length).toBeGreaterThan(0);
            expect(typeof project.summary).toBe('string');
            expect(project.summary.length).toBeGreaterThanOrEqual(200);
            expect(project.summary.length).toBeLessThanOrEqual(600);
            expect(Number.isInteger(project.year)).toBe(true);
            expect(VALID_STATUSES).toContain(project.status);
            expect(Array.isArray(project.tech)).toBe(true);
            expect(project.tech.every((t) => typeof t === 'string' && t.trim().length > 0)).toBe(true);
            expect(Array.isArray(project.highlights)).toBe(true);
            expect(project.highlights.every((h) => typeof h === 'string' && h.trim().length > 0)).toBe(true);
            expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);
            expect(Object.values(project.links).every((v) => v.startsWith('https://'))).toBe(true);
            expect(typeof project.image).toBe('object');
            expect(project.image.src).toBeDefined();
            expect(project.image.alt.trim().length).toBeGreaterThan(0);
            expect(Number.isInteger(project.image.width)).toBe(true);
            expect(Number.isInteger(project.image.height)).toBe(true);

            // All keys camelCase
            const violations = allKeysCamelCase(project);
            expect(violations).toEqual([]);
          }
        ),
        { numRuns: allFeatured.length * 3 }
      );
    });

    it('every other project satisfies the compact schema contract', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allOther),
          (project) => {
            // Required fields
            expect(typeof project.id).toBe('string');
            expect(project.id.trim().length).toBeGreaterThan(0);
            expect(typeof project.title).toBe('string');
            expect(project.title.trim().length).toBeGreaterThan(0);
            expect(typeof project.tagline).toBe('string');
            expect(project.tagline.trim().length).toBeGreaterThan(0);
            expect(Number.isInteger(project.year)).toBe(true);
            expect(Array.isArray(project.tech)).toBe(true);
            expect(project.tech.every((t) => typeof t === 'string' && t.trim().length > 0)).toBe(true);
            expect(Object.keys(project.links).length).toBeGreaterThanOrEqual(1);
            expect(Object.values(project.links).every((v) => v.startsWith('https://'))).toBe(true);

            // Forbidden fields absent
            expect(project.summary).toBeUndefined();
            expect(project.highlights).toBeUndefined();
            expect(project.image).toBeUndefined();

            // All keys camelCase
            const violations = allKeysCamelCase(project);
            expect(violations).toEqual([]);
          }
        ),
        { numRuns: allOther.length * 3 }
      );
    });
  });
});
