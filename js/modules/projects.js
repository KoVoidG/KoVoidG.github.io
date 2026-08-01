/**
 * Projects section module — fetches data/projects.json & data/projects-meta.json and dynamically populates
 * projects header, stats bento cards, featured bento grid, and project archive list.
 */

export async function loadProjects() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/projects.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/projects.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/projects.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function loadProjectsMeta() {
  try {
    const response = await fetch('data/projects-meta.json');
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn(`loadProjectsMeta: ${err}`);
  }
  return null;
}

export async function initProjects() {
  const container = document.getElementById('featured-projects');
  if (!container) return;

  const metaData = await loadProjectsMeta();
  if (metaData) {
    // 1. Header Info
    const eyebrowNum = container.querySelector('.section__num');
    if (eyebrowNum && metaData.eyebrowNum) eyebrowNum.textContent = metaData.eyebrowNum;

    const titleEl = container.querySelector('#featured-projects-title');
    if (titleEl && metaData.title) titleEl.textContent = metaData.title;

    const subtitleEl = container.querySelector('.section__subtitle');
    if (subtitleEl && metaData.subtitle) subtitleEl.textContent = metaData.subtitle;

    const ghBtn = container.querySelector('.btn--view-github');
    if (ghBtn && metaData.githubButton) {
      ghBtn.href = metaData.githubButton.url;
      ghBtn.innerHTML = `${metaData.githubButton.text} <span class="arrow-up-right">↗</span>`;
    }

    // 2. Stats Bento Cards
    if (Array.isArray(metaData.stats)) {
      const statsGrid = container.querySelector('.projects-stats-grid');
      if (statsGrid) {
        statsGrid.innerHTML = '';
        metaData.stats.forEach((stat) => {
          const card = document.createElement('div');
          card.className = 'project-stat-card';
          card.innerHTML = `
            <span class="project-stat-num">${stat.num}</span>
            <span class="project-stat-label">${stat.label}</span>
          `;
          statsGrid.appendChild(card);
        });
      }
    }

    // 3. Project Archive
    if (Array.isArray(metaData.archive)) {
      const archiveCard = container.querySelector('.project-archive__card');
      if (archiveCard) {
        archiveCard.innerHTML = '';
        metaData.archive.forEach((item) => {
          const a = document.createElement('a');
          a.className = 'project-archive__item';
          a.href = item.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.innerHTML = `
            <div class="project-archive__left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="project-archive__doc-icon">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span class="project-archive__name">${item.name}</span>
            </div>
            <span class="project-archive__link">${item.linkText}</span>
          `;
          archiveCard.appendChild(a);
        });
      }
    }
  }

  // 4. Featured 2x2 Bento Cards
  let projectsData;
  try {
    projectsData = await loadProjects();
  } catch (err) {
    console.warn(`initProjects loadProjects: ${err.message || err}`);
    return;
  }

  if (!projectsData || !Array.isArray(projectsData.featured)) return;

  const bentoGrid = container.querySelector('.bento-projects-grid');
  if (bentoGrid) {
    bentoGrid.innerHTML = '';
    projectsData.featured.forEach((project) => {
      const article = document.createElement('article');
      article.className = 'bento-project-card';

      const tagsHtml = Array.isArray(project.tech)
        ? project.tech.map((t) => `<span class="project-tech-pill">${t}</span>`).join('')
        : '';

      const repoUrl = project.links?.repo || '#';
      const demoUrl = project.links?.demo;
      const demoLinkHtml = (demoUrl && demoUrl !== '#')
        ? `<a href="${demoUrl}" class="project-icon-btn" aria-label="Live Demo" target="_blank" rel="noopener">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>`
        : '';

      article.innerHTML = `
        <div class="bento-project-card__image-container">
          <img src="${project.image.src}" alt="${project.image.alt}" class="bento-project-card__img" width="${project.image.width}" height="${project.image.height}" loading="lazy" />
        </div>
        <div class="bento-project-card__content">
          <h3 class="bento-project-card__title">${project.title}</h3>
          <p class="bento-project-card__desc">${project.tagline}</p>
          <div class="bento-project-card__footer">
            <div class="bento-project-card__tags">${tagsHtml}</div>
            <div class="bento-project-card__links">
              <a href="${repoUrl}" class="project-icon-btn" aria-label="GitHub Repository" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              ${demoLinkHtml}
            </div>
          </div>
        </div>
      `;
      bentoGrid.appendChild(article);
    });
  }
}
