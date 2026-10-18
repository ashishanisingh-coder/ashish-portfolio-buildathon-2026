#!/usr/bin/env node

const routes = [
  '/',
  '/v5.1/',
  '/v5.1/styles.css',
  '/v5.1/app.js',
  '/v5.1/favicon.svg',
  '/assets/actual/philips/case-study.jpg',
  '/v5.1/projects/philips',
  '/v5.1/projects/philips/',
  '/v5.1/projects/india',
  '/v5.1/projects/india/',
  '/v5.1/projects/rotavirus',
  '/v5.1/projects/rotavirus/',
  '/v5.1/projects/uno',
  '/v5.1/projects/uno/',
  '/v5.1/projects/project.css',
  '/v5.1/projects/project.js',
];

const origin = `http://127.0.0.1:${process.env.PORT || 4184}`;

const projectRoutes = {
  philips: {
    paths: ['/v5.1/projects/philips', '/v5.1/projects/philips/'],
    name: 'Philips TV & Audio',
    assets: ['/assets/actual/philips/case-study.jpg'],
    previous: '/v5.1/projects/uno/',
    next: '/v5.1/projects/india/',
  },
  india: {
    paths: ['/v5.1/projects/india', '/v5.1/projects/india/'],
    name: 'India in Transition',
    assets: [
      '/assets/actual/india/cover-hero.jpg',
      '/assets/actual/india/big-picture.jpg',
      '/assets/actual/india/work-system-wide.png',
      '/assets/actual/india/work-system-tall.png',
      '/assets/actual/india/geography-map.jpg',
      '/assets/actual/india/synthesis-montage.jpg',
      '/assets/actual/india/closing-bridge.jpg',
    ],
    previous: '/v5.1/projects/philips/',
    next: '/v5.1/projects/rotavirus/',
  },
  rotavirus: {
    paths: ['/v5.1/projects/rotavirus', '/v5.1/projects/rotavirus/'],
    name: 'Rotavirus',
    assets: [
      '/assets/actual/rotavirus/cover.jpg',
      '/assets/actual/rotavirus/overview.jpg',
      '/assets/actual/rotavirus/slide-archive.jpg',
      '/assets/actual/rotavirus/takeaways.png',
      '/assets/actual/rotavirus/closing.jpg',
    ],
    previous: '/v5.1/projects/india/',
    next: '/v5.1/projects/uno/',
  },
  uno: {
    paths: ['/v5.1/projects/uno', '/v5.1/projects/uno/'],
    name: 'Simulanis Uno',
    assets: ['/assets/actual/uno/case-study.jpg'],
    previous: '/v5.1/projects/rotavirus/',
    next: '/v5.1/projects/philips/',
  },
};

async function main() {
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  }

  for (const slug of ['not-allowlisted', 'toString']) {
    const missingProject = await fetch(`${origin}/v5.1/projects/${slug}`);
    if (missingProject.status !== 404) {
      throw new Error(`Unallowlisted project route ${slug} returned HTTP ${missingProject.status}`);
    }
  }

  const html = await (await fetch(`${origin}/`)).text();
  const markers = [
    'Make the point',
    'data-chapter-target="opening"',
    'data-chapter-target="philips"',
    'data-chapter-target="contact"',
    'href="/v5.1/projects/philips/"',
    'href="/v5.1/projects/india/"',
    'href="/v5.1/projects/rotavirus/"',
    'href="/v5.1/projects/uno/"',
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

  const projectCss = await (await fetch(`${origin}/v5.1/projects/project.css`)).text();
  for (const bannedToken of [
    'linear-gradient',
    'radial-gradient',
    'box-shadow',
    'rotate',
    'translate3d',
    'mono',
  ]) {
    if (projectCss.toLowerCase().includes(bannedToken)) {
      throw new Error(`Project route CSS contains banned token: ${bannedToken}`);
    }
  }
  if (/font-family\s*:[^;]*(?<!sans-)serif\b/i.test(projectCss)) {
    throw new Error('Project route CSS contains a serif font declaration');
  }

  for (const project of Object.values(projectRoutes)) {
    const html = await (await fetch(`${origin}${project.paths[0]}`)).text();
    const renderedName = project.name.replaceAll('&', '&amp;');
    if (!html.includes(renderedName)) throw new Error(`Project route is missing name: ${project.name}`);
    for (const marker of [
      'Skip to content',
      '<main id="main-content"',
      'Portfolio navigation',
      'data-project-menu-toggle',
      'data-project-sequence',
      'data-progress-readout',
      '/v5.1/projects/project.css',
      '/v5.1/projects/project.js',
    ]) {
      if (!html.includes(marker)) throw new Error(`${project.name} route is missing marker: ${marker}`);
    }

    for (const [label, href] of [
      ['previous', project.previous],
      ['next', project.next],
      ['return', '/v5.1/'],
    ]) {
      if (!html.includes(`href="${href}"`)) {
        throw new Error(`${project.name} route is missing ${label} link: ${href}`);
      }
    }

    for (const asset of project.assets) {
      const response = await fetch(`${origin}${asset}`, { method: 'HEAD' });
      if (!response.ok) throw new Error(`${project.name} asset ${asset}: HTTP ${response.status}`);
    }
  }

  console.log(`Flat Signal smoke test passed (${routes.length} routes, ${Object.keys(projectRoutes).length} project systems).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
