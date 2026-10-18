#!/usr/bin/env node

const routes = [
  '/',
  '/v4/styles.css',
  '/v4/app.js',
  '/v4/favicon.svg',
  '/assets/actual/philips/case-study.jpg',
  '/assets/actual/india/cover-hero.jpg',
  '/assets/actual/rotavirus/cover.jpg',
  '/assets/actual/uno/case-study.jpg',
];

const origin = `http://127.0.0.1:${process.env.PORT || 4182}`;

async function main() {
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  }

  const html = await (await fetch(`${origin}/`)).text();
  for (const marker of ['V4 prototype', 'data-project-key="philips"', 'data-project-key="india"', 'data-project-key="rotavirus"', 'data-project-key="uno"']) {
    if (!html.includes(marker)) throw new Error(`Missing prototype marker: ${marker}`);
  }

  console.log(`V4 prototype smoke test passed (${routes.length} routes).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
