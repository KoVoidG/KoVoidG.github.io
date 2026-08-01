# Implementation Plan: Portfolio Website

## Overview

Implementation language is **JavaScript (ES2020+, native ES modules)** as specified in the design's
low-level design section. There is no build step, no bundler, and no runtime dependency: the files in
the repository are the files served.

Tasks follow the milestone order in the design (M0 → M10): a deployable skeleton first, then tokens,
layout, components, static content, project data, the rendering pipeline, the behaviour modules,
orchestration, and finally accessibility, performance, and deployment hardening. Every milestone leaves
the site in a servable state.

Verification is manual by default — `python -m http.server 8000`, a keyboard walk, a JS-disabled load,
and Lighthouse. Property checks (marked `*`) live in a dev-only `tests/` directory and must never
become a prerequisite for the site to work.

## Tasks

- [x] 1. Deployable skeleton and hosting files
  - [x] 1.1 Create `index.html` shell with the `<head>` contract and all nine section shells
    - Write `<html lang="en">`, `<meta charset>`, viewport meta with no `maximum-scale` and no
      `user-scalable`, non-empty `<title>`, description, and canonical placeholder
    - Link the five stylesheets directly in layer order (`tokens`, `base`, `layout`, `components`,
      `utilities`), no `@import`, and add the deferred `<script type="module" src="js/main.js">`
    - Write the skip link as the first focusable element, `<header>` with
      `<nav aria-label="Primary">` (brand, five-item `[data-nav-list]`, Resume CTA to `#resume`),
      `<main id="main" tabindex="-1">`, and `<footer>`
    - Write the nine `<section>` shells in canonical order with ids `hero`, `about`, `tech-stack`,
      `featured-projects`, `other-projects`, `github`, `education`, `contact`, `resume`, each with
      `aria-labelledby` pointing at its own heading, one `<h1>` in the hero and one `<h2>` per
      remaining section
    - Keep every path relative with no leading slash
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.1, 9.8, 9.14, 10.7, 10.11_

  - [x] 1.2 Create the five CSS files with the layer order declaration
    - Create `css/tokens.css` opening with `@layer tokens, base, layout, components, utilities;`
    - Create `css/base.css`, `css/layout.css`, `css/components.css`, `css/utilities.css`, each wrapping
      its rules in its own `@layer` block
    - _Requirements: 11.5, 12.1_

  - [x] 1.3 Create the static hosting files
    - Create empty `.nojekyll`, `robots.txt` allowing all with a sitemap reference, `sitemap.xml` with
      the single canonical URL, and `404.html` reusing the same shell and stylesheet links with a link
      home
    - _Requirements: 11.13, 15.2, 15.3, 15.6_

- [x] 2. Design tokens, base layer, and self-hosted fonts
  - [x] 2.1 Write the full token set in `css/tokens.css`
    - Declare colour, type, spacing, radius, motion, and layout custom properties per the design
      system, including `--color-text-muted` and `--color-accent-text`
    - Use `clamp()` for `--text-display`, `--text-h1`, `--text-h2`, and `--space-section` with upper
      bounds matching `design.md` exactly
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 9.5_

  - [x] 2.2 Write `css/base.css` — reset, elements, typography, focus, motion guard
    - Write the reset, element defaults, body typography at `--text-body` / `--leading-body`, and
      heading typography from the display and heading tokens
    - Write `:focus-visible` with a 2px `--color-tertiary` outline and 3px offset, and never remove
      focus styles
    - Write the `prefers-reduced-motion: reduce` guard (the only permitted `!important`)
    - Write `@font-face` rules for Fraunces, Inter, and JetBrains Mono from `assets/fonts/` with
      `font-display: swap`
    - _Requirements: 9.3, 9.10, 12.7, 12.12, 10.4_

  - [x] 2.3 Add the woff2 font files and preload the two above-the-fold families
    - Place latin-subset woff2 files under `assets/fonts/` totalling at most four files and 150KB
    - Add exactly two `<link rel="preload" as="font" type="font/woff2" crossorigin>` elements to
      `index.html`
    - _Requirements: 10.4, 11.4, 16.9_

- [x] 3. Checkpoint — skeleton serves and reads
  - Serve with `python -m http.server 8000`, confirm the heading outline has one `<h1>` with no skipped
    levels, every nav anchor resolves to an existing id, and the Network panel shows zero 404s and zero
    third-party requests. Ensure all checks pass, ask the user if questions arise.

- [x] 4. Layout and responsive shell
  - [x] 4.1 Write `css/layout.css` — shell, sticky header, section rhythm, grids, breakpoints
    - Write `.container`, the sticky `.site-header`, `.section` block padding from `--space-section`,
      and the section grids (stack, project, education, footer) preferring intrinsic `auto-fit` over
      breakpoints
    - Write `html { scroll-behavior: smooth; scroll-padding-block-start: … }` sized to the header so
      anchor targets clear the sticky bar
    - Write the four `min-width` breakpoints at `40em`, `48em`, `64em`, `80em` and no others
    - _Requirements: 1.7, 2.2, 9.7, 12.6, 12.8_

  - [x] 4.2 Write the CSS-only mobile navigation row in `css/layout.css`
    - Below `48em` make the nav list an inline-scrolling `scroll-snap-type: inline mandatory` row with
      the CTA pinned inline-end; at `48em` and above lay it out inline with the brand
    - Add no JavaScript, no overlay, and no `aria-expanded` state (design decision D1)
    - _Requirements: 2.2, 9.7, 11.6_

- [x] 5. Components and utilities
  - [x] 5.1 Write `css/components.css` — buttons, cards, tags, labels, links, lists
    - Write `.btn--primary` (accent fill, white label at the ≥18.66px bold / ≥24px threshold,
      `--radius-md`, `12px 20px`), `.btn--secondary`, `.project-card`, `.other-item`, `.tag`,
      `.label`, `.link` with a persistent underline, `.education-item`, `.social-list`
    - Signal the active nav link with an accent underline of at least 2px plus a font-weight increase
      of at least 100 units
    - Use no gradient, no shadow, and no second accent hue; keep `--color-secondary` on borders and
      icons only and `--color-tertiary` off body-size text
    - _Requirements: 7.3, 9.5, 9.6, 12.2, 12.3, 12.9, 12.11_

  - [x] 5.2 Write `css/utilities.css` — container, visually-hidden, prose, label helpers
    - Write `.visually-hidden`, `.prose` capped at `--measure`, `.skip-link` visually hidden until
      focused and fully visible when focused, and the label utility
    - _Requirements: 9.1, 9.10, 9.16_

  - [x] 5.3 Write the reveal state classes in `css/components.css`
    - Make the revealed state the CSS default and scope the pre-reveal declarations to
      `[data-reveal].is-prereveal:not(.is-revealed)` so no script-absent path can hide content
    - Animate only `transform` and `opacity` over `--duration-base` with `--ease-out`, via classes
      only, and declare no `will-change`
    - _Requirements: 6.2, 6.8, 8.5, 10.13_

- [x] 6. Content contracts and static copy
  - [x] 6.1 Author `data/profile.json`
    - Write `name`, `role`, `heroLine` (≤120 chars), `about` (2–3 paragraphs, 200–600 characters
      total), 1–3 `education` entries with integer `startYear`/`endYear`, `contact` with an email and
      at most a city, 2–5 absolute `https://` `socials`, `resumePath`, and `githubUrl`
    - Omit absent optional fields rather than writing `null` or `""`; include no street address and no
      phone number
    - _Requirements: 13.1, 13.3, 13.4, 13.8, 13.11, 13.12, 16.6_

  - [x] 6.2 Author `data/stack.json`
    - Write the five domain groups (`languages`, `frontend`, `backend`, `ai`, `tooling`), each with
      3–6 duplicate-free entries of 1–24 characters in canonical spelling
    - _Requirements: 13.1, 13.2, 13.10_

  - [x] 6.3 Mirror the content contracts into the static sections of `index.html`
    - Fill hero (name, role eyebrow, positioning line, accent action to `#featured-projects`, secondary
      action), about prose, the five stack groups as `<h3>` + `.tag-list` with 2–6 tags each, the
      GitHub link-out, education rows with `<time datetime>`, `<address>` contact with the `mailto:`
      accent action and social links carrying `rel="me"`, the Resume section anchor to
      `assets/resume.pdf` with `download` and `type="application/pdf"`, and the footer
    - Keep exactly one accent action in each of header, hero, contact, and resume, and none elsewhere
    - Match every string character-for-character to `profile.json` / `stack.json`
    - _Requirements: 2.1, 2.3, 2.4, 6.1, 13.2, 13.3, 13.4, 14.1, 14.2_

  - [x] 6.4 Add the resume asset, social preview image, and page metadata
    - Add `assets/resume.pdf` (≤500KB, one page) and `assets/img/og-portfolio-1200x630.webp` (≤200KB)
    - Add `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, and `Person` JSON-LD to
      `index.html`, all paths relative or absolute to the deployed URL
    - Remove every `USERNAME`, `lorem`, and placeholder string, and every banned adjective
    - _Requirements: 13.9, 14.5, 15.4, 15.5_

- [x] 7. Dev-only property check harness
  - [x] 7.1 Set up the dev-only `tests/` harness and generators
    - Add `fast-check` and `jsdom` as devDependencies only, seed a jsdom document from the shipped
      `index.html`, and stub `fetch`, `matchMedia`, and `IntersectionObserver` at the module boundary
    - Write the generators named in the design: `validProject(kind)`, `hostileString()`,
      `arbitraryJson()`, `projectData()`, `revealTargets()`, `intersectionEntries()`
    - Reference nothing in `tests/` from `index.html`; the site must run with `node_modules/` deleted
    - _Requirements: 11.9_

  - [x] 7.2 Write property test for the content contract mirror
    - **Property 25: The content contract mirrors the document**
    - **Validates: Requirements 13.2, 13.3, 13.4, 13.7, 13.10, 13.11, 13.12**

- [x] 8. Curated project data contract
  - [x] 8.1 Author `data/projects.json`
    - Write 3–4 `featured` entries with `id`, `title`, `tagline`, `summary` (200–600 chars), `role`,
      integer `year`, `status`, 3–6 duplicate-free `tech`, 2–4 `highlights` of 20–120 characters with
      at least one numeric outcome, a non-empty `links` object, and a complete `image` object
    - Write 4–8 `other` entries with `id`, `title`, `tagline`, `year`, `tech`, and `links` only
    - Use kebab-case ids unique across both arrays, camelCase keys, absolute `https://` link values,
      omitted optional fields, and no comment or trailing comma; validate with `python -m json.tool`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13_

  - [x] 8.2 Write property test for the project data schema
    - **Property 1: Project data schema conformance**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.7, 3.11**

  - [x] 8.3 Write property test for featured images
    - **Property 2: Featured images are complete and descriptive**
    - **Validates: Requirements 3.6**

  - [x] 8.4 Write property test for project ids
    - **Property 3: Project ids are unique and well formed**
    - **Validates: Requirements 3.4**

  - [x] 8.5 Write property test for curation bounds and enumerations
    - **Property 4: Curation bounds and closed enumerations hold**
    - **Validates: Requirements 3.8, 3.9, 3.13**

  - [x] 8.6 Write property test for technology spelling across data files
    - **Property 26: Technology spelling matches across data files**
    - **Validates: Requirements 13.6**

- [x] 9. Checkpoint — static site complete
  - Serve locally, walk keyboard paths A–D from the design, load with JavaScript disabled, and confirm
    the resume downloads and a 60-second skim answers who, what, and how to reach. Ensure all checks
    pass, ask the user if questions arise.

- [x] 10. Project rendering pipeline
  - [x] 10.1 Add the project list containers, templates, and fallback markup to `index.html`
    - Add `[data-featured-list]` and `[data-other-list]` with `aria-busy="false"` in source and zero
      element children, plus the hidden `[data-fallback]` paragraph linking to the GitHub repositories
      page and exactly one `<noscript>` paragraph with the same link
    - Add `#featured-card-template` and `#other-item-template` at the end of `<body>` with the
      `[data-*]` hooks and the nested `[data-tech-item]`, `[data-highlight-item]`,
      `[data-link-item]` templates, `[data-reveal]` on the card root, and `<img>` carrying `alt`,
      `width`, `height`, `loading="lazy"`, `decoding="async"`
    - _Requirements: 6.4, 6.6, 5.12_

  - [x] 10.2 Write `js/modules/dom.js` helpers
    - Export `qs`, `qsa`, `cloneTemplate`, and `fillText` (sets `textContent`, removes the node when
      the value is absent) as named exports, and stop there
    - _Requirements: 11.6, 11.7, 4.3_

  - [x] 10.3 Write `loadProjects` and `validateProject` in `js/modules/projects.js`
    - Write `loadProjects` issuing exactly one `fetch('data/projects.json')` with an `AbortController`
      timeout of 5000ms, no retry and no cache layer, rejecting with an error naming the file and
      status
    - Write `validateProject(project, kind)` as a total, pure predicate covering the required-field,
      id-pattern, `links`, `image`, `status`, and `year` rules per kind, returning a boolean for any
      input without throwing or mutating its argument
    - _Requirements: 4.1, 5.7, 5.8, 16.3, 16.7_

  - [x] 10.4 Write property test for validator/schema agreement
    - **Property 5: The validator agrees with the schema**
    - **Validates: Requirements 5.8**

  - [x] 10.5 Write property test for validator totality and purity
    - **Property 6: The validator is total and pure**
    - **Validates: Requirements 5.7**

  - [x] 10.6 Write `renderCard` in `js/modules/projects.js`
    - Clone the template with `cloneNode(true)`, assign every text value via `textContent` and every
      URL via `setAttribute`, and concatenate no string into markup
    - Set `aria-labelledby` to an `<h3>` with id `project-{id}-title`, compose link text as
      `View {title} source` / `Open {title} live demo` / `Read the {title} case study` in repo, demo,
      case-study order with `rel="noopener"` on external links, remove hooks for absent optional
      fields, and fill the nested tech, highlight, and link rows up to 6 / 4 / 3
    - Return a detached fragment whose `<img>` already carries positive integer `width` and `height`
    - _Requirements: 4.3, 4.5, 4.6, 4.7, 4.8, 4.13, 10.6, 16.2, 16.4_

  - [x] 10.7 Write property test for absent optional fields
    - **Property 8: Absent optional fields leave no empty element**
    - **Validates: Requirements 4.5**

  - [x] 10.8 Write property test for rendered link quality
    - **Property 10: Rendered links are meaningful, addressable, and safe**
    - **Validates: Requirements 4.7, 4.8, 16.4**

  - [x] 10.9 Write property test for text never being interpreted as markup
    - **Property 11: Text is never interpreted as markup**
    - **Validates: Requirements 16.2**

  - [x] 10.10 Write property test for https-only rendered URLs
    - **Property 12: Rendered URLs are https-only**
    - **Validates: Requirements 16.3, 16.7**

  - [x] 10.11 Write property test for image dimensions before insertion
    - **Property 17: Image dimensions precede insertion**
    - **Validates: Requirements 10.6**

  - [x] 10.12 Write `renderList` in `js/modules/projects.js`
    - Build every node in one detached `DocumentFragment`, write to the live container exactly once
      with `replaceChildren`, return the count of valid items, skip invalid entries with one console
      warning naming the `id` or index, set `aria-busy="false"`, and move focus never
    - _Requirements: 4.2, 4.4, 4.10, 4.11, 4.12, 5.3_

  - [x] 10.13 Write property test for card counts and render idempotence
    - **Property 7: One card per project, and rendering is idempotent**
    - **Validates: Requirements 4.2, 4.11, 4.13**

  - [x] 10.14 Write `initProjects` with the fallback and terminal-state handling
    - Return silently when either list container or either template is absent, touching nothing and
      logging nothing
    - On non-2xx, parse failure, network rejection, abort, or a payload lacking `featured`/`other`
      arrays: remove `[data-placeholder]` children, unhide `[data-fallback]`, set
      `aria-busy="false"` on both containers, log exactly one error naming the file, and change nothing
      else
    - Render both lists within 100ms of parsed data, show the fallback when zero featured cards were
      produced, keep `hidden` on the fallback whenever at least one card rendered, and leave no timer
      pending
    - _Requirements: 4.9, 4.14, 4.15, 5.1, 5.2, 5.4, 5.5, 5.10, 5.11, 5.12_

  - [x] 10.15 Write property test for degradation on invalid input
    - **Property 20: Invalid input degrades, never throws**
    - **Validates: Requirements 4.9, 5.3, 5.11, 5.12**

- [x] 11. Document-level integrity property checks
  - [x] 11.1 Write property test for accessible names from real headings
    - **Property 9: Accessible names come from real headings**
    - **Validates: Requirements 4.6, 9.2**

  - [x] 11.2 Write property test for id uniqueness after rendering
    - **Property 13: Ids are unique in the rendered document**
    - **Validates: Requirements 4.12**

  - [x] 11.3 Write property test for the heading outline surviving rendering
    - **Property 14: The heading outline survives rendering**
    - **Validates: Requirements 1.4**

  - [x] 11.4 Write property test for in-page anchor resolution
    - **Property 15: Every in-page anchor resolves**
    - **Validates: Requirements 1.6**

  - [x] 11.5 Write property test for relative internal references
    - **Property 16: Internal references stay relative**
    - **Validates: Requirements 15.1, 14.4**

  - [x] 11.6 Write property test for the rendered attribute surface
    - **Property 18: The rendered attribute surface stays within the allowed set**
    - **Validates: Requirements 9.4, 9.9, 9.12**

  - [x] 11.7 Write property test for focus preservation during render
    - **Property 19: Render preserves focus**
    - **Validates: Requirements 4.10**

- [x] 12. Behaviour modules
  - [x] 12.1 Write `js/modules/nav.js` active-section highlighting
    - Use exactly one `IntersectionObserver` with `rootMargin: '-45% 0px -45% 0px'`, register zero
      `scroll` and zero `resize` listeners, and move `is-active` plus `aria-current="true"` to at most
      one link at a time
    - Ignore sections with no matching link and links whose fragment matches no element, return
      silently when `[data-nav-list]` is absent or empty or `IntersectionObserver` is unavailable, and
      start with zero active links
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6, 7.8, 7.9, 7.10, 10.9_

  - [x] 12.2 Write property test for single active navigation link
    - **Property 24: At most one navigation link is active**
    - **Validates: Requirements 7.2, 7.5, 7.8, 7.9**

  - [x] 12.3 Write `js/modules/reveal.js` scroll reveal
    - Accept an optional `root`, add `is-prereveal` in the same synchronous pass that observes a
      target, add `is-revealed` at `threshold: 0.15` and unobserve in that callback, and disconnect
      once the last target has fired
    - When `prefers-reduced-motion: reduce` matches or `IntersectionObserver` is missing, add
      `is-revealed` to every target before returning and construct no observer
    - Return without touching the document when no target exists under `root`, skip targets already
      carrying `is-revealed`, and exclude the hero
    - _Requirements: 6.5, 8.1, 8.2, 8.3, 8.4, 8.6, 8.8, 8.9, 8.10, 8.11_

  - [x] 12.4 Write property test for motion degradation
    - **Property 22: Motion enhancement degrades to the revealed state**
    - **Validates: Requirements 6.5, 8.4**

  - [x] 12.5 Write property test for the reveal lifecycle
    - **Property 23: The reveal lifecycle is one-shot and self-terminating**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.7, 8.9**

- [x] 13. Orchestration
  - [x] 13.1 Write `js/main.js` to wire the modules with per-module isolation
    - Import and call `initNav`, `initReveal`, and `initProjects` only — no logic in this file
    - Wrap each init so one throwing module logs exactly one warning naming it and the remaining
      modules still initialise, with no uncaught error and no unhandled rejection
    - Run the second reveal pass rooted at the featured list once `initProjects` resolves
    - _Requirements: 5.6, 8.7, 11.6, 11.11_

  - [x] 13.2 Write property test for progressive enhancement
    - **Property 21: Progressive enhancement holds without scripts**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 7.7**

- [x] 14. Checkpoint — behaviour verified in a real browser
  - Serve locally and confirm cards render, exactly one nav link is active at any scroll position with
    `aria-current`, observers disconnect, a deliberately broken `data/projects.json` shows the visible
    fallback, a single malformed entry is skipped while siblings render, reduced motion reveals
    everything immediately, and a JS-disabled load still reads and downloads the resume. Ensure all
    checks pass, ask the user if questions arise.

- [x] 15. Accessibility and performance hardening
  - [x] 15.1 Correct semantics, ARIA surface, and keyboard order in `index.html` and the templates
    - Keep ARIA to `aria-labelledby`, `aria-current`, `aria-busy`, `aria-hidden`, and `aria-label`;
      use no positive `tabindex` and `tabindex="-1"` only on `<main>`
    - Mark decorative eyebrows and decorative SVG `aria-hidden="true"` with `focusable="false"`, give
      meaningful SVG `role="img"` and a `<title>`, keep every `<img>` carrying `alt`, and make cards
      non-focusable with no whole-card click target
    - _Requirements: 9.2, 9.4, 9.9, 9.11, 9.12, 9.15, 9.16_

  - [x] 15.2 Optimise project imagery in the card template and `assets/img/`
    - Add `srcset`/`sizes` at real display widths, keep each WebP shot ≤150KB, keep `loading="lazy"`
      and `decoding="async"` below the fold, and never lazy-load hero content
    - _Requirements: 10.8, 10.3_

  - [x] 15.3 Reserve layout space and trim the critical path
    - Add `min-block-size` to both project list containers in `css/layout.css` so landing cards do not
      shift the page, and confirm the font payload stays within four files and 150KB in `css/base.css`
    - _Requirements: 10.6, 10.12, 12.12_

- [x] 16. Deployment configuration
  - [x] 16.1 Finalise canonical, sitemap, and robots entries for the live URL
    - Set the real deployed URL in `index.html` canonical and `og:url`, in `sitemap.xml`, and in the
      `robots.txt` sitemap reference, keeping every internal path relative with no leading slash
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 16.2 Complete `404.html` with the shared shell and a home link
    - Reuse the header, footer, and the five stylesheet links in layer order, with one link back to
      the site root and zero console errors
    - _Requirements: 15.6, 15.8_

- [x] 17. Final checkpoint — pre-deploy pass
  - Validate all three data files with `python -m json.tool`, `grep` `js/` for `innerHTML`,
    `insertAdjacentHTML`, and `document.write`, run Lighthouse mobile in throttled incognito against
    the performance and accessibility targets, walk keyboard paths A–D, load with JavaScript disabled,
    and confirm zero third-party requests and no secrets in the repository. Ensure all checks pass, ask
    the user if questions arise.

## Notes

- Sub-tasks marked `*` are optional. They are the dev-only property checks (`fast-check` + `jsdom` in
  `tests/`) and can be skipped entirely; the site must run with `node_modules/` deleted and nothing in
  `tests/` may be referenced by `index.html`.
- There is no test runner, linter, or build script. Every checkpoint is a manual pass:
  `python -m http.server 8000`, keyboard walk, JS-disabled load, Lighthouse, `python -m json.tool`.
- Windows `cmd` is the shell; the command separator is `&`.
- Each task references the granular acceptance criteria it satisfies for traceability.
- Property numbers refer to the Correctness Properties section of `design.md` in this spec folder.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "6.1", "6.2", "8.1"] },
    { "id": 2, "tasks": ["4.1", "5.1", "5.2", "6.3", "7.1", "10.2"] },
    { "id": 3, "tasks": ["4.2", "5.3", "6.4", "7.2", "8.2", "8.3", "8.4", "8.5", "8.6", "10.3", "12.1", "12.3"] },
    { "id": 4, "tasks": ["10.1", "10.4", "10.5", "10.6", "12.2", "12.4", "12.5"] },
    { "id": 5, "tasks": ["10.7", "10.8", "10.9", "10.10", "10.11", "10.12", "15.1"] },
    { "id": 6, "tasks": ["10.13", "10.14", "15.2", "15.3"] },
    { "id": 7, "tasks": ["10.15", "11.1", "11.2", "11.3", "11.4", "11.5", "11.6", "11.7", "13.1", "16.1"] },
    { "id": 8, "tasks": ["13.2", "16.2"] }
  ]
}
```
