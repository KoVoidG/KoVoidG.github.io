/**
 * Entry point — wires section modules with per-module async isolation.
 * Fetches data for each section under data/ folder and dynamically populates the page.
 */

import { initNav } from './modules/nav.js';
import { initHero } from './modules/hero.js';
import { initAbout } from './modules/about.js';
import { initEducation } from './modules/education.js';
import { initStack } from './modules/stack.js';
import { initProjects } from './modules/projects.js';
import { initContact } from './modules/contact.js';
import { initReveal } from './modules/reveal.js';
import { initInteractive } from './modules/interactive.js';

(async () => {
  // 1. Navigation
  try {
    await initNav();
  } catch (err) {
    console.warn(`nav: ${err}`);
  }

  // 2. Hero Section
  try {
    await initHero();
  } catch (err) {
    console.warn(`hero: ${err}`);
  }

  // 3. About Section
  try {
    await initAbout();
  } catch (err) {
    console.warn(`about: ${err}`);
  }

  // 4. Education Section
  try {
    await initEducation();
  } catch (err) {
    console.warn(`education: ${err}`);
  }

  // 5. Interactive (General UI features)
  try {
    initInteractive();
  } catch (err) {
    console.warn(`interactive: ${err}`);
  }

  // 6. Tech Stack Section
  try {
    await initStack();
  } catch (err) {
    console.warn(`stack: ${err}`);
  }

  // 7. Projects Section
  try {
    await initProjects();
  } catch (err) {
    console.warn(`projects: ${err}`);
  }

  // 8. Contact Section
  try {
    await initContact();
  } catch (err) {
    console.warn(`contact: ${err}`);
  }

  // 9. Reveal Animations
  try {
    initReveal();
  } catch (err) {
    console.warn(`reveal: ${err}`);
  }
})();
