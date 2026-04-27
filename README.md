# HKBU DataStory Scrollytelling (Vite + D3 + Scrollama)

This project follows the requirements in `Claude.md` and the visual spec in `design.md`.

## Requirements

- Node.js (LTS recommended) **with** npm available in your terminal.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure

- `src/index.html`: single entry (Vite root)
- `src/css/style.css`: all styles (all classes prefixed `ds-`)
- `src/js/*`: ES modules (D3 + Scrollama imported via npm)
- `public/data/*.json`: data files copied as-is into `dist/data/`

