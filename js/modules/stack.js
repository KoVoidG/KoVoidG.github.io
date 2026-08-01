/**
 * Interactive Tech Stack module — renders tech cards grid matching reference design and sticky right detail panel.
 * Fetches data/stack.json and data/stack-details.json.
 */

const TECH_ICONS = {
  html5: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E34F26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16l-1.5 17L12 22l-6.5-2L4 3z"/><path d="M16.5 7.5H8.5l.5 4h7l-.5 4.5-3.5 1-3.5-1-.2-2.5"/></svg>`,
  css3: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1572B6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3h16l-1.5 17L12 22l-6.5-2L4 3z"/><path d="M7.5 7.5h9l-.5 4H8l.5 4.5 3.5 1 3.5-1 .5-4.5"/></svg>`,
  javascript: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F7DF1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M16 16c-.5.8-1.4 1.2-2.5 1.2-1.6 0-2.5-.9-2.5-2.5v-3"/><path d="M12 9h.01"/></svg>`,
  typescript: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3178C6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M10 9H6v2.5h2v6H10v-6h2V9z"/><path d="M14 17c1.5 0 2.5-.8 2.5-2s-1-1.8-2-2l-1-.5c-.8-.4-1.2-.8-1.2-1.4 0-.8.7-1.3 1.7-1.3 1 0 1.8.4 2.2 1.2"/></svg>`,
  react: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#61DAFB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="#61DAFB"/></svg>`,
  nextjs: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 16V8l7 9V8"/></svg>`,
  tailwindcss: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-3.3 0-5.5 1.7-6.6 5 1.1-1.7 2.5-2.2 4.1-1.7 1 0 1.7.8 2.3 1.7C12.8 12.5 14 14 17.6 14c3.3 0 5.5-1.7 6.6-5-1.1 1.7-2.5 2.2-4.1 1.7-1 0-1.7-.8-2.3-1.7C16.8 7.5 15.6 6 12 6z"/><path d="M6.4 14c-3.3 0-5.5 1.7-6.6 5 1.1-1.7 2.5-2.2 4.1-1.7 1 0 1.7.8 2.3 1.7C7.2 20.5 8.4 22 12 22c3.3 0 5.5-1.7 6.6-5-1.1 1.7-2.5 2.2-4.1 1.7-1 0-1.7-.8-2.3-1.7C11.2 15.5 10 14 6.4 14z"/></svg>`,
  radixui: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="3"/><path d="M6 18h12L12 9z"/></svg>`,
  shadcnui: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="3"/><line x1="16" x2="8" y1="8" y2="16"/></svg>`,
  accessibility: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="m18 9-6 1-6-1"/><path d="M12 10v10"/><path d="m9 20 3-6 3 6"/></svg>`,
  nodejs: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#339933" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3.5 7v10L12 22l8.5-5V7L12 2z"/><path d="M12 12.5v7.5"/><path d="M12 12.5 4 7.5"/><path d="m12 12.5 8-5"/></svg>`,
  expressjs: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 4 6"/><path d="m10 9-4 6"/><path d="m14 12 4 3"/><path d="m18 12-4 3"/></svg>`,
  springboot: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6DB33F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6c-3 3-3 7 0 10s7 0 7-3-4-7-7-7z"/></svg>`,
  fastapi: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#009688" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  restapi: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="5" rx="3"/><path d="M8 10h.01M12 10h.01M16 10h.01"/><path d="M9 14h6"/></svg>`,
  postgresql: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4169E1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v12M6 12h12"/></svg>`,
  supabase: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3ECF8E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  mysql: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00758F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12c3-4 7-6 11-4s5 6 5 8-4 4-8 2-6-3-8-6z"/><path d="M18 12c.5 1 1 2.5 1 4"/></svg>`,
  sqlite: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#003B57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13.5V21h7.5l9.74-9.76z"/></svg>`,
  python: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3776AB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c-4 0-5 2-5 4v2h10V6c0-2-1-4-5-4z"/><path d="M12 22c4 0 5-2 5-4v-2H7v2c0 2 1 4 5 4z"/><circle cx="9" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`,
  gemini: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>`,
  pandas: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#150458" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="8" x2="8" y1="7" y2="17"/><line x1="12" x2="12" y1="7" y2="17"/><line x1="16" x2="16" y1="7" y2="17"/></svg>`,
  numpy: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#013243" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="12" x2="12" y1="4" y2="20"/></svg>`,
  scikitlearn: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F7931E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><circle cx="17" cy="8" r="1.5"/></svg>`,
  pytorch: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EE4C2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17"/></svg>`,
  matplotlib: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#11557C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 12 18 6"/><path d="M12 12v9"/></svg>`,
  seaborn: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3776AB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c4-4 8-4 10 0s6 4 10 0"/></svg>`,
  plotly: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3F4F75" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="8" x="5" y="11" rx="1"/><rect width="4" height="12" x="10" y="7" rx="1"/><rect width="4" height="6" x="15" y="13" rx="1"/></svg>`,
  streamlit: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF4B4B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 3 2 19 22 19 12 3"/></svg>`,
  jupyter: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F37626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)"/><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>`,
  git: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F05032" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8"/><path d="M18 16c0-4-3-6-6-6H6"/></svg>`,
  github: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  docker: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2496ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="4" height="4" x="4" y="10" rx="1"/><rect width="4" height="4" x="10" y="10" rx="1"/><rect width="4" height="4" x="16" y="10" rx="1"/><rect width="4" height="4" x="10" y="5" rx="1"/><path d="M2 15c2 4 8 5 12 5s8-2 8-5"/></svg>`,
  linux: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FCC624" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M8 20c0-4 1.8-8 4-8s4 4 4 8"/></svg>`,
  vscode: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007ACC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 3 4.5 2v14l-4.5 2-8.5-7.5L3 17l-1-1V8l1-1 5 3.5z"/><path d="m16.5 3-9 7.5"/></svg>`,
  npm: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CB3837" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="M7 9v6h3v-4h2v4h3V9H7z"/></svg>`,
  postman: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6C37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6"/><path d="M9 9h6v6"/></svg>`,
  figma: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F24E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>`,
  vercel: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 22 20 2 20 12 4"/></svg>`,
  render: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V6h6a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4H6"/><path d="m14 14 4 4"/></svg>`,
  githubpages: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  java: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ED8B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19c6 2 12 0 12 0"/><path d="M9 15c4 1 8 0 8 0"/><path d="M8 8s2-2 4-2 2 4 4 4"/></svg>`,
  sql: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00758F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/></svg>`,
  prisma: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D3748" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 20 20 4 17 12 2"/></svg>`,
  langgraph: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><line x1="8.5" x2="15.5" y1="6" y2="6"/><line x1="7.5" x2="10.5" y1="8.5" y2="15.5"/><line x1="16.5" x2="13.5" y1="8.5" y2="15.5"/></svg>`,
  systemdesign: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4"/></svg>`,
  aiagents: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E05A47" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`
};

export async function loadStackHeader() {
  try {
    const res = await fetch('data/stack.json');
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('initStack: could not load data/stack.json', err);
  }
  return null;
}

export async function initStack() {
  const container = document.getElementById('tech-stack');
  if (!container) return;

  // Render header data
  const stackHeader = await loadStackHeader();
  if (stackHeader) {
    const eyebrowNum = container.querySelector('.section__num');
    if (eyebrowNum && stackHeader.eyebrowNum) eyebrowNum.textContent = stackHeader.eyebrowNum;

    const titleEl = container.querySelector('#tech-stack-title');
    if (titleEl && stackHeader.title) titleEl.textContent = stackHeader.title;

    const badgeEl = container.querySelector('.stack-badge-tag');
    if (badgeEl && stackHeader.badgeTag) badgeEl.innerHTML = stackHeader.badgeTag;

    const subtitleEl = container.querySelector('.section__subtitle');
    if (subtitleEl && stackHeader.subtitle) subtitleEl.textContent = stackHeader.subtitle;
  }

  let stackDetails = {};
  try {
    const res = await fetch('data/stack-details.json');
    if (res.ok) {
      stackDetails = await res.json();
    }
  } catch (err) {
    console.warn('initStack: could not load data/stack-details.json', err);
  }

  const detailCard = document.querySelector('.tech-detail-card');
  const techCards = document.querySelectorAll('.stack-tech-tile, .stack-pill-item, .tag');

  if (!detailCard || techCards.length === 0) return;

  function updateDetailCard(techName) {
    const data = stackDetails[techName] || {
      displayName: techName,
      category: 'TECHNOLOGY',
      icon: 'code',
      description: `Core technology used for software development and engineering at Void.`,
      useCases: [
        'Building scalable applications with clean architecture',
        'Improving developer workflows and efficiency',
        'Integrating with modern full-stack systems'
      ],
      proficiency: 4
    };

    // Update Card Content
    const iconWrap = detailCard.querySelector('.tech-detail__icon');
    if (iconWrap) {
      const iconKey = (data.icon || '').toLowerCase();
      iconWrap.innerHTML = TECH_ICONS[iconKey] || `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    }

    const titleEl = detailCard.querySelector('.tech-detail__title');
    if (titleEl) titleEl.textContent = data.displayName || techName;

    const catEl = detailCard.querySelector('.tech-detail__category');
    if (catEl) catEl.textContent = data.category || 'TECHNOLOGY';

    const descEl = detailCard.querySelector('.tech-detail__description');
    if (descEl) descEl.textContent = data.description;

    // Use cases
    const useCasesWrap = detailCard.querySelector('.tech-detail__use-cases');
    if (useCasesWrap && Array.isArray(data.useCases)) {
      useCasesWrap.innerHTML = '';
      data.useCases.forEach((uc) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="check-icon">✓</span> <span>${uc}</span>`;
        useCasesWrap.appendChild(li);
      });
    }

    // Proficiency rating dots
    const ratingDots = detailCard.querySelector('.tech-detail__rating-dots');
    if (ratingDots) {
      ratingDots.innerHTML = '';
      const score = Math.max(1, Math.min(5, data.proficiency || 4));
      for (let i = 1; i <= 5; i++) {
        const dot = document.createElement('span');
        dot.className = `rating-dot ${i <= score ? 'is-active' : ''}`;
        ratingDots.appendChild(dot);
      }
    }
  }

  // Bind click & hover listeners on tech items
  techCards.forEach((card) => {
    const techName = card.dataset.tech;
    if (!techName) return;

    card.addEventListener('click', () => {
      techCards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');
      updateDetailCard(techName);
    });

    card.addEventListener('mouseenter', () => {
      updateDetailCard(techName);
    });
  });

  // Default initial selection
  updateDetailCard('HTML');
}
