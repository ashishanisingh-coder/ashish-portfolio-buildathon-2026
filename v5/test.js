#!/usr/bin/env node

const routes = [
  '/',
  '/v5/',
  '/v5/styles.css',
  '/v5/app.js',
  '/v5/favicon.svg',
  '/assets/actual/philips/case-study.jpg',
  '/assets/actual/india/cover-hero.jpg',
  '/assets/actual/rotavirus/cover.jpg',
  '/assets/actual/uno/case-study.jpg',
];

const origin = `http://127.0.0.1:${process.env.PORT || 4183}`;

async function main() {
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  }

  const html = await (await fetch(`${origin}/`)).text();
  const markers = [
    'The Signal Deck',
    'data-chapter-target="signal"',
    'data-chapter-target="work"',
    'data-chapter-target="contact"',
    'data-work-scene',
    'data-stage-state="spread"',
    'Philips TV &amp; Audio',
    'India in Transition',
    'Rotavirus',
    'Simulanis Uno',
    'https://github.com/ashishanisingh-coder',
  ];

  for (const marker of markers) {
    if (!html.includes(marker)) throw new Error(`Missing V5 prototype marker: ${marker}`);
  }

  console.log(`V5 prototype smoke test passed (${routes.length} routes).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
