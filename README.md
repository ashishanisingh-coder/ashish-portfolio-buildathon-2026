# Ashish Portfolio Buildathon 2026

This project contains a reproducible, asset-backed implementation of the **The Fold** portfolio direction. The refined Fold v3 includes a quieter dark opening hero with a more realistic two-leaf folio, a Philips TV & Audio lead spread, a typographic project index, and larger editorial spreads for India in Transition, Rotavirus, and Simulanis Uno.

## Requirements

- Node.js `24.20.0` (see `.nvmrc`)
- No npm dependencies are required.
- The checked-in PNG preview was rendered on macOS; the source SVG generator and test command run on Linux.

## Setup

```bash
nvm use
npm install --ignore-scripts
```

`npm install` is only used to verify the lockfile; the generator itself has no third-party runtime dependencies.

## Render the mockup

```bash
npm run render
```

This regenerates:

- `mockups/portfolio-b-the-fold-v3.svg`

The high-resolution PNG preview is checked in at `mockups/png/portfolio-b-the-fold-v3.png`. On macOS, it can be refreshed with:

```bash
sips -s format png mockups/portfolio-b-the-fold-v3.svg --out mockups/png/portfolio-b-the-fold-v3.png
```

## Test

```bash
make test
```

The test is offline and verifies the Node syntax, regenerates the SVG, checks the output, and confirms the key actual project assets are present.

## Run the website

```bash
make run
```

Open <http://localhost:4173/>. The server exposes the working portfolio at `/`, the final mockup PNG at `/mockup`, the PNG explicitly at `/fold-v3.png`, and the editable SVG at `/fold-v3.svg`.

The static site lives in:

- `site/index.html`
- `site/styles.css`
- `site/app.js`
- `site/project.html`
- `site/project.js`

The project index now opens same-system case-study routes at `/projects/philips`, `/projects/india`, `/projects/rotavirus`, and `/projects/uno`. All project imagery is loaded from `assets/actual/`. Replace the placeholder contact address in `site/index.html` before deployment.

## Docker

```bash
docker build -t ashish-portfolio-fold .
docker run --rm -p 4173:4173 ashish-portfolio-fold
```

Then open <http://localhost:4173/>.

## Deploy

The deliverable is a static portfolio site plus its source mockup. For a static host, publish `site/`, `assets/actual/`, and the supporting files. For a container host, deploy the Docker image and expose port `4173`.
