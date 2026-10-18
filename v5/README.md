# The Signal Deck — V5 prototype

An isolated, un-deployed V5 homepage prototype for a senior presentation and visual communication designer. This prototype does not replace the live site, V4, or any deployment workflow.

## Setup

From the project root, use the pinned Node version in `.nvmrc` (`24.20.0`). The V5 prototype has no additional npm dependencies.

```bash
nvm use
```

If `nvm` is not available, use any Node 24.20.x runtime that supports the built-in `fetch` API. Do not install packages globally.

## Run

Start the standalone server on port `4183`:

```bash
node v5/serve.js
```

Open <http://127.0.0.1:4183/>. The server serves the prototype at `/` and `/v5/`, and serves the existing actual assets from root-relative `/assets/actual/...` paths.

## Test

With the server running in another terminal:

```bash
node --check v5/app.js
node --check v5/serve.js
node v5/test.js
```

The smoke test checks the prototype routes, actual project assets, chapter markers, work scene, project index and public GitHub CTA.

## Review the interaction

- On the first viewport, watch the header/track draw, the Philips stage mask open, the image settle and the headline resolve in sequence.
- Use the fixed numbered header or the mobile menu to move between Signal, Work and Contact.
- In Work, scroll through the 1,680px Philips scene to move from full spread to detail crop to tilted/stacked campaign frame.
- Open the guide mode circle in the header to reveal presentation registration guides.
- In Contact, open the disclosure for the contact-details-on-request message. No personal email is published.
- The mini project index lists Philips TV & Audio, India in Transition, Rotavirus and Simulanis Uno for context only; case-study routes are not implemented here.

## Accessibility

The prototype includes a skip link, semantic landmarks, keyboard-operable buttons and links, visible focus rings, `aria-current` chapter state, mobile menu state, live Work scene labels and a `prefers-reduced-motion` path that removes the entrance choreography and smooth scrolling.

## Deploy

Deployment is intentionally not configured for this isolated prototype. Do not modify the root deployment files or publish V5 as part of this buildathon step. If deployment is approved in a later task, the server must keep `/assets/actual/` available at the same root-relative path as the local prototype.
