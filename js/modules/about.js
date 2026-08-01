/**
 * About section module — fetches data/about.json and populates About section and Profile Card.
 */

export async function loadAbout() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/about.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/about.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/about.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initAbout() {
  let aboutData;
  try {
    aboutData = await loadAbout();
  } catch (err) {
    console.warn(`initAbout: ${err.message || err}`);
    return;
  }

  if (!aboutData) return;

  // Eyebrow and Title
  const eyebrowNum = document.querySelector('#about .section__num');
  if (eyebrowNum && aboutData.eyebrowNum) eyebrowNum.textContent = aboutData.eyebrowNum;

  const aboutTitle = document.querySelector('#about-title');
  if (aboutTitle && aboutData.title) aboutTitle.textContent = aboutData.title;

  // Prose
  const proseContainer = document.querySelector('#about .about-prose');
  if (proseContainer && Array.isArray(aboutData.prose)) {
    proseContainer.innerHTML = '';
    aboutData.prose.forEach((pText) => {
      const p = document.createElement('p');
      p.textContent = pText;
      proseContainer.appendChild(p);
    });
  }

  // What I Build List
  if (aboutData.whatIBuild) {
    const titleEl = document.querySelector('.about-subcol:nth-child(1) .about-subcol__title');
    if (titleEl && aboutData.whatIBuild.title) titleEl.textContent = aboutData.whatIBuild.title;

    const listEl = document.querySelector('.about-subcol:nth-child(1) .about-icon-list');
    if (listEl && Array.isArray(aboutData.whatIBuild.items)) {
      listEl.innerHTML = '';
      aboutData.whatIBuild.items.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="about-icon"><i class="${item.iconClass}"></i></span><span>${item.text}</span>`;
        listEl.appendChild(li);
      });
    }
  }

  // Outside of Coding List
  if (aboutData.outsideOfCoding) {
    const titleEl = document.querySelector('.about-subcol:nth-child(2) .about-subcol__title');
    if (titleEl && aboutData.outsideOfCoding.title) titleEl.textContent = aboutData.outsideOfCoding.title;

    const listEl = document.querySelector('.about-subcol:nth-child(2) .about-icon-list');
    if (listEl && Array.isArray(aboutData.outsideOfCoding.items)) {
      listEl.innerHTML = '';
      aboutData.outsideOfCoding.items.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="about-icon"><i class="${item.iconClass}"></i></span><span>${item.text}</span>`;
        listEl.appendChild(li);
      });
    }
  }

  // Profile Card
  if (aboutData.profileCard) {
    const card = aboutData.profileCard;

    const avatarImg = document.querySelector('.profile-card__avatar');
    if (avatarImg && card.avatar) avatarImg.src = card.avatar;

    const nameEl = document.querySelector('.profile-card__name');
    if (nameEl && card.name) nameEl.textContent = card.name;

    const taglineEl = document.querySelector('.profile-card__tagline');
    if (taglineEl && card.tagline) taglineEl.textContent = card.tagline;

    if (Array.isArray(card.currently)) {
      const infoList = document.querySelector('.profile-card__info-list');
      if (infoList) {
        infoList.innerHTML = '';
        card.currently.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="profile-card__icon"><i class="${item.iconClass}"></i></span><span>${item.text}</span>`;
          infoList.appendChild(li);
        });
      }
    }

    if (Array.isArray(card.languages)) {
      const langContainer = document.querySelector('.profile-card__languages');
      if (langContainer) {
        langContainer.innerHTML = '';
        card.languages.forEach((lang) => {
          const span = document.createElement('span');
          span.textContent = lang;
          langContainer.appendChild(span);
        });
      }
    }

    if (Array.isArray(card.interests)) {
      const interestsGrid = document.querySelector('.profile-card__interests-grid');
      if (interestsGrid) {
        interestsGrid.innerHTML = '';
        card.interests.forEach((item) => {
          const div = document.createElement('div');
          div.className = 'interest-item';
          div.innerHTML = `<span class="interest-icon"><i class="${item.iconClass}"></i></span><span>${item.text}</span>`;
          interestsGrid.appendChild(div);
        });
      }
    }

    if (card.quote) {
      const quoteEl = document.querySelector('.profile-card__quote p');
      if (quoteEl) quoteEl.textContent = card.quote;
    }
  }
}
