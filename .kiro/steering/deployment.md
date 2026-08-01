---
inclusion: manual
---

# Deployment — GitHub Pages

Static hosting, deployed by pushing to the default branch. No build, no Actions workflow needed.

## Setup

- Repo named `USERNAME.github.io` → served at `https://USERNAME.github.io/` (root path).
- Any other repo name → served at `https://USERNAME.github.io/repo-name/` (**sub-path**).
- Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.

## Path rules — the most common way this breaks

Pages under a sub-path will 404 on absolute paths.

- Use **relative** paths everywhere: `css/tokens.css`, `assets/resume.pdf`, `data/projects.json`.
- Never a leading slash: `/css/tokens.css` breaks on a project sub-path.
- `fetch('data/projects.json')` resolves against the page URL, which is correct. `fetch('/data/...')`
  is not.
- Prefer the root-repo naming (`USERNAME.github.io`) to sidestep this entirely.

## Required files

- **`.nojekyll`** (empty file at repo root) — stops Jekyll processing. Without it, any file or
  folder starting with `_` is silently dropped.
- **`404.html`** — same shell and styling as the site, with a link home.
- **`CNAME`** — only if using a custom domain; contains the bare domain, one line, no protocol.

## Caching

Pages sets a 10-minute cache on assets and does not support custom headers. Consequences:

- A deploy can take up to ~10 minutes to appear. Hard-refresh before assuming a bug.
- No long-lived immutable caching. Keep assets small rather than relying on cache headers.
- If a stale asset must be busted, rename the file. There is no hash-based cache busting without a
  build step.

## Pre-deploy checklist

1. `python -m http.server 8000` locally, click through every link and the resume download.
2. Every path relative, no leading slashes.
3. `python -m json.tool` passes on each file in `data/`.
4. Lighthouse mobile in incognito meets the targets in `performance.md`.
5. Keyboard pass and JS-disabled pass per `accessibility.md`.
6. `canonical`, `og:url`, and `og:image` point at the real deployed URL.
7. No placeholder text, no `USERNAME`, no `lorem`, no commented-out blocks.
8. No secrets, API keys, or personal address in the repo — it is public.

## After deploy

Verify on the live URL, not localhost: fonts load, project cards render, OG preview looks right
(paste the link into any chat app), and the resume opens on mobile.
