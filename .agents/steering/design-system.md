# Design System

`design.md` at the repo root is the **single source of truth** for colour, type, spacing, and
component style. When this file and `design.md` disagree, `design.md` wins and this file is the
bug.

#[[file:design.md]]

## The system in one line

Off-white paper, ink text, one deliberate orange accent. Modern, minimal, editorial, premium.

## Load-bearing rules

These are not preferences. Breaking them breaks the design.

1. **One accent action per screen.** `--color-tertiary` (`#E6552F`) drives interaction and nothing
   else. If two things on screen are orange, one of them is wrong.
2. **No gradients.** The system is flat on purpose. No glassmorphism, no glows, no drop shadows as
   decoration. Depth comes from a 1px `--color-secondary` hairline.
3. **Negative space is a feature.** `--color-neutral` carries the composition. When a section feels
   empty, that is usually correct. Add space before adding elements.
4. **No second accent.** No blue links, no green success, no purple gradients. Semantic states
   reuse ink and the single accent.
5. **Editorial contrast.** Fraunces display at large sizes against small mono labels is the whole
   visual voice. Do not flatten the type scale into one size.

## Tokens

Every value in CSS resolves to a custom property in `css/tokens.css`. No hex codes, raw px, or
magic numbers outside that file.

```css
@layer tokens {
  :root {
    /* colour — from design.md */
    --color-primary: #131210;    /* headlines, body ink */
    --color-secondary: #716E68;  /* borders, captions, metadata */
    --color-tertiary: #E6552F;   /* the one accent. reserve it. */
    --color-neutral: #F3F0EA;    /* page foundation */
    --color-surface: #ffffff;    /* cards */
    --color-on-primary: #ffffff;

    /* accessible text variants — see the contrast note below */
    --color-text-muted: #5F5C57;
    --color-accent-text: #C0431C;

    /* type */
    --font-display: "Fraunces", Georgia, serif;
    --font-body: "Inter", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;

    --text-display: clamp(2.75rem, 9vw, 5rem);
    --text-h1: clamp(2rem, 5vw, 2.5rem);
    --text-h2: clamp(1.5rem, 3.5vw, 1.875rem);
    --text-h3: 1.25rem;
    --text-body: 0.98rem;
    --text-label: 0.72rem;

    --leading-tight: 1.1;
    --leading-body: 1.65;
    --tracking-display: -0.03em;
    --tracking-label: 0.06em;

    /* space — 8px base, design.md sm/md/lg extended by the same rhythm */
    --space-2xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 32px;
    --space-xl: 64px;
    --space-2xl: 96px;
    --space-section: clamp(var(--space-xl), 10vw, 160px);

    /* radius */
    --radius-sm: 2px;
    --radius-md: 4px;
    --radius-lg: 8px;

    /* motion */
    --ease-out: cubic-bezier(0.2, 0, 0.1, 1);
    --duration-fast: 120ms;
    --duration-base: 240ms;

    /* layout */
    --measure: 68ch;      /* max body text width */
    --container: 1200px;
  }
}
```

Fluid type via `clamp()` is a required extension: `design.md` specifies display at 5rem, which
overflows a 375px viewport unscaled. The upper bound of each clamp matches `design.md` exactly.

## Contrast: two colours are not text-safe

Verified against WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI):

| Pair                              | Ratio  | Verdict                        |
| --------------------------------- | ------ | ------------------------------ |
| `--color-primary` on neutral      | 16.5:1 | pass everywhere                |
| `--color-secondary` on neutral    | 4.46:1 | **fails** normal text, by a hair |
| `--color-tertiary` on white       | 3.68:1 | **fails** normal text          |
| `--color-tertiary` on neutral     | 3.24:1 | **fails** normal text          |
| `--color-accent-text` on neutral  | 4.54:1 | pass                           |
| `--color-text-muted` on neutral   | 5.85:1 | pass                           |

So:

- Use `--color-secondary` for **borders, rules, and icons** — never for body copy or captions.
  For muted text use `--color-text-muted`.
- Use `--color-tertiary` for **fills, underlines, focus rings, and large display text (≥24px)**.
  For accent-coloured body-size text or links use `--color-accent-text`.
- Never put `--color-on-primary` white text on `--color-tertiary` below 18.66px bold — that
  combination is 3.68:1 and only clears large-text AA.

`--color-text-muted` and `--color-accent-text` are derived, not from `design.md`. Confirm the
exact values before finalising the palette.

## Components

Defined in `design.md`, restated here as build contracts:

- **Primary button** — `--color-tertiary` fill, white label, `--radius-md`, `12px 20px` padding.
  Exactly one per screen. Hover darkens the fill; it does not change hue.
- **Secondary button** — transparent fill, 1px `--color-secondary` border, ink label.
- **Card** — `--color-surface` background on the neutral page, `--radius-lg`, `24px` padding, 1px
  hairline border. No shadow.
- **Label** — JetBrains Mono, `--text-label`, `--tracking-label`, uppercase. Used for section
  eyebrows, years, and tags. This is what makes the site read as editorial.

## Before you add a style

1. Is there a token for this value? Use it.
2. Is there an existing component that fits? Extend it.
3. Does this introduce a second accent, a gradient, or a shadow? Stop.
