---
inclusion: fileMatch
fileMatchPattern: '*.js'
---

# JavaScript Conventions

## Progressive enhancement is the contract

The page must be readable, navigable, and complete with JavaScript disabled or failed.

- Content that matters for a first impression — name, role, about, contact, resume link — is in
  `index.html` as static markup. JS never renders it.
- JS-rendered content (project cards from JSON) must degrade to a visible, useful fallback:
  static `<noscript>` links to the GitHub profile, or server-free placeholder markup already in
  the HTML that JS replaces.
- Never gate a link behind a click handler. Links are `<a href>`; JS may enhance, not create.
- If a module throws, the rest of the page keeps working. Wrap each init in its own try/catch or
  fail-soft guard.

## Module shape

Each module exports one `init` function and keeps its internals private.

```js
// js/modules/reveal.js
const SELECTOR = '[data-reveal]';

export function initReveal() {
  const targets = document.querySelectorAll(SELECTOR);
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  // ...observe
}
```

Rules:

- Named exports only. No default exports.
- `const` by default, `let` when reassigned, never `var`.
- Pure functions where possible; keep DOM reads and writes at the edges.
- Guard every entry point: if the target elements are absent, return early and silently.
- No global namespace pollution. Modules are already scoped — do not attach to `window`.
- No classes unless there is genuine per-instance state. A function is usually enough.

## DOM

- Query once, cache the result. Do not re-query inside loops or handlers.
- Build nodes with `document.createElement` and set text via `textContent`.
- **Never** use `innerHTML` with data from JSON. That is an XSS path even for own-authored data,
  and it teaches the wrong habit in a work sample. Use `<template>` plus `cloneNode(true)` for
  repeated structures.
- Batch DOM insertions with `DocumentFragment`; append once.
- Event delegation on a container instead of a listener per card.
- Toggle state with `classList` and `data-*`, never inline `style`. Styling stays in CSS.

## Async and data

- `fetch` with `await`, always check `response.ok`, always `catch`.
- Fetch each JSON file once. No caching layer, no retry logic, no request abstraction.
- Top-level `await` is allowed in modules but do not let it block first paint — render static
  content first, hydrate lists after.

```js
async function loadProjects() {
  const response = await fetch('data/projects.json');
  if (!response.ok) throw new Error(`projects.json: ${response.status}`);
  return response.json();
}
```

## Performance

- Throttle scroll and resize work with `requestAnimationFrame`; prefer `IntersectionObserver` over
  scroll handlers entirely.
- Passive listeners for scroll and touch: `{ passive: true }`.
- Remove observers and listeners when their work is done.

## What not to build

- No router, no state store, no templating engine, no event bus, no DI container.
- No wrapper around `fetch`, no `$()` helper that reimplements a library.
- No config objects for values used once.
- `js/modules/dom.js` may hold a handful of genuinely repeated helpers. If it grows past a few
  small functions, it has become a framework — stop.

## Comments

Explain *why*, not *what*. A comment restating the code is noise; a comment explaining a
non-obvious tradeoff or a browser quirk is valuable.
