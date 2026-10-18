#!/usr/bin/env node

const routes = [
  '/',
  '/v5.1/',
  '/v5.1/styles.css',
  '/v5.1/app.js',
  '/v5.1/favicon.svg',
  '/assets/actual/philips/case-study.jpg',
];

const origin = `http://127.0.0.1:${process.env.PORT || 4184}`;

async function main() {
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  }

  const html = await (await fetch(`${origin}/`)).text();
  const markers = [
    'Make the point',
    'data-chapter-target="opening"',
    'data-chapter-target="philips"',
    'data-chapter-target="contact"',
    'data-philips-scene',
    'data-beat-image="overview"',
    'data-beat-image="catalogue"',
    'data-beat-image="retail"',
    'Philips TV &amp; Audio',
    'India in Transition',
    'Rotavirus',
    'Simulanis Uno',
    'https://github.com/ashishanisingh-coder',
    'Contact details on request',
  ];

  for (const marker of markers) {
    if (!html.includes(marker)) throw new Error(`Missing Flat Signal marker: ${marker}`);
  }

  const css = await (await fetch(`${origin}/v5.1/styles.css`)).text();
  for (const bannedToken of ['linear-gradient', 'radial-gradient', 'box-shadow', 'rotate(', 'translate3d']) {
    if (css.includes(bannedToken)) throw new Error(`Flat Signal CSS contains banned token: ${bannedToken}`);
  }

  console.log(`Flat Signal smoke test passed (${routes.length} routes).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
