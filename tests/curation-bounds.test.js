/**
 * Property 4: Curation bounds and closed enumerations hold
 * Validates: Requirements 3.8, 3.9, 3.13
 *
 * This test reads the actual data/projects.json and verifies that:
 * - Curation bounds (featured count, other count, tech per project, highlights, lengths)
 * - Closed enumerations (status, year range)
 * - Highlight quality (character bounds, at least one numeric highlight per featured)
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '..', 'data', 'projects.json');
const raw = readFileSync(dataPath, 'utf-8');
const data = JSON.parse(raw);

const currentYear = new Date().getFullYear();

describe('Property 4: Curation bounds and closed enumerations hold', () => {
  describe('Curation bounds (Req 3.9)', () => {
    it('has 3–4 featured projects', () => {
      expect(data.featured.length).toBeGreaterThanOrEqual(3);
      expect(data.featured.length).toBeLessThanOrEqual(4);
    });

    it('has 4–8 other projects', () => {
      expect(data.other.length).toBeGreaterThanOrEqual(4);
      expect(data.other.length).toBeLessThanOrEqual(8);
    });

    it('each project has 3–6 tech entries, each ≤24 chars, no duplicates within a project', () => {
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        expect(project.tech.length).toBeGreaterThanOrEqual(3);
        expect(project.tech.length).toBeLessThanOrEqual(6);
        for (const t of project.tech) {
          expect(t.length).toBeLessThanOrEqual(24);
        }
        const unique = new Set(project.tech);
        expect(unique.size).toBe(project.tech.length);
      }
    });

    it('each featured project has 2–4 highlights', () => {
      for (const project of data.featured) {
        expect(project.highlights.length).toBeGreaterThanOrEqual(2);
        expect(project.highlights.length).toBeLessThanOrEqual(4);
      }
    });

    it('title ≤60 chars per project', () => {
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        expect(project.title.length).toBeLessThanOrEqual(60);
      }
    });

    it('tagline ≤80 chars per project', () => {
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        expect(project.tagline.length).toBeLessThanOrEqual(80);
      }
    });

    it('role ≤60 chars where present', () => {
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        if (project.role !== undefined) {
          expect(project.role.length).toBeLessThanOrEqual(60);
        }
      }
    });

    it('summary 200–600 chars per featured project', () => {
      for (const project of data.featured) {
        expect(project.summary.length).toBeGreaterThanOrEqual(200);
        expect(project.summary.length).toBeLessThanOrEqual(600);
      }
    });
  });

  describe('Closed enumerations (Req 3.8)', () => {
    it('status is one of shipped, wip, or archived', () => {
      const validStatuses = ['shipped', 'wip', 'archived'];
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        if (project.status !== undefined) {
          expect(validStatuses).toContain(project.status);
        }
      }
    });

    it('year is integer 2000–current year (or current+1 for wip)', () => {
      const allProjects = [...data.featured, ...data.other];
      for (const project of allProjects) {
        expect(Number.isInteger(project.year)).toBe(true);
        expect(project.year).toBeGreaterThanOrEqual(2000);
        const maxYear = project.status === 'wip' ? currentYear + 1 : currentYear;
        expect(project.year).toBeLessThanOrEqual(maxYear);
      }
    });
  });

  describe('Highlight quality (Req 3.13)', () => {
    it('each highlight is 20–120 characters', () => {
      for (const project of data.featured) {
        for (const highlight of project.highlights) {
          expect(highlight.length).toBeGreaterThanOrEqual(20);
          expect(highlight.length).toBeLessThanOrEqual(120);
        }
      }
    });

    it('each featured project has at least one highlight containing a numeric character', () => {
      for (const project of data.featured) {
        const hasNumeric = project.highlights.some((h) => /\d/.test(h));
        expect(hasNumeric).toBe(true);
      }
    });
  });
});
