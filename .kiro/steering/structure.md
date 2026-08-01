# Project Structure

## Layout

```
portfolio/
├── index.html              # the entire site — single page
├── 404.html                # GitHub Pages fallback
├── .nojekyll               # stop Pages from running Jekyll
├── robots.txt
├── sitemap.xml
├── design.md               # design system source of truth
├── assets/
│   ├── fonts/              # self-hosted woff2 only
│   ├── img/                # project shots, og image
│   ├── icons/              # inline-able svg
│   └── resume.pdf
├── css/
│   ├── tokens.css          # @layer tokens   — custom properties only
│   ├── base.css            # @layer base     — reset, elements, typography
│   ├── layout.css          # @layer layout   — page shell, sections, grids
│   ├── components.css      # @layer components
│   └── utilities.css       # @layer utilities
├── js/
│   ├── main.js             # entry: wires modules, nothing else
│   └── modules/
│       ├── projects.js     # render featured + other projects
│       ├── nav.js          # mobile nav, active-section highlight
│       ├── reveal.js       # IntersectionObserver enter animations
│       └── dom.js          # tiny shared DOM helpers
└── data/
    ├── projects.json
    ├── stack.json
    └── profile.json        # about, education, contact, socials
```

## Rules

- **One page.** All sections live in `index.html`. No routing, no partials.
- **Stylesheets link directly** in `<head>` in the order above. Do not use CSS `@import` — it
  serialises downloads and blocks render. Keep the file count at five; add a sixth only for a
  genuinely separate concern.
- **`main.js` orchestrates, never implements.** It imports modules and calls their init. Logic
  belongs in `js/modules/`.
- **One module, one responsibility.** If a module name needs "and", split it.
- **No file over ~250 lines.** Past that, the concern is doing too much.
- **Flat is fine.** Do not nest `js/modules/` or `css/` further. This project is not big enough
  to earn a deeper tree.

## Naming

| Thing            | Convention        | Example                  |
| ---------------- | ----------------- | ------------------------ |
| Files, folders   | `kebab-case`      | `projects.json`          |
| CSS classes      | `kebab-case` BEM  | `project-card__title`    |
| Custom properties| `--kebab-case`    | `--space-lg`             |
| JS variables/fns | `camelCase`       | `renderProjectCard()`    |
| JS constants     | `SCREAMING_SNAKE` | `FEATURED_LIMIT`         |
| Data keys (JSON) | `camelCase`       | `caseStudyUrl`           |
| Section ids      | `kebab-case`      | `id="featured-projects"` |

Image files carry intent and dimensions: `orbit-dashboard-1200w.webp`.

## Where things go

Before creating a file, place the change in an existing one. New files are the last resort, not
the first move.

- A new colour, size, or duration → `css/tokens.css`, never a literal at the use site
- A restyle of an existing element → the layer that already owns it
- A new reusable visual block → `css/components.css`
- Behaviour touching one section → that section's module
- Any human-readable copy → `data/*.json`
