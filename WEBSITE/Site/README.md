# AniTool Public Site

Static public website for AniTool products.

## Local Preview

Open `index.html` directly in a browser.

## Current Product

The current landing page sells AniDeepth, an After Effects CEP tool for interactive depth layout.

## Controls

- Light and dark mode are handled in `script.js` and saved to localStorage.
- English and Vietnamese copy are handled by the `translations` object in `script.js`.
- USD and VND prices are read from `data-usd` and `data-vnd` on price elements.

## Deploy

GitHub Pages can deploy this folder through `.github/workflows/pages.yml` from the repository root.