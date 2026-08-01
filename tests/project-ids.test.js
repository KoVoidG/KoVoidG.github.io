/**
 * Property 3: Project ids are unique and well formed
 * Validates: Requirements 3.4
 *
 * Reads data/projects.json from disk and verifies:
 * 1. Every project id matches ^[a-z0-9]+(-[a-z0-9]+)*$
 * 2. Every id is 3–40 characters long
 * 3. All ids are unique across both featured and other arrays combined
 * 4. No id appears more than once
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '..', 'data', 'projects.json');
const raw = readFileSync(dataPath, 'utf-8');
const projectData = JSON.parse(raw);

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const allProjects = [...projectData.featured, ...projectData.other];

describe('Property 3: Project ids are unique and well formed', () => {
  it('every project id matches ^[a-z0-9]+(-[a-z0-9]+)*$', () => {
    for (const project of allProjects) {
      expect(project.id).toMatch(ID_PATTERN);
    }
  });

  it('every id is 3–40 characters long', () => {
    for (const project of allProjects) {
      expect(project.id.length).toBeGreaterThanOrEqual(3);
      expect(project.id.length).toBeLessThanOrEqual(40);
    }
  });

  it('all ids are unique across featured and other arrays combined', () => {
    const ids = allProjects.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('no id appears more than once', () => {
    const seen = new Map();
    for (const project of allProjects) {
      const count = seen.get(project.id) || 0;
      seen.set(project.id, count + 1);
    }
    for (const [id, count] of seen) {
      expect(count).toBe(1);
    }
  });
});
