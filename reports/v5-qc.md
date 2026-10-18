# V5 Immersive Hero Prototype — QC

**Date:** 2026-10-18
**Branch:** `v5-immersive-hero`
**Scope:** isolated `v5/` prototype only; production `site/`, V4, Docker and deployment files were not changed.

## Result

The V5 prototype is ready for visual review. It delivers the requested first-pass experience:

- fixed numbered chapter navigation for `01 Signal`, `02 Work`, and `03 Contact`;
- animated chapter progress track and active marker;
- large Philips-led hero stage with supplied project material;
- scroll-driven Philips scene with spread, detail-crop, and tilted-frame states;
- responsive desktop and mobile compositions;
- mobile chapter menu, guide-mode control, and contact disclosure;
- no personal email published and no unfinished case-study routes introduced.

## Browser evidence

Screenshots were captured at the requested viewport sizes with the local V5 server running at `http://127.0.0.1:4183/v5/`.

### Desktop — 1440 × 900

- `reports/v5/hero-desktop-20261018T1820.png`
- `reports/v5/work-spread-desktop-20261018T1820.png`
- `reports/v5/work-detail-desktop-20261018T1820.png`
- `reports/v5/work-frame-desktop-20261018T1820.png`
- `reports/v5/contact-desktop-20261018T1820.png`

### Mobile — 390 × 844

- `reports/v5/hero-mobile-20261018T1820.png`
- `reports/v5/work-spread-mobile-20261018T1820.png`
- `reports/v5/work-detail-mobile-20261018T1820.png`
- `reports/v5/work-frame-mobile-20261018T1820.png`
- `reports/v5/contact-mobile-20261018T1820.png`

The Work evidence shows the same supplied Philips asset transforming through the three intended states rather than switching to placeholder artwork.

## Functional checks

An isolated Playwright smoke harness exercised the real local page at both viewports:

| Check | Desktop | Mobile |
| --- | --- | --- |
| Initial chapter | `signal` | `signal` |
| Work navigation | active `work` | active `work`, menu closes |
| Scene state 1 | `spread` | `spread` |
| Scene state 2 | `detail` | `detail` |
| Scene state 3 | `frame` | `frame` |
| Philips hero image | loaded | loaded |
| Horizontal overflow | none | none |
| Console/page errors | none | none |

The mobile review also caught and fixed two layout collisions in the first pass: the scene state label no longer sits on top of the Philips eyebrow, and the image caption no longer collides with the project-index heading.

## Accessibility checks

- Skip link targets `#main-content`.
- Chapter controls are native buttons with visible focus rings.
- Active desktop chapter exposes `aria-current="location"`.
- Mobile menu exposes and updates `aria-expanded`, `hidden`, and body menu state.
- Contact disclosure exposes and updates `aria-expanded`, `hidden`, and live status text.
- Philips image has descriptive alternative text.
- Reduced-motion CSS removes entrance choreography and smooth scrolling; the app also avoids smooth scrolling when the media query matches.

## Commands and results

All checks were run after the mobile spacing fix:

```text
node --check v5/app.js
node --check v5/serve.js
node --check v5/test.js
node v5/test.js
V5 prototype smoke test passed (9 routes).

npm test
Offline mockup test passed.

make test
Offline mockup test passed.
```

The server route checks returned `200 OK` for `/`, `/v5/`, the V5 assets, and the actual Philips, India, Rotavirus and Simulanis Uno asset paths. The Playwright pass found no console errors or page errors.

## Reference-principle comparison

- **Allgood principle carried forward:** a fixed, numbered chapter system with an active progress cue. The AS prototype uses only three original chapters, its own labels and its own visual language; it does not copy reference code, copy or artwork.
- **Metic principle carried forward:** precise editorial metadata, registration lines, controlled paper/ink contrast and a clear presentation surface. The Philips material remains the narrative center instead of becoming a generic card grid.
- **Crency principle carried forward:** expressive scale, cropping, color restraint and energetic transitions. The prototype keeps that energy controlled through a single signal orange, real image transformations and no gradients, glow or decorative noise.

## Intentional scope boundary

This is a reviewable V5 homepage and Philips scene, not the full V5 site. The four project names remain a contextual mini index, while case-study routes, deployment, production replacement and Buildathon submission remain intentionally blocked pending approval.
