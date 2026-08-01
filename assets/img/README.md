# Image Assets

## Project Images

Each featured project requires two WebP files at the display widths used in `srcset`:

| Size | Filename pattern | Purpose |
| ---- | ---------------- | ------- |
| 1x (1200px wide) | `{project-id}-1200w.webp` | Default display size |
| 2x (2400px wide) | `{project-id}-2400w.webp` | High-DPI / retina screens |

### Requirements

- **Format**: WebP only (`.webp` extension, lowercase)
- **Max file size**: 150 KB per image
- **Aspect ratio**: 16:9 (1200×675 at 1x, 2400×1350 at 2x)
- **Colour space**: sRGB
- **Compression**: Lossy WebP, quality 75–85 for screenshots
- **Naming**: kebab-case project id + width descriptor, e.g. `orbit-dashboard-1200w.webp`

### Attributes set by the renderer

The `renderCard` function in `js/modules/projects.js` sets:

- `src` — the 1x path from `projects.json` image object
- `srcset` — `{1x-path} {width}w, {2x-path} {width*2}w`
- `sizes` — `(min-width: 64em) 600px, (min-width: 48em) 50vw, 100vw`
- `width` / `height` — intrinsic 1x pixel dimensions (prevents CLS)
- `loading="lazy"` — all project images are below the fold
- `decoding="async"` — non-blocking decode

### Hero content

The hero section uses display typography as its LCP element — no image. Therefore no
`loading="lazy"` exists in the initial viewport and hero content is never lazy-loaded.

## Other assets

- **og-portfolio-1200x630.webp** — Social preview / Open Graph image (1200×630, ≤200 KB)

## Current status

Project image files referenced in `data/projects.json` are placeholders. Replace with real
screenshots before deploying. The site functions without them (broken image shows alt text).
