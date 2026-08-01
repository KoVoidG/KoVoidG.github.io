---
inclusion: fileMatch
fileMatchPattern: '*.{html,css,js}'
---

# Performance

A static vanilla site has no excuse for being slow. Targets, measured in Lighthouse mobile:

| Metric              | Target   |
| ------------------- | -------- |
| Performance score   | ≥ 98     |
| LCP                 | < 1.5s   |
| CLS                 | < 0.01   |
| INP                 | < 100ms  |
| Total page weight   | < 500KB  |
| Total requests      | < 20     |

## Fonts — the main risk

Three families (Fraunces, Inter, JetBrains Mono) is the largest single cost on this site.

- **Self-host** in `assets/fonts/`. No Google Fonts CDN: it adds a third-party connection, hurts
  LCP, and leaks visitor IPs.
- **woff2 only.** No woff, ttf, eot.
- **Subset to latin.** Fraunces is variable — ship the variable woff2 rather than several weights.
- Preload only fonts used above the fold, and only those:
  ```html
  <link rel="preload" href="assets/fonts/fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
  ```
- `font-display: swap` on every `@font-face`.
- Set `size-adjust`/`ascent-override` on the fallback or accept the swap shift — but verify CLS
  stays under target after the swap. Fraunces at 5rem swapping from Georgia is a visible jump.
- Budget: ≤ 4 font files, ≤ 150KB total.

## Images

- Format: WebP (AVIF optional). No PNG screenshots, no unoptimised JPEG.
- **Always** set `width` and `height` attributes. Missing dimensions is the number one cause of
  CLS on portfolio sites.
- `loading="lazy"` and `decoding="async"` on everything below the fold. Never lazy-load the hero.
- `srcset` + `sizes` for project shots; serve 1x and 2x at the real display width, not 4000px
  originals.
- Cap each project image at ~150KB.
- Prefer type as the hero visual over a large image — it costs nothing and fits the editorial
  system.

## Critical path

- CSS in `<head>` as direct `<link>` elements, ordered per `structure.md`. No `@import`.
- JS as `<script type="module" src="js/main.js"></script>` — modules defer by default. Never put
  a blocking script in `<head>`.
- Zero third-party requests: no CDNs, no analytics, no embedded widgets, no iframes.
- `data/*.json` fetched after first paint. The static above-the-fold content never waits on it.
- Keep JSON small; if `projects.json` approaches 50KB it is carrying prose that belongs in HTML.

## Runtime

- No layout thrash: batch reads, then writes.
- `IntersectionObserver` instead of scroll listeners. Passive listeners where a listener is needed.
- Animate only `transform` and `opacity`. Add `will-change` only for a measured problem, then
  remove it.
- No polling, no timers left running, no observers left attached after use.

## Head essentials

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="...">
<link rel="canonical" href="https://USERNAME.github.io/">
<meta property="og:title" content="..."> <!-- plus og:description, og:image, og:url -->
<meta name="twitter:card" content="summary_large_image">
```

Include `Person` JSON-LD structured data. One OG image at 1200×630, under 200KB.

## Before shipping

Run Lighthouse mobile in an incognito window with throttling on. If a metric misses, fix the cause
rather than lowering the target. Confirm the page still works on a cold cache and a slow 3G
profile.
