/**
 * Interactive UX module — Copy email toast, Tech stack filter tabs, and Magnetic buttons.
 */

import { qs, qsa } from './dom.js';

export function initInteractive() {
  initEmailCopy();
  initStackFilter();
  initMagneticButtons();
}

/**
 * One-click copy email with toast notification
 */
function initEmailCopy() {
  const emailLinks = qsa('[data-copy-email]');
  const toast = qs('#toast');

  if (!emailLinks.length) return;

  let toastTimeout = null;

  for (const link of emailLinks) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'siraphop.sup@example.com';
      
      navigator.clipboard.writeText(email).then(() => {
        if (!toast) return;
        toast.removeAttribute('hidden');
        toast.textContent = `Copied ${email} to clipboard!`;
        
        if (toastTimeout) clearTimeout(toastTimeout);
        
        toastTimeout = setTimeout(() => {
          toast.setAttribute('hidden', '');
        }, 2500);
      }).catch(() => {
        // Fallback open mailto if clipboard API blocked
        window.location.href = `mailto:${email}`;
      });
    });
  }
}

/**
 * Interactive Category Filtering for Tech Stack
 */
function initStackFilter() {
  const filterContainer = qs('[data-stack-filter]');
  if (!filterContainer) return;

  const buttons = qsa('.stack-filter__btn', filterContainer);
  const stackGroups = qsa('.stack-group');

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button state
      for (const b of buttons) b.classList.remove('is-active');
      btn.classList.add('is-active');

      // Filter groups
      for (const group of stackGroups) {
        const category = group.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          group.classList.remove('is-filtered-out');
        } else {
          group.classList.add('is-filtered-out');
        }
      }
    });
  }
}

/**
 * Subtle Magnetic CTA Button Effect
 */
function initMagneticButtons() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const primaryBtns = qsa('.btn--primary');

  for (const btn of primaryBtns) {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0, 0)`;
    });
  }
}
