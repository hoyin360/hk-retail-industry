# Claude Rules

A scrollytelling data journalism page embedded in HKBU DataStory's WordPress site.

Visual spec: `design.md` · Prototype: `prototype.html`

## Tech Stack

- Vanilla HTML + CSS + JS (ES6 modules)
- D3.js v7, Scrollama v3 — installed via npm, imported in JS
- Google Fonts (Noto Serif SC + Noto Sans SC)
- **Vite** for local dev server and production build. Output is pure static files (`dist/`).

## Commands

- `npm run dev` — local dev server with HMR
- `npm run build` — produces static `dist/` folder for WordPress deployment
- `npm run preview` — preview the production build locally

## Project Structure

```
├── claude.md
├── design.md
├── prototype.html
├── package.json
├── vite.config.js
├── public/
│   └── data/               JSON data files (copied as-is to dist/)
│       ├── sales.json
│       ├── vacancy.json
│       ├── costs.json
│       └── divergence.json
└── src/
    ├── index.html           Single entry point
    ├── css/
    │   └── style.css        All styles, CSS Custom Properties for tokens
    └── js/
        ├── main.js          Init: load data, mount charts, setup scroll
        ├── scroll-reveal.js Scrollama setup
        ├── utils.js         Shared helpers
        └── charts/
            ├── sales-line.js
            ├── vacancy-bars.js
            ├── profit-waterfall.js
            └── divergence.js
```

Data JSON lives in `public/data/` so Vite copies it verbatim to `dist/data/`. Charts `fetch('./data/xxx.json')` at runtime. Swap real data = replace JSON files, zero code changes.

## Key Constraints

- **Final output is static.** `dist/` folder is deployed to WordPress as-is.
- **CSS class prefix `ds-`** on everything to avoid WordPress theme collisions.
- **No generic class names** (`.container`, `.header`, `.footer`, `.card`).
- **No `localStorage` / `sessionStorage`.** No global variable pollution.
- D3 and Scrollama are `import`ed in JS (Vite bundles them), **not** loaded via CDN.

## Conventions

- Each chart file exports `init(container, data)`. `main.js` calls all after `DOMContentLoaded`.
- D3 charts use `viewBox` for responsiveness — no fixed pixel dimensions.
- D3 colors read from CSS Custom Properties, never hardcoded.
- All scroll-triggered animations go through Scrollama — one unified system.
- Semantic HTML: `<section>` per chapter, `<figure>` + `<figcaption>` per chart.

## Performance

- Total page weight < 400KB (with font subsets)
- `font-display: swap`, font subsetting, lazy-load images if any
- D3 tree-shaken via ES module imports (e.g. `import { select } from 'd3-selection'`)

## Delivery Checklist

1. Placeholder data replaced with verified real data
2. All class names `ds-` prefixed
3. Responsive tested at 320 / 480 / 768 / 1024 / 1440px
4. `prefers-reduced-motion` respected
5. No console errors
6. `npm run build` → test `dist/` in WordPress embed (iframe + direct injection)
