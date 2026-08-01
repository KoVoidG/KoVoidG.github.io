---
inclusion: fileMatch
fileMatchPattern: '*.json'
---

# Content & Data

All human-readable content lives in `data/`. Markup carries structure; JSON carries content. Adding
a project should mean editing one JSON file, never touching HTML, CSS, or JS.

## `projects.json`

```json
{
  "featured": [
    {
      "id": "orbit-dashboard",
      "title": "Orbit",
      "tagline": "Real-time telemetry dashboard for edge fleets.",
      "summary": "Two or three sentences: the problem, the approach, the outcome.",
      "role": "Solo — design, backend, frontend",
      "year": 2026,
      "status": "shipped",
      "tech": ["Python", "FastAPI", "WebSockets", "Postgres"],
      "highlights": [
        "Cut p95 update latency from 800ms to 120ms by batching writes.",
        "Handles 2k concurrent sockets on a single 1GB instance."
      ],
      "links": {
        "repo": "https://github.com/USERNAME/orbit",
        "demo": "https://orbit.example.com"
      },
      "image": {
        "src": "assets/img/orbit-1200w.webp",
        "alt": "Orbit dashboard showing live latency charts for twelve devices.",
        "width": 1200,
        "height": 750
      }
    }
  ],
  "other": [
    {
      "id": "shipctl",
      "title": "shipctl",
      "tagline": "One-command deploys for static sites.",
      "year": 2025,
      "tech": ["Go", "Docker"],
      "links": { "repo": "https://github.com/USERNAME/shipctl" }
    }
  ]
}
```

### Field rules

| Field       | Featured | Other | Notes                                                    |
| ----------- | -------- | ----- | -------------------------------------------------------- |
| `id`        | required | required | kebab-case, unique, stable — used as the DOM id       |
| `title`     | required | required | the name a human says out loud                        |
| `tagline`   | required | required | ≤ 80 chars, one line, no period-free fragments        |
| `summary`   | required | omit  | 2–3 sentences                                            |
| `role`      | required | optional |                                                       |
| `year`      | required | required | number                                                |
| `status`    | required | optional | `shipped` \| `wip` \| `archived`                      |
| `tech`      | required | required | 3–6 items, canonical names (see below)                |
| `highlights`| required | omit  | 2–4 items, each with a concrete number or decision        |
| `links`     | required | required | at least one of `repo`, `demo`, `caseStudy`           |
| `image`     | required | omit  | all four keys required — dimensions prevent CLS           |

- `alt` is required whenever `image` is present and must describe what is shown, not repeat the
  title.
- Never add a field the renderer does not read. Never render a field the schema does not define.
- Optional fields are **omitted**, not set to `null` or `""`. Renderers check presence.

## Curation rules

- **3–4 featured projects.** Five is too many to read; two looks thin. Order by strength, not date.
- Featured projects need a working `repo` or `demo` link. No link, no feature slot.
- `other` is a compact list — 4–8 items, no images, no highlights.
- Never generate this file from the GitHub API. Curation is the point.
- Prune ruthlessly. A weak project drags the average down.

## Writing the copy

- Lead with outcome and constraint, not technology list. The `tech` array already covers stack.
- Quantify: latency, throughput, dataset size, users, accuracy. Numbers survive skimming.
- First person, past tense, active voice. "Built", "reduced", "shipped".
- Banned: "passionate", "cutting-edge", "seamless", "leveraged", "utilised", "robust solution".
- No em dashes as connective filler; keep sentences short.
- Spell tech names canonically and consistently across all projects: `JavaScript`, `TypeScript`,
  `Node.js`, `PostgreSQL`, `PyTorch`, `scikit-learn`, `Tailwind CSS`, `AWS`.

## `stack.json` and `profile.json`

- `stack.json` groups skills by domain (`languages`, `frontend`, `backend`, `ai`, `tooling`). Keep
  each group to items you would defend in an interview. A long list reads as padding.
- `profile.json` holds name, role, hero line, about paragraphs, education entries, contact methods,
  social links, and the resume path. Text only — no markup, no HTML strings.

## Format

Two-space indent, no trailing commas, no comments (JSON has none). Validate the file parses before
finishing: `python -m json.tool data/projects.json`.
