/**
 * Property 2: Featured images are complete and descriptive
 *
 * Validates: Requirements 3.6
 *
 * Verifies every featured project in data/projects.json has a complete `image` object:
 * 1. All four keys present: src, alt, width, height
 * 2. src is a relative path beginning with assets/img/, no leading slash, no .. segment,
 *    ending in .webp, .avif, .jpg, or .png
 * 3. alt is non-empty after trimming, differs from title, and is ≤125 chars
 * 4. width and height are positive integers from 1 to 4000
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

const VALID_EXTENSIONS = ['.webp', '.avif', '.jpg', '.png'];
const IMAGE_REQUIRED_KEYS = ['src', 'alt', 'width', 'height'];

describe('Property 2: Featured images are complete and descriptive', () => {
  const featured = projectData.featured;

  describe('every featured project image has all four required keys', () => {
    it.each(featured.map((p) => [p.id, p]))(
      '%s image has src, alt, width, height',
      (_id, project) => {
        expect(project).toHaveProperty('image');
        expect(typeof project.image).toBe('object');
        expect(project.image).not.toBeNull();
        expect(Array.isArray(project.image)).toBe(false);

        const keys = Object.keys(project.image).sort();
        expect(keys).toEqual([...IMAGE_REQUIRED_KEYS].sort());
      }
    );
  });

  describe('src is a valid relative path under assets/img/', () => {
    it.each(featured.map((p) => [p.id, p]))(
      '%s image.src is a valid relative image path',
      (_id, project) => {
        const { src } = project.image;
        expect(typeof src).toBe('string');

        // Begins with assets/img/
        expect(src.startsWith('assets/img/')).toBe(true);

        // No leading slash
        expect(src.startsWith('/')).toBe(false);

        // No .. segment
        expect(src).not.toMatch(/\.\./);

        // Ends in a valid image extension (lowercase)
        const hasValidExtension = VALID_EXTENSIONS.some((ext) => src.endsWith(ext));
        expect(hasValidExtension).toBe(true);
      }
    );
  });

  describe('alt is non-empty, differs from title, and ≤125 chars', () => {
    it.each(featured.map((p) => [p.id, p]))(
      '%s image.alt is descriptive and within bounds',
      (_id, project) => {
        const { alt } = project.image;
        expect(typeof alt).toBe('string');

        // Non-empty after trimming
        expect(alt.trim().length).toBeGreaterThan(0);

        // Differs from title
        expect(alt.trim()).not.toBe(project.title.trim());

        // At most 125 characters
        expect(alt.length).toBeLessThanOrEqual(125);
      }
    );
  });

  describe('width and height are positive integers from 1 to 4000', () => {
    it.each(featured.map((p) => [p.id, p]))(
      '%s image dimensions are valid integers in range',
      (_id, project) => {
        const { width, height } = project.image;

        expect(typeof width).toBe('number');
        expect(Number.isInteger(width)).toBe(true);
        expect(width).toBeGreaterThanOrEqual(1);
        expect(width).toBeLessThanOrEqual(4000);

        expect(typeof height).toBe('number');
        expect(Number.isInteger(height)).toBe(true);
        expect(height).toBeGreaterThanOrEqual(1);
        expect(height).toBeLessThanOrEqual(4000);
      }
    );
  });

  describe('property-based: image contract holds for every featured project', () => {
    it('every featured project image satisfies the full image contract', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...featured),
          (project) => {
            const { image } = project;

            // All four keys present
            expect(Object.keys(image).sort()).toEqual([...IMAGE_REQUIRED_KEYS].sort());

            // src: relative path under assets/img/, valid extension, no ..
            expect(image.src.startsWith('assets/img/')).toBe(true);
            expect(image.src.startsWith('/')).toBe(false);
            expect(image.src).not.toMatch(/\.\./);
            const hasValidExt = VALID_EXTENSIONS.some((ext) => image.src.endsWith(ext));
            expect(hasValidExt).toBe(true);

            // alt: non-empty, differs from title, ≤125 chars
            expect(image.alt.trim().length).toBeGreaterThan(0);
            expect(image.alt.trim()).not.toBe(project.title.trim());
            expect(image.alt.length).toBeLessThanOrEqual(125);

            // width and height: positive integers 1–4000
            expect(Number.isInteger(image.width)).toBe(true);
            expect(image.width).toBeGreaterThanOrEqual(1);
            expect(image.width).toBeLessThanOrEqual(4000);
            expect(Number.isInteger(image.height)).toBe(true);
            expect(image.height).toBeGreaterThanOrEqual(1);
            expect(image.height).toBeLessThanOrEqual(4000);
          }
        ),
        { numRuns: featured.length * 3 }
      );
    });
  });
});
