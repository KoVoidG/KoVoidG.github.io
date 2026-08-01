# Product

A personal portfolio website: the central showcase of my software engineering and AI work.

## Audience

Recruiters, hiring managers, startup founders, and technical interviewers evaluating me for
software engineering, full-stack, and AI internships. Assume a **60-second first pass**: a
skimmer must learn who I am, what I build, and how to reach me without scrolling to the end.

Two reader modes to serve simultaneously:

- **Non-technical screener** — needs role clarity, impact, and a resume link fast.
- **Technical interviewer** — needs depth: stack, architecture decisions, and source links.

## Sections (canonical order)

1. **Hero** — name, role, one-line positioning, primary CTA
2. **About** — short narrative, first person, no filler
3. **Tech stack** — grouped by domain, not an exhaustive keyword dump
4. **Featured projects** — manually curated, richest detail
5. **Other projects** — compact list
6. **GitHub** — activity/profile link-out
7. **Education**
8. **Contact**
9. **Resume download**
10. **Footer**

Do not add sections without a clear reason. Do not reorder without updating this file.

## Content principles

- **Curation over completeness.** Featured projects are hand-picked in local JSON. Never
  auto-render every GitHub repo.
- **Show outcomes, not adjectives.** "Cut inference latency 800ms → 120ms" beats "highly
  optimised". Skip "passionate", "cutting-edge", "seamless".
- **One primary action per screen.** Enforced by the single-accent rule in the design system.
- **Every project earns its place.** If it has no repo, demo, or explainable decision, it belongs
  in Other projects or nowhere.
- **Copy is content, not layout.** All project and stack data lives in `data/*.json`, never
  hardcoded in markup.

## Quality bar

This site is itself a work sample. Sloppy markup, layout shift, or a broken keyboard path is a
negative signal about my engineering, regardless of what the projects say. Treat the standards in
`accessibility.md` and `performance.md` as acceptance criteria, not aspirations.

## Explicit non-goals

- No CMS, no backend, no database, no auth
- No blog or comments
- No analytics or third-party trackers
- No frontend framework, no state management library
- No dark mode until the light system is complete and shipped
- No enterprise patterns, no speculative abstraction layers

Single-developer project. Prefer the simplest thing that is genuinely good.
