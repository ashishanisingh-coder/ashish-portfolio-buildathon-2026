# Flat Signal — V5.1 prototype

An isolated V5.1 portfolio prototype for Ashish Kumar Singh. It keeps the fixed dark chapter navigation and the strong dark/light editorial contrast of the incumbent direction, then removes presentation depth cues in favor of flat, sharp compositions.

The prototype is intentionally contained in `v5.1/`. It does not replace V5, V4, the live site, or any deployment workflow.

## Setup

From the project root, use the pinned Node version in `.nvmrc` (`24.20.0`). This prototype uses only Node's built-in modules and browser APIs; it has no additional npm dependencies.

```bash
nvm use
```

If `nvm` is unavailable, use any Node 24.20.x runtime with the built-in `fetch` API. Do not install packages globally.

## Run

Start the standalone server on port `4184`:

```bash
node v5.1/serve.js
```

Open <http://127.0.0.1:4184/>. The server serves the prototype at `/` and `/v5.1/`, and serves approved project assets from root-relative `/assets/actual/...` paths.

## Test

With the server running in another terminal:

```bash
node --check v5.1/app.js
node --check v5.1/serve.js
node v5.1/test.js
```

The smoke test checks the prototype files, the Philips asset route, the three chapter controls, all three continuous Philips beats, the project index and the public GitHub CTA. It also rejects gradients, rotation, 3D transforms and hard shadows in the V5.1 stylesheet.

## Review the interaction

- On the first viewport, watch the fixed navigation and progress track draw, the title lines reveal through masks, the editorial rules resolve and the Philips composite open from a rectangular crop.
- Use the centered chapter labels or the mobile menu to move between Opening, Philips and Contact. The progress marker follows document scroll continuously, while the active chapter label follows the viewport.
- In Philips, scroll through the 1,840px scene. The same composite moves continuously between a full campaign overview, a catalogue / print and social crop, and a retail experience / format adaptations crop. The image windows wipe between compositions while the text and labels resolve with the scroll.
- In Contact, open the disclosure for the contact-details-on-request message. No personal email is published.

## Asset QC and limitation

The only Philips-specific approved asset available to this prototype is:

`/assets/actual/philips/case-study.jpg` — 1024×1536, one composite image containing labelled panels for the overview, campaign-at-a-glance / print-social, catalogue, festive campaign, retail experience, format adaptations and takeaways.

The Philips story deliberately reuses that single real image with CSS crops and object positioning. Separate high-resolution exports for the individual panels are not available in the supplied asset set, so this prototype does not invent them and does not upscale the composite beyond reasonable display sizes. The catalogue, retail and format adaptation beats remain truthful crops from the supplied composite.

## Accessibility

The prototype includes a skip link, semantic chapter sections, native buttons and links, visible focus rings, `aria-current` chapter state, mobile `aria-expanded` state, labelled visual compositions, live beat copy, keyboard Escape handling, no horizontal overflow, and a reduced-motion path that keeps the full overview visible and removes entrance/crop choreography.

## Deploy

Deployment is intentionally not configured for this isolated prototype. Do not modify root deployment files or publish V5.1 as part of this buildathon step. If deployment is approved later, the server must preserve `/assets/actual/` at the same root-relative path.
