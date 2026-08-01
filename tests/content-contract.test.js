/**
 * Property 25: The content contract mirrors the document
 *
 * Validates: Requirements 13.2, 13.3, 13.4, 13.7, 13.10, 13.11, 13.12
 *
 * Verifies that the static HTML mirrors the content from profile.json and
 * stack.json exactly. This is a deterministic test (not randomised with
 * fast-check) since it verifies a fixed mirror relationship between the
 * JSON authoring sources and the shipped markup.
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDocument } from './setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const profile = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', 'profile.json'), 'utf-8'));
const stack = JSON.parse(readFileSync(resolve(__dirname, '..', 'data', 'stack.json'), 'utf-8'));

describe('Property 25: The content contract mirrors the document', () => {
  let document;

  beforeEach(() => {
    ({ document } = createDocument());
  });

  it('h1 text matches profile.name exactly', () => {
    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent.trim()).toBe(profile.name);
  });

  it('hero eyebrow text matches profile.role', () => {
    const eyebrow = document.querySelector('.hero__eyebrow');
    expect(eyebrow).not.toBeNull();
    expect(eyebrow.textContent.trim()).toBe(profile.role);
  });

  it('hero positioning text matches profile.heroLine', () => {
    const positioning = document.querySelector('.hero__positioning');
    expect(positioning).not.toBeNull();
    expect(positioning.textContent.trim()).toBe(profile.heroLine);
  });

  it('each about paragraph matches profile.about entries in order', () => {
    const prose = document.querySelector('#about .prose');
    expect(prose).not.toBeNull();
    const paragraphs = prose.querySelectorAll('p');
    expect(paragraphs.length).toBe(profile.about.length);
    profile.about.forEach((text, i) => {
      expect(paragraphs[i].textContent.trim()).toBe(text);
    });
  });

  it('each stack group heading maps to a key in stack.json', () => {
    const groupHeadings = document.querySelectorAll('.stack-group__title');
    expect(groupHeadings.length).toBe(Object.keys(stack).length);
    const stackKeys = Object.keys(stack);
    groupHeadings.forEach((h3) => {
      const heading = h3.textContent.trim().toLowerCase();
      expect(stackKeys).toContain(heading);
    });
  });

  it('each tag in each group matches the corresponding array entry in stack.json', () => {
    const groups = document.querySelectorAll('.stack-group');
    const stackKeys = Object.keys(stack);
    expect(groups.length).toBe(stackKeys.length);

    groups.forEach((group) => {
      const heading = group.querySelector('.stack-group__title').textContent.trim().toLowerCase();
      const tags = group.querySelectorAll('.tag');
      const expectedTags = stack[heading];
      expect(expectedTags).toBeDefined();
      expect(tags.length).toBe(expectedTags.length);
      expectedTags.forEach((tag, i) => {
        expect(tags[i].textContent.trim()).toBe(tag);
      });
    });
  });

  it('education entries match profile.education', () => {
    const educationCards = document.querySelectorAll('.education-card');
    expect(educationCards.length).toBe(profile.education.length);

    profile.education.forEach((entry, i) => {
      const card = educationCards[i];
      const program = card.querySelector('.education-card__program-title');
      const degrees = card.querySelector('.education-card__degrees');
      const institutions = card.querySelector('.education-card__institutions');

      expect(program.textContent.trim()).toBe(entry.program);
      expect(degrees.textContent).toContain('B.Sc. Computer and Data Science');
      expect(institutions.textContent.trim()).toBe(entry.institutions);
    });
  });

  it('contact email href matches mailto:${profile.contact.email}', () => {
    const contactSection = document.getElementById('contact');
    expect(contactSection).not.toBeNull();
    const mailtoLink = contactSection.querySelector(`a[href="mailto:${profile.contact.email}"]`);
    expect(mailtoLink).not.toBeNull();
  });

  it('social links match profile.socials (label text and href)', () => {
    const socialList = document.querySelector('.social-list');
    expect(socialList).not.toBeNull();
    const links = socialList.querySelectorAll('a');
    expect(links.length).toBe(profile.socials.length);

    profile.socials.forEach((social, i) => {
      expect(links[i].textContent.trim()).toBe(social.label);
      expect(links[i].getAttribute('href')).toBe(social.url);
    });
  });

  it('resume link href equals profile.resumePath', () => {
    const resumeLink = document.querySelector(`a[href="${profile.resumePath}"]`);
    expect(resumeLink).not.toBeNull();
  });

  it('GitHub section link href matches profile.githubUrl', () => {
    const ghLink = document.querySelector(`a[href="${profile.githubUrl}"]`);
    expect(ghLink).not.toBeNull();
  });
});
