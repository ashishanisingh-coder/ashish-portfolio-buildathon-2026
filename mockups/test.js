const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const renderScript = path.join(__dirname, 'render-fold-v3.js');
const siteScript = path.join(root, 'site', 'app.js');
const projectScript = path.join(root, 'site', 'project.js');

function required(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    throw new Error(`Missing or empty required file: ${relativePath}`);
  }
}

const syntax = spawnSync(process.execPath, ['--check', renderScript], { encoding: 'utf8' });
if (syntax.status !== 0) {
  process.stderr.write(syntax.stderr || 'Node syntax check failed.\n');
  process.exit(syntax.status || 1);
}

const siteSyntax = spawnSync(process.execPath, ['--check', siteScript], { encoding: 'utf8' });
if (siteSyntax.status !== 0) {
  process.stderr.write(siteSyntax.stderr || 'Site JavaScript syntax check failed.\n');
  process.exit(siteSyntax.status || 1);
}

const projectSyntax = spawnSync(process.execPath, ['--check', projectScript], { encoding: 'utf8' });
if (projectSyntax.status !== 0) {
  process.stderr.write(projectSyntax.stderr || 'Project JavaScript syntax check failed.\n');
  process.exit(projectSyntax.status || 1);
}

const render = spawnSync(process.execPath, [renderScript], { encoding: 'utf8' });
if (render.status !== 0) {
  process.stderr.write(render.stderr || 'Render failed.\n');
  process.exit(render.status || 1);
}

[
  'mockups/portfolio-b-the-fold-v3.svg',
  'site/index.html',
  'site/styles.css',
  'site/app.js',
  'site/project.html',
  'site/project.js',
  'site/favicon.svg',
  'assets/actual/README.md',
  'assets/actual/india/cover-hero.jpg',
  'assets/actual/india/big-picture.jpg',
  'assets/actual/rotavirus/cover.jpg',
  'assets/actual/philips/case-study.jpg',
  'assets/actual/uno/case-study.jpg',
].forEach(required);

const indexMarkup = fs.readFileSync(path.join(root, 'site', 'index.html'), 'utf8');
const projectMarkup = fs.readFileSync(path.join(root, 'site', 'project.html'), 'utf8');
[
  ['site/index.html', indexMarkup, 'data-site-canonical'],
  ['site/index.html', indexMarkup, 'data-contact-cta'],
  ['site/project.html', projectMarkup, 'data-project-canonical'],
  ['site/project.html', projectMarkup, 'data-project-previous'],
  ['site/project.html', projectMarkup, 'data-project-next'],
].forEach(([relativePath, markup, marker]) => {
  if (!markup.includes(marker)) throw new Error(`Missing ${marker} in ${relativePath}`);
});

if (indexMarkup.includes('mailto:')) {
  throw new Error('A contact email must not ship in the public site without a supplied address.');
}

console.log('Offline mockup test passed.');
