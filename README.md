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

The project index now opens same-system case-study routes at `/projects/philips`, `/projects/india`, `/projects/rotavirus`, and `/projects/uno`. All project imagery is loaded from `assets/actual/`. The public build keeps contact details unpublished and exposes an honest request-state CTA without inventing an email address.

## V5.1 production handoff build

The approved V5.1 experience has a separate, non-deploying GitHub Pages artifact builder. It does not modify `site/`, `v5/`, the legacy V3 source or the currently live V3 website:

```bash
npm run build:v51:pages
npm run verify:v51:pages
```

This creates the ignored `dist-v51-pages/` artifact for the repository base path `/ashish-portfolio-buildathon-2026/`, with a root V5.1 homepage and directory-index routes for Philips, India in Transition, Rotavirus and Simulanis Uno. The full handoff plan and verification evidence are in `reports/v5.1-production-handoff.md`.

## Docker

```bash
docker build -t ashish-portfolio-fold .
docker run --rm -p 4173:4173 ashish-portfolio-fold
```

Then open <http://localhost:4173/>.

## Deploy

### GitHub Pages

The repository includes a reproducible project-site build for free GitHub Pages hosting:

```bash
npm run build:static
```

The command removes and recreates `dist/`, copies the contents of `site/` to the artifact root, copies `assets/actual/`, creates these directory-index case-study pages, and rewrites the existing root-absolute internal URLs for the repository base path:

- `/projects/philips/index.html`
- `/projects/india/index.html`
- `/projects/rotavirus/index.html`
- `/projects/uno/index.html`

The default base path is `/ashish-portfolio-buildathon-2026/`. For a different repository name, override it during the build:

```bash
BASE_PATH=/your-repository-name/ npm run build:static
```

The legacy `.github/workflows/pages.yml` workflow is now manual-only and requires the explicit `confirm_v3_release=true` input. It builds the existing V3 `dist/` artifact and is intended only for an intentional V3 rollback; it no longer runs on pushes to `main`. The V5.1 workflow is `.github/workflows/v51-pages-approval.yml`, which is manual-only, requires `confirm_v51_release=true`, `release_ref=v5.1-flat-art-direction` and the exact approved `release_commit`, starts the V5.1 server before its smoke test, builds `dist-v51-pages/`, verifies the artifact, uploads it and waits at the `v51-pages-approval` environment before deployment. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source once. The published project-site URL is:

```text
https://<owner>.github.io/ashish-portfolio-buildathon-2026/
```

GitHub Pages serves static files only. The generated directory indexes make the four known case-study URLs work without a server rewrite, but arbitrary unknown routes and Node server behavior are not available there. The Pages REST API exposes site creation, but that endpoint requires repository-admin, maintainer, or **manage GitHub Pages settings** permission; the workflow token cannot grant that permission. An owner or administrator must enable the GitHub Actions Pages source once in repository settings (or provision it separately with an appropriately privileged token).

Do not run the legacy V3 workflow after approving a V5.1 deployment unless an intentional V3 rollback is required. Both workflows deploy to the same Pages site; the V3 workflow's manual confirmation is the only remaining path that can replace V5.1 with the older artifact.

### Container host

For a container host, deploy the Docker image and expose port `4173`. The existing Node server remains the Docker/preview path and keeps its current routes.

## GitHub CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`. It installs from the lockfile, runs `make test`, and builds the Docker image. The Node server keeps the case-study routes (`/projects/philips`, `/projects/india`, `/projects/rotavirus`, and `/projects/uno`) for container/preview use; `.github/workflows/pages.yml` supplies equivalent directory-index pages for the static GitHub Pages artifact.
