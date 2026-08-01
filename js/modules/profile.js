/**
 * Profile loading module — fetches data/profile.json and dynamically populates profile elements.
 */

const ICONS = {
  sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>`,
  code: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  database: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  wrench: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  bolt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  football: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/></svg>`,
  trophy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  bot: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  gamepad: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>`,
  book: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  gradCap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  briefcase: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  lightbulb: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  laptopCode: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2"/><path d="M2 20h20"/><path d="m10 9-2 2 2 2"/><path d="m14 9 2 2-2 2"/></svg>`
};

function getIconSvg(iconKey) {
  return ICONS[iconKey] || ICONS['code'];
}

export async function loadProfile() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/profile.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/profile.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/profile.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initProfile() {
  let profile;
  try {
    profile = await loadProfile();
  } catch (err) {
    console.warn(`initProfile: ${err.message || err}`);
    return;
  }

  if (!profile) return;

  // 1. Hero Brand
  const brandEl = document.querySelector('.site-nav__brand');
  if (brandEl && profile.displayName) {
    brandEl.textContent = profile.displayName;
  }

  // 2. Hero Eyebrow / Role
  const eyebrowEl = document.querySelector('.hero__eyebrow');
  if (eyebrowEl && profile.role) {
    eyebrowEl.textContent = profile.role;
  }

  // 3. Hero Name / Title
  const titleEl = document.querySelector('#hero-title');
  if (titleEl && profile.name) {
    titleEl.textContent = profile.name;
  }

  // 4. Hero Line / Positioning
  const positioningEl = document.querySelector('.hero__positioning');
  if (positioningEl && profile.heroLine) {
    positioningEl.textContent = profile.heroLine;
  }

  // 5. About Prose
  const proseEl = document.querySelector('#about .prose');
  if (proseEl && Array.isArray(profile.about) && profile.about.length > 0) {
    proseEl.innerHTML = '';
    profile.about.forEach((paragraphText) => {
      const p = document.createElement('p');
      p.textContent = paragraphText;
      proseEl.appendChild(p);
    });
  }

  // 6. What I Build Sublist
  if (Array.isArray(profile.whatIBuild)) {
    const listEl = document.querySelector('.about-subcol:nth-child(1) .about-icon-list');
    if (listEl) {
      listEl.innerHTML = '';
      profile.whatIBuild.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="about-icon">${getIconSvg(item.icon)}</span> <span>${item.text}</span>`;
        listEl.appendChild(li);
      });
    }
  }

  // 7. Outside of Coding Sublist
  if (Array.isArray(profile.outsideOfCoding)) {
    const listEl = document.querySelector('.about-subcol:nth-child(2) .about-icon-list');
    if (listEl) {
      listEl.innerHTML = '';
      profile.outsideOfCoding.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="about-icon">${getIconSvg(item.icon)}</span> <span>${item.text}</span>`;
        listEl.appendChild(li);
      });
    }
  }

  // 8. Profile Card
  if (profile.profileCard) {
    const card = profile.profileCard;
    const nameEl = document.querySelector('.profile-card__name');
    if (nameEl && card.name) nameEl.textContent = card.name;

    const taglineEl = document.querySelector('.profile-card__tagline');
    if (taglineEl && card.tagline) taglineEl.textContent = card.tagline;

    if (Array.isArray(card.currently)) {
      const currentList = document.querySelector('.profile-card__info-list');
      if (currentList) {
        currentList.innerHTML = '';
        card.currently.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="profile-card__icon">${getIconSvg(item.icon)}</span> <span>${item.text}</span>`;
          currentList.appendChild(li);
        });
      }
    }

    if (Array.isArray(card.languages)) {
      const langEl = document.querySelector('.profile-card__languages');
      if (langEl) {
        langEl.innerHTML = '';
        card.languages.forEach((lang) => {
          const span = document.createElement('span');
          span.textContent = lang;
          langEl.appendChild(span);
        });
      }
    }

    if (Array.isArray(card.interests)) {
      const gridEl = document.querySelector('.profile-card__interests-grid');
      if (gridEl) {
        gridEl.innerHTML = '';
        card.interests.forEach((item) => {
          const div = document.createElement('div');
          div.className = 'interest-item';
          div.innerHTML = `<span class="interest-icon">${getIconSvg(item.icon)}</span> <span>${item.text}</span>`;
          gridEl.appendChild(div);
        });
      }
    }

    if (card.quote) {
      const quoteEl = document.querySelector('.profile-card__quote p');
      if (quoteEl) quoteEl.textContent = card.quote;
    }
  }
}
