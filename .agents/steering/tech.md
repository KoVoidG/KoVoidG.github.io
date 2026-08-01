# Technology

## Stack

| Concern  | Choice                                  |
| -------- | --------------------------------------- |
| Markup   | Semantic HTML5                          |
| Styles   | Modern CSS — Grid, Flexbox, custom properties, `@layer` |
| Behaviour| ES2020+ JavaScript, native ES modules   |
| Data     | Static JSON in `data/`, fetched at runtime |
| Hosting  | GitHub Pages (static)                   |
| Build    | **None**                                |

## The no-build rule

Files served to the browser are the files in the repo. No bundler, no transpiler, no CSS
preprocessor, no framework runtime.

Consequences that must be respected:

- Only ship syntax that ships natively. No JSX, no TypeScript in `.js` files, no Sass.
- ES modules only via `<script type="module">`. Module specifiers need explicit extensions
  (`./modules/projects.js`, not `./modules/projects`).
- `file://` will not load modules or `fetch()` JSON. Local development requires a static server:
  `python -m http.server 8000` from the project root.
- No `npm install` for runtime code. Dev-only tooling (a formatter, a link checker) is acceptable
  but must never become a prerequisite for the site to work.

If a task seems to require a build step, that is a signal the task is overscoped. Simplify it
before reaching for tooling.

## No frameworks — and no reimplementing them

Vanilla is the point: it demonstrates fundamentals. But "no framework" does not license building
a homegrown one.

- No client-side router, virtual DOM, reactive store, or template engine.
- No jQuery, no Lodash, no utility libraries. Use the platform.
- Third-party runtime code needs a real justification and must be vendored into
  `assets/vendor/`, pinned, and never loaded from a CDN in the critical path.

## Browser support

Latest two versions of Chrome, Edge, Firefox, and Safari (desktop and iOS). These are freely
available and encouraged:

- `:has()`, `:is()`, `:where()`, `:focus-visible`
- CSS nesting, `@layer`, `clamp()`, logical properties, `aspect-ratio`
- Container queries where they beat media queries
- `IntersectionObserver`, `AbortController`, optional chaining, top-level `await` in modules

No IE, no polyfills, no transpilation targets. Do not add `-webkit-`/`-moz-` prefixes unless a
supported browser actually needs one.

## Commands

Windows `cmd` is the shell. Command separator is `&`, not `&&`.

```
python -m http.server 8000    :: serve locally, then open http://localhost:8000
```

There is no test runner, linter, or build script. Verification is manual: load the page, walk the
keyboard path, and run Lighthouse in Chrome DevTools. If you change data-loading or DOM-building
code, confirm it in a real browser before calling it done.
