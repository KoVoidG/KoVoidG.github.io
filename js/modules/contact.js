/**
 * Contact module — fetches data/contact.json and populates contact section elements.
 */

export async function loadContact() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('data/contact.json', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`data/contact.json: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('data/contact.json: request timed out after 5000ms');
    }
    throw error;
  }
}

export async function initContact() {
  let contactData;
  try {
    contactData = await loadContact();
  } catch (err) {
    console.warn(`initContact: ${err.message || err}`);
    return;
  }

  if (!contactData) return;

  // Eyebrow and title
  const eyebrowNum = document.querySelector('#contact .section__num');
  if (eyebrowNum && contactData.eyebrowNum) eyebrowNum.textContent = contactData.eyebrowNum;

  const contactTitle = document.querySelector('#contact-title');
  if (contactTitle && contactData.titleHtml) contactTitle.innerHTML = contactData.titleHtml;

  // Subtitle
  const contactSubtitle = document.querySelector('#contact .contact__subtitle');
  if (contactSubtitle && contactData.subtitleHtml) contactSubtitle.innerHTML = contactData.subtitleHtml;

  // Availability
  if (contactData.availability) {
    const statusEl = document.querySelector('.availability-status');
    if (statusEl && contactData.availability.status) {
      statusEl.innerHTML = `<span class="pulse-dot"></span> ${contactData.availability.status}`;
    }

    const availText = document.querySelector('.availability-text');
    if (availText && contactData.availability.text) {
      availText.textContent = contactData.availability.text;
    }
  }

  // Right column title
  const rightTitle = document.querySelector('.contact-right__title');
  if (rightTitle && contactData.contactRightTitle) {
    rightTitle.textContent = contactData.contactRightTitle;
  }

  // Contact cards list
  if (Array.isArray(contactData.cards)) {
    const cardsList = document.querySelector('.contact-cards-list');
    if (cardsList) {
      cardsList.innerHTML = '';
      contactData.cards.forEach((card) => {
        const isLink = Boolean(card.href);
        const el = document.createElement(isLink ? 'a' : 'div');
        el.className = 'contact-card';

        if (isLink) {
          el.href = card.href;
          if (card.external) {
            el.target = '_blank';
            el.rel = 'noopener me';
          }
        }

        el.innerHTML = `
          <div class="contact-card__icon">${card.iconSvg}</div>
          <div class="contact-card__content">
            <span class="contact-card__label">${card.label}</span>
            <span class="contact-card__val ${card.type === 'location' ? 'contact__location' : ''}">${card.val}</span>
          </div>
          <span class="contact-card__arrow" aria-hidden="true">↗</span>
        `;
        cardsList.appendChild(el);
      });
    }
  }

  // Quote
  if (contactData.quote) {
    const quoteText = document.querySelector('.contact-quote__text');
    if (quoteText && contactData.quote.text) quoteText.textContent = contactData.quote.text;

    const quoteAuthor = document.querySelector('.contact-quote__author');
    if (quoteAuthor && contactData.quote.author) quoteAuthor.textContent = contactData.quote.author;
  }

  // Copyright
  const copyrightEl = document.querySelector('.contact-copyright');
  if (copyrightEl && contactData.copyright) {
    copyrightEl.innerHTML = contactData.copyright;
  }
}
