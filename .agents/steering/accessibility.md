---
inclusion: fileMatch
fileMatchPattern: '*.{html,css,js}'
---

# Accessibility

Target: **WCAG 2.1 AA**. On a portfolio read by engineers, an inaccessible page is a visible
technical failure. These are acceptance criteria.

## Semantic HTML first

Use the element that means the thing. ARIA is a patch for when no element fits, not a first move.

- One `<h1>` (the name in the hero). Headings descend without skipping levels.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. One `<main>`.
- Every `<section>` gets an accessible name via `aria-labelledby` pointing at its heading.
- `<a>` navigates, `<button>` acts. Never a `<div>` with a click handler.
- Lists for lists: projects, tech stack, and social links are `<ul>`.
- `<time datetime="2026">` for dates, `<address>` for contact details.
- Skip link as the first focusable element: `<a href="#main" class="skip-link">Skip to content</a>`,
  visually hidden until focused.

## Keyboard

- Every interactive element is reachable and operable by keyboard, in visual order.
- **Never** remove focus styles. Style them:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-tertiary);
    outline-offset: 3px;
    border-radius: var(--radius-sm);
  }
  ```
  The accent at 3.24:1 against neutral clears the 3:1 non-text requirement.
- No positive `tabindex`. `tabindex="-1"` only for programmatic focus targets.
- If a mobile nav overlay is added: trap focus inside it, close on `Escape`, restore focus to the
  trigger, and mark the trigger with `aria-expanded`.

## Text and colour

- Follow the contrast table in `design-system.md`. `--color-secondary` and `--color-tertiary` do
  **not** pass for body-size text — use `--color-text-muted` and `--color-accent-text`.
- Colour is never the only signal. Links get an underline or a persistent border, not just accent.
- Body copy stays selectable and zoomable: no `user-select: none`, no `maximum-scale` in the
  viewport meta. Layout must survive 200% zoom and a 320px viewport.
- Line length capped by `--measure`. Line height at least 1.5 for body text (`--leading-body` is
  1.65).

## Images, icons, media

- Every `<img>` has `alt`. Descriptive for content, `alt=""` for decoration.
- Inline decorative SVG: `aria-hidden="true"` plus `focusable="false"`.
- Meaningful SVG: `role="img"` with a `<title>`.
- Icon-only buttons need an accessible name via `aria-label` or visually hidden text.

## Motion

Honour the user's preference. Wrap all non-essential animation:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

JS must check `matchMedia('(prefers-reduced-motion: reduce)').matches` before starting scroll
reveals and apply the final state immediately instead.

## Dynamic content

When project cards render from JSON, the result must be as accessible as static markup: real
headings inside cards, real links with meaningful text ("View Orbit source", not "Click here"),
and no focus loss on insert. If a load fails, surface a visible message, not a silent empty list.

## Verification before calling it done

1. Tab through the whole page. Every stop is visible and in order.
2. Load with JS disabled. The page still reads and the resume still downloads.
3. Zoom to 200%. Nothing clips or overlaps.
4. Run Lighthouse accessibility — expect 100. Automated checks cover roughly a third of WCAG, so
   the manual keyboard pass is not optional.
5. Full conformance also needs screen reader testing and expert review; state that honestly rather
   than claiming compliance from a Lighthouse score alone.
