/**
 * Property 5: The validator agrees with the schema
 *
 * **Validates: Requirements 5.8**
 *
 * For any generated schema-conformant project of either kind, validateProject
 * returns true; and for any single-rule mutation of such a project — a required
 * key removed, a string emptied, a year made non-integer, a link scheme changed,
 * an other-only entry given summary, highlights, or image — validateProject
 * returns false.
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { validProject } from './generators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import of the ES module under test
const projectsModulePath = resolve(__dirname, '..', 'js', 'modules', 'projects.js');
const { validateProject } = await import(projectsModulePath);

// Load actual project data
const projectsPath = resolve(__dirname, '..', 'data', 'projects.json');
const raw = readFileSync(projectsPath, 'utf-8');
const projectData = JSON.parse(raw);

describe('Property 5: The validator agrees with the schema', () => {
  // --- Positive: generated valid projects pass ---

  it('validates every generated featured project as true', () => {
    fc.assert(
      fc.property(
        validProject('featured'),
        (project) => {
          expect(validateProject(project, 'featured')).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('validates every generated other project as true', () => {
    fc.assert(
      fc.property(
        validProject('other'),
        (project) => {
          expect(validateProject(project, 'other')).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  // --- Positive: actual projects.json data passes ---

  describe('actual projects.json passes validation', () => {
    it('every featured entry passes with kind=featured', () => {
      for (const project of projectData.featured) {
        expect(validateProject(project, 'featured')).toBe(true);
      }
    });

    it('every other entry passes with kind=other', () => {
      for (const project of projectData.other) {
        expect(validateProject(project, 'other')).toBe(true);
      }
    });
  });

  // --- Negative: single-rule mutations cause rejection ---

  describe('removing a required field rejects for featured', () => {
    const requiredFeatured = [
      'id', 'title', 'tagline', 'summary', 'role',
      'year', 'status', 'tech', 'highlights', 'links', 'image'
    ];

    it('removing any single required key returns false', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          fc.constantFrom(...requiredFeatured),
          (project, keyToRemove) => {
            const mutated = { ...project };
            delete mutated[keyToRemove];
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('removing a required field rejects for other', () => {
    const requiredOther = ['id', 'title', 'tagline', 'year', 'tech', 'links'];

    it('removing any single required key returns false', () => {
      fc.assert(
        fc.property(
          validProject('other'),
          fc.constantFrom(...requiredOther),
          (project, keyToRemove) => {
            const mutated = { ...project };
            delete mutated[keyToRemove];
            expect(validateProject(mutated, 'other')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('emptying a required string rejects', () => {
    it('empty string for featured string fields returns false', () => {
      const stringFields = ['id', 'title', 'tagline', 'summary', 'role', 'status'];

      fc.assert(
        fc.property(
          validProject('featured'),
          fc.constantFrom(...stringFields),
          (project, field) => {
            const mutated = { ...project, [field]: '' };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    });

    it('whitespace-only string for featured string fields returns false', () => {
      const stringFields = ['id', 'title', 'tagline', 'summary', 'role'];

      fc.assert(
        fc.property(
          validProject('featured'),
          fc.constantFrom(...stringFields),
          (project, field) => {
            const mutated = { ...project, [field]: '   ' };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('non-integer year rejects', () => {
    it('float year returns false for featured', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          fc.double({ min: 2000, max: 2030, noNaN: true }).filter((n) => !Number.isInteger(n)),
          (project, floatYear) => {
            const mutated = { ...project, year: floatYear };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('string year returns false for featured', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          (project) => {
            const mutated = { ...project, year: '2024' };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('link scheme changed rejects', () => {
    it('http:// link returns false', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          (project) => {
            const mutated = {
              ...project,
              links: { repo: 'http://github.com/user/repo' },
            };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('ftp:// link returns false', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          (project) => {
            const mutated = {
              ...project,
              links: { repo: 'ftp://files.example.com/repo' },
            };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('relative link returns false', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          (project) => {
            const mutated = {
              ...project,
              links: { demo: '/local/path' },
            };
            expect(validateProject(mutated, 'featured')).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('other-kind entry with featured-only fields rejects', () => {
    it('other with summary returns false', () => {
      fc.assert(
        fc.property(
          validProject('other'),
          (project) => {
            const mutated = { ...project, summary: 'A'.repeat(200) };
            expect(validateProject(mutated, 'other')).toBe(false);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('other with highlights returns false', () => {
      fc.assert(
        fc.property(
          validProject('other'),
          (project) => {
            const mutated = {
              ...project,
              highlights: ['Achieved something significant in the project that is measurable'],
            };
            expect(validateProject(mutated, 'other')).toBe(false);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('other with image returns false', () => {
      fc.assert(
        fc.property(
          validProject('other'),
          (project) => {
            const mutated = {
              ...project,
              image: { src: 'assets/img/test.webp', alt: 'Test', width: 800, height: 600 },
            };
            expect(validateProject(mutated, 'other')).toBe(false);
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('invalid kind rejects', () => {
    it('unknown kind always returns false', () => {
      fc.assert(
        fc.property(
          validProject('featured'),
          fc.constantFrom('unknown', '', 'Featured', 'OTHER', null, undefined),
          (project, kind) => {
            expect(validateProject(project, kind)).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
