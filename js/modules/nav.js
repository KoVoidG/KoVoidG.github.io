/**
 * Active-section highlighting — reflects scroll position in the navigation.
 * Fetches data/navigation.json and populates nav elements dynamically.
 */

import { qs, qsa } from './dom.js';

export async function loadNavData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/navigation.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/navigation.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/navigation.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initNav() {
  // Render nav from JSON
  try {
    const navData = await loadNavData();
    if (navData) {
      const brand = document.querySelector('.site-nav__brand');
      if (brand && navData.brand) brand.textContent = navData.brand;

      const navList = qs('[data-nav-list]');
      if (navList && Array.isArray(navData.links)) {
        navList.innerHTML = '';
        navData.links.forEach((link) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'site-nav__link';
          a.href = link.href;
          a.textContent = link.label;
          li.appendChild(a);
          navList.appendChild(li);
        });
      }

      const resumeBtn = document.querySelector('[data-download-resume]');
      if (resumeBtn && navData.resume) {
        resumeBtn.textContent = navData.resume.label;
        resumeBtn.href = navData.resume.href;
        resumeBtn.download = navData.resume.download;
      }
    }
  } catch (err) {
    console.warn(`initNav data: ${err.message || err}`);
  }

  const navList = qs('[data-nav-list]');
  if (!navList) return;

  const links = qsa('a', navList);
  if (links.length === 0) return;

  if (!('IntersectionObserver' in window)) return;

  // Build a map of section-id → nav link (only for links whose fragment matches an element)
  const linkMap = new Map();
  for (const link of links) {
    const hash = link.getAttribute('href');
    if (!hash || !hash.startsWith('#')) continue;
    const sectionId = hash.slice(1);
    const section = document.getElementById(sectionId);
    if (section) {
      linkMap.set(sectionId, link);
    }
  }

  if (linkMap.size === 0) return;

  let activeLink = null;

  function setActive(link) {
    if (activeLink === link) return;
    if (activeLink) {
      activeLink.classList.remove('is-active');
      activeLink.removeAttribute('aria-current');
    }
    activeLink = link;
    if (link) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'true');
    }
  }

  const heroSection = document.getElementById('hero');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (entry.target.id === 'hero') {
            setActive(null);
          } else {
            const link = linkMap.get(entry.target.id);
            if (link) setActive(link);
          }
        }
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );

  // Observe section targets and hero section
  if (heroSection) observer.observe(heroSection);
  for (const [sectionId] of linkMap) {
    const section = document.getElementById(sectionId);
    if (section) observer.observe(section);
  }

  // --- Scroll Progress Bar ---
  const progressBar = qs('[data-scroll-progress]');
  const backToTopBtn = document.getElementById('back-to-top');

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollTop < 100) {
      setActive(null);
    }

    if (progressBar && scrollHeight > 0) {
      const progressPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
    }

    if (backToTopBtn) {
      if (scrollTop > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
