/**
 * Education module — fetches data/education.json and populates education card + collapsible toggle interaction.
 */

export async function loadEducation() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/education.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/education.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/education.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initEducation() {
  // 1. Setup collapsible toggle interaction
  const toggleBtn = document.querySelector('[data-education-toggle]');
  const wrapper = document.querySelector('[data-education-details]');

  if (toggleBtn && wrapper) {
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = wrapper.classList.contains('is-collapsed');

      if (isCollapsed) {
        wrapper.classList.remove('is-collapsed');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.classList.remove('is-collapsed');
      } else {
        wrapper.classList.add('is-collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.classList.add('is-collapsed');
      }
    });
  }

  // 2. Fetch and render data
  let eduData;
  try {
    eduData = await loadEducation();
  } catch (err) {
    console.warn(`initEducation data: ${err.message || err}`);
    return;
  }

  if (!eduData) return;

  // Eyebrow and title
  const eyebrowNum = document.querySelector('#education .section__num');
  if (eyebrowNum && eduData.eyebrowNum) eyebrowNum.textContent = eduData.eyebrowNum;

  const eduTitle = document.querySelector('#education-title');
  if (eduTitle && eduData.title) eduTitle.textContent = eduData.title;

  // Main Info
  const programTitle = document.querySelector('.education-card__program-title');
  if (programTitle && eduData.programTitle) programTitle.textContent = eduData.programTitle;

  const degreesEl = document.querySelector('.education-card__degrees');
  if (degreesEl && eduData.degrees) degreesEl.innerHTML = eduData.degrees;

  const instEl = document.querySelector('.education-card__institutions');
  if (instEl && eduData.institutions) instEl.textContent = eduData.institutions;

  const datesEl = document.querySelector('.education-card__dates');
  if (datesEl && eduData.dates) datesEl.textContent = eduData.dates;

  // Logos
  if (Array.isArray(eduData.logos)) {
    const logosWrap = document.querySelector('.education-card__logos');
    if (logosWrap && eduData.logos.length >= 2) {
      logosWrap.innerHTML = `
        <div class="education-logo-badge">
          <div class="education-logo-circle">
            <img src="${eduData.logos[0].src}" alt="${eduData.logos[0].alt}" class="education-logo-img" width="56" height="56" />
          </div>
          <span class="education-logo-label">${eduData.logos[0].label}</span>
        </div>
        <span class="education-card__x" aria-hidden="true">x</span>
        <div class="education-logo-badge">
          <div class="education-logo-circle">
            <img src="${eduData.logos[1].src}" alt="${eduData.logos[1].alt}" class="education-logo-img" width="56" height="56" />
          </div>
          <span class="education-logo-label">${eduData.logos[1].label}</span>
        </div>
      `;
    }
  }

  // Details Section (Awards, Leadership, Sports)
  if (eduData.details) {
    // Awards
    if (Array.isArray(eduData.details.awards)) {
      const awardsList = document.querySelector('.education-col:nth-child(1) .education-col__list');
      if (awardsList) {
        awardsList.innerHTML = '';
        eduData.details.awards.forEach((awardHtml) => {
          const li = document.createElement('li');
          li.innerHTML = awardHtml;
          awardsList.appendChild(li);
        });
      }
    }

    // Leadership
    if (eduData.details.leadership) {
      const leadSubtitle = document.querySelector('.education-col:nth-child(2) .education-col__subtitle');
      if (leadSubtitle && eduData.details.leadership.subtitle) {
        leadSubtitle.textContent = eduData.details.leadership.subtitle;
      }

      if (Array.isArray(eduData.details.leadership.highlights)) {
        const leadList = document.querySelector('.education-col:nth-child(2) .education-col__list');
        if (leadList) {
          leadList.innerHTML = '';
          eduData.details.leadership.highlights.forEach((hl) => {
            const li = document.createElement('li');
            li.textContent = hl;
            leadList.appendChild(li);
          });
        }
      }
    }

    // Sports Achievements
    if (Array.isArray(eduData.details.sportsAchievements)) {
      const sportsList = document.querySelector('.education-col:nth-child(3) .education-col__list');
      if (sportsList) {
        sportsList.innerHTML = '';
        eduData.details.sportsAchievements.forEach((sportHtml) => {
          const li = document.createElement('li');
          li.className = 'education-col__item--medal';
          li.innerHTML = sportHtml;
          sportsList.appendChild(li);
        });
      }
    }
  }
}
