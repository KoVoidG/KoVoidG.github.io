---
inclusion: fileMatch
fileMatchPattern: '*.css'
---

# CSS Conventions

## Cascade layers

Every rule lives in a layer. Declare the order once, in `tokens.css`, before anything else:

```css
@layer tokens, base, layout, components, utilities;
```

Layers replace specificity wars. Because a later layer always wins, selectors stay flat and
`!important` is never needed. If you reach for `!important`, the rule is in the wrong layer.

## Selectors

- Single class selectors by default. Max nesting depth: **2**.
- BEM-lite: `.block`, `.block__element`, `.block--variant`.
- No id selectors for styling. No element selectors outside `base`.
- No `>` `+` `~` chains deeper than one step.
- Use `:where()` to zero out specificity in resets, `:is()` to group.

```css
/* good */
.project-card__title { font-family: var(--font-display); }
.project-card--featured { grid-column: span 2; }

/* bad */
#projects .card div h3 { ... }
```

## Mobile-first

Base styles are the smallest viewport. Every media query is `min-width`, in `em`:

```css
.project-grid {
  display: grid;
  gap: var(--space-lg);
}

@media (min-width: 48em) {
  .project-grid { grid-template-columns: repeat(2, 1fr); }
}
```

Breakpoints: `40em` (640), `48em` (768), `64em` (1024), `80em` (1280). Do not invent others.
Prefer intrinsic layout that needs no breakpoint at all:

```css
grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
```

Use container queries when a component's layout depends on its own box rather than the viewport.

## Values

- **No literals.** Colours, spacing, radii, durations, and font sizes come from tokens. A raw
  `#fff`, `24px`, or `300ms` outside `tokens.css` is a defect.
- Exceptions: `0`, `1px` hairlines, `100%`, `1fr`, and `clamp()` viewport terms.
- Logical properties over physical: `margin-inline`, `padding-block`, `inset-inline-start`.
- `gap` for spacing between siblings, not margins on children.

## Layout approach

- **Grid** for two-dimensional structure: page shell, project grids, education rows.
- **Flexbox** for one-dimensional runs: button groups, tag lists, nav.
- No floats, no absolute positioning for layout. Absolute is for genuine overlays only.
- One shared container: `.container { width: min(100% - 2 * var(--space-lg), var(--container)); margin-inline: auto; }`.
- Vertical rhythm via `--space-section` on section padding. Do not hand-tune per section.

## Motion

- Animate `transform` and `opacity` only. Never `width`, `height`, `top`, or `box-shadow`.
- Durations from tokens: `--duration-fast` for hover, `--duration-base` for entrances.
- Never animate `all`. Name the properties.
- Every animation must be wrapped by the reduced-motion guard in `accessibility.md`.

## CSS before JS

If CSS can do it, JavaScript must not. Check this list before writing a script:

| Need              | CSS solution                                  |
| ----------------- | --------------------------------------------- |
| Smooth anchors    | `scroll-behavior: smooth`                     |
| Sticky header     | `position: sticky`                            |
| Show/hide panel   | `:has()`, `:target`, or the `hidden` attribute |
| Hover/focus state | `:hover`, `:focus-visible`                    |
| Accordion         | `<details>` / `<summary>`                     |
| Scroll snapping   | `scroll-snap-type`                            |
| Aspect ratio      | `aspect-ratio`                                |
| Truncation        | `line-clamp`                                  |

## File discipline

Comment each file with a short banner and keep related rules together. Order properties roughly:
layout → box → typography → visual → motion. Consistency matters more than the exact order.
