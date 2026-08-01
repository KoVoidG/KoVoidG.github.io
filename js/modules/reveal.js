/**
 * Scroll reveal — entrance animations via IntersectionObserver with staggered child delays.
 */

import { qsa } from './dom.js';

const SELECTOR = '[data-reveal]';

/**
 * @param {Element|Document} [root=document] — scope to search for reveal targets
 */
export function initReveal(root = document) {
  // Find targets under root, excluding anything already revealed
  const targets = qsa(SELECTOR, root).filter((el) => {
    if (el.classList.contains('is-revealed')) return false;
    return true;
  });

  // Nothing to reveal — return without touching the document
  if (targets.length === 0) return;

  // Reduced motion or no IntersectionObserver: reveal immediately
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const target of targets) {
      target.classList.add('is-revealed');
    }
    return;
  }

  let remaining = targets.length;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.intersectionRatio > 0.05) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
          remaining--;
          if (remaining <= 0) {
            observer.disconnect();
          }
        }
      }
    },
    { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
  );

  // Add is-prereveal and observe in the same synchronous pass
  for (const target of targets) {
    target.classList.add('is-prereveal');
    observer.observe(target);
  }
}
