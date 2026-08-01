/**
 * Hero section module — fetches data/hero.json and populates Hero section elements.
 */

export async function loadHero() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/hero.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/hero.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/hero.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initHero() {
  let hero;
  try {
    hero = await loadHero();
  } catch (err) {
    console.warn(`initHero: ${err.message || err}`);
    return;
  }

  if (!hero) return;

  // Status badge
  const statusSpan = document.querySelector('.hero__status-badge span:last-child');
  if (statusSpan && hero.statusBadge) {
    statusSpan.textContent = hero.statusBadge;
  }

  // Subtitle / Eyebrow
  const eyebrowEl = document.querySelector('.hero__eyebrow');
  if (eyebrowEl && hero.eyebrow) {
    eyebrowEl.textContent = hero.eyebrow;
  }

  // Greeting
  const greetingEl = document.querySelector('.hero__greeting');
  if (greetingEl && hero.greeting) {
    greetingEl.textContent = hero.greeting;
  }

  // Name / Title
  const titleEl = document.querySelector('#hero-title');
  if (titleEl && hero.name) {
    titleEl.textContent = hero.name;
  }

  // Aka / Alias
  const akaEl = document.querySelector('.hero__aka');
  if (akaEl && hero.aka) {
    akaEl.innerHTML = hero.aka;
  }

  // Positioning
  const positioningEl = document.querySelector('.hero__positioning');
  if (positioningEl && hero.positioning) {
    positioningEl.textContent = hero.positioning;
  }

  // Actions
  if (Array.isArray(hero.actions)) {
    const actionsContainer = document.querySelector('.hero__actions');
    if (actionsContainer) {
      actionsContainer.innerHTML = '';
      hero.actions.forEach((act) => {
        const btn = document.createElement('a');
        btn.className = `btn btn--${act.variant}`;
        btn.href = act.href;
        btn.textContent = act.label;
        actionsContainer.appendChild(btn);
      });
    }
  }
}
