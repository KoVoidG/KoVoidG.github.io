/**
 * Property 26: Technology spelling matches across data files
 *
 * Validates: Requirements 13.6
 *
 * Verifies that technology names in `data/projects.json` use canonical spelling
 * that matches `data/stack.json`. For any tech that appears in both files, the
 * spelling must be byte-identical (case-sensitive).
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';

const __dirname = dirname(fileURLToPath(import.meta.url));

const stackPath = resolve(__dirname, '..', 'data', 'stack.json');
const projectsPath = resolve(__dirname, '..', 'data', 'projects.json');

const stackData = JSON.parse(readFileSync(stackPath, 'utf-8'));
const projectData = JSON.parse(readFileSync(projectsPath, 'utf-8'));

/**
 * Collect all unique tech entries from stack.json (all groups combined).
 */
function collectStackTech() {
  const techs = new Set();
  for (const group of Object.values(stackData)) {
    for (const entry of group) {
      techs.add(entry);
    }
  }
  return techs;
}

/**
 * Collect all unique tech entries from projects.json (featured + other).
 */
function collectProjectTech() {
  const techs = new Set();
  const allProjects = [...(projectData.featured || []), ...(projectData.other || [])];
  for (const project of allProjects) {
    if (Array.isArray(project.tech)) {
      for (const t of project.tech) {
        techs.add(t);
      }
    }
  }
  return techs;
}

const stackTechs = collectStackTech();
const projectTechs = collectProjectTech();

// Build a case-insensitive lookup from stack.json for matching
const stackTechLower = new Map();
for (const tech of stackTechs) {
  stackTechLower.set(tech.toLowerCase(), tech);
}

describe('Property 26: Technology spelling matches across data files', () => {
  it('every project tech entry that matches a stack.json entry case-insensitively is byte-identical', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...[...projectTechs]),
        (projectTech) => {
          const lower = projectTech.toLowerCase();
          if (stackTechLower.has(lower)) {
            const canonicalSpelling = stackTechLower.get(lower);
            expect(projectTech).toBe(canonicalSpelling);
          }
        }
      ),
      { numRuns: projectTechs.size * 5 }
    );
  });

  it('all project tech entries are a subset of stack.json canonical names (Req 13.6)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...[...projectTechs]),
        (projectTech) => {
          expect(stackTechs.has(projectTech)).toBe(true);
        }
      ),
      { numRuns: projectTechs.size * 5 }
    );
  });

  it('no project uses a tech name with different capitalisation than stack.json', () => {
    const mismatches = [];
    for (const projectTech of projectTechs) {
      const lower = projectTech.toLowerCase();
      if (stackTechLower.has(lower)) {
        const canonical = stackTechLower.get(lower);
        if (projectTech !== canonical) {
          mismatches.push({ project: projectTech, canonical });
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('every unique tech in projects.json exists in stack.json', () => {
    const missing = [];
    for (const tech of projectTechs) {
      if (!stackTechs.has(tech)) {
        missing.push(tech);
      }
    }
    expect(missing).toEqual([]);
  });
});
