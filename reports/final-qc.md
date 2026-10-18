# Fold V3 final quality report

## Release

- Live website: https://ashishanisingh-coder.github.io/ashish-portfolio-buildathon-2026/
- GitHub repository: https://github.com/ashishanisingh-coder/ashish-portfolio-buildathon-2026
- Latest commit: `ff13795` — `feat: prepare polished portfolio deployment`
- Design direction: approved Fold V3, unchanged
- Buildathon submission: not submitted

## Final pages

- Homepage: `/`
- Philips: `/projects/philips/`
- India in Transition: `/projects/india/`
- Rotavirus: `/projects/rotavirus/`
- Simulanis Uno: `/projects/uno/`

## Screenshots

The final live-site screenshots are generated in `reports/qa/` and intentionally ignored from Git history to keep the repository focused on source and production assets.

### Desktop — 1440 × 900

- `reports/qa/live-home-desktop.png`
- `reports/qa/live-philips-desktop.png`
- `reports/qa/live-india-desktop.png`
- `reports/qa/live-rotavirus-desktop.png`
- `reports/qa/live-uno-desktop.png`

### Mobile — 390 × 844

- `reports/qa/live-home-mobile.png`
- `reports/qa/live-philips-mobile.png`
- `reports/qa/live-india-mobile.png`
- `reports/qa/live-rotavirus-mobile.png`
- `reports/qa/live-uno-mobile.png`

## Completed

- Preserved the Fold V3 dark/light editorial system and real project assets.
- Refined the hero reveal, restrained scroll motion, focus states, skip links, mobile menu behavior, and project-to-project navigation.
- Added per-project titles, descriptions, canonical URLs, Open Graph metadata, Twitter metadata, and social image references.
- Added a public GitHub contact action without publishing a personal email address.
- Added a static GitHub Pages build that generates all four project route indexes under the repository base path.
- Added GitHub Pages deployment workflow alongside the existing Docker CI workflow.
- Enabled GitHub Pages with HTTPS enforcement.

## Checks

- `npm ci --ignore-scripts --offline` — passed
- `npm test` — passed
- `make test` — passed
- `npm run build:static` — passed
- `BASE_PATH=/ npm run build:static` — passed
- `node --check scripts/build-static.js` — passed
- `node --check site/app.js` — passed
- `node --check site/project.js` — passed
- `node --check mockups/serve.js` — passed
- `git diff --check` — passed
- Docker build — passed
- Docker runtime route checks — passed
- Local browser QA at desktop, tablet-sized desktop, and mobile widths — passed
- Live browser QA for all five routes at desktop and mobile widths — passed
- Console errors on live browser pass — none observed
- Horizontal overflow checks — none observed
- Lazy-loaded image completion after full-page scroll — passed

## GitHub Actions

- Portfolio CI: https://github.com/ashishanisingh-coder/ashish-portfolio-buildathon-2026/actions/runs/39102545027 — success
- Deploy portfolio to GitHub Pages: https://github.com/ashishanisingh-coder/ashish-portfolio-buildathon-2026/actions/runs/39102545107 — success

## Remaining review items

- Review the live URL and screenshots before Buildathon submission.
- Decide whether to publish a personal contact method later; none is currently exposed.
- Submit the Buildathon entry manually only after review. No submission action was taken by OmniRush.
