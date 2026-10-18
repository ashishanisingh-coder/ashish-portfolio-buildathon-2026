#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectData = require('../v5.1/projects/project-data');

const root = path.resolve(__dirname, '..');
const actualAssetsSource = path.join(root, 'assets', 'actual');
const defaultBasePath = '/ashish-portfolio-buildathon-2026/';
const defaultOutputDirectory = 'dist-v51-pages';
const manifestFileName = 'v51-pages-manifest.json';
const projectSlugs = ['philips', 'india', 'rotavirus', 'uno'];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function normalizeBasePath(value) {
  const raw = String(value ?? defaultBasePath).trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\r\n]/.test(raw)) {
    fail(`BASE_PATH must be a root-relative path, received: ${raw}`);
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return `${withoutTrailingSlash || ''}/`;
}

function resolveOutputDirectory() {
  const configured = String(process.env.V51_PAGES_OUT_DIR || defaultOutputDirectory).trim();
  assert(configured, 'V51_PAGES_OUT_DIR cannot be empty.');
  return path.resolve(root, configured);
}

function outputPath(relativePath) {
  const filePath = path.resolve(resolveOutputDirectory(), relativePath);
  const outputDirectory = resolveOutputDirectory();
  assert(
    filePath === outputDirectory || filePath.startsWith(`${outputDirectory}${path.sep}`),
    `Unsafe output path: ${relativePath}`,
  );
  return filePath;
}

function assertFile(relativePath) {
  const filePath = outputPath(relativePath);
  assert(fs.existsSync(filePath) && fs.statSync(filePath).isFile(), `Missing artifact file: ${relativePath}`);
  return filePath;
}

function readText(relativePath) {
  return fs.readFileSync(assertFile(relativePath), 'utf8');
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasMetaTag(html, name, content) {
  const escapedName = escapeRegExp(name);
  const escapedContent = escapeRegExp(content);
  return new RegExp(
    `<meta\\b(?=[^>]*\\bname="${escapedName}")(?=[^>]*\\bcontent="${escapedContent}")[^>]*>`,
    'i',
  ).test(html);
}

function expectedRoutes() {
  return ['/', ...projectSlugs.map((slug) => `/projects/${slug}/`)];
}

function collectRuntimeUrls(content) {
  const urls = [];
  const attributePattern = /\b(?:href|src|action|poster)\s*=\s*["']([^"']+)["']/gi;
  const cssPattern = /url\(\s*["']?([^\)"'\s]+)["']?\s*\)/gi;

  for (const match of content.matchAll(attributePattern)) urls.push(match[1]);
  for (const match of content.matchAll(cssPattern)) urls.push(match[1]);
  return urls;
}

function routeToOutputPath(url, basePath) {
  const cleanUrl = url.split(/[?#]/, 1)[0];
  if (basePath === '/') return cleanUrl.slice(1);
  assert(cleanUrl.startsWith(basePath), `Internal URL is outside BASE_PATH: ${url}`);
  return cleanUrl.slice(basePath.length);
}

function verifyInternalUrls(runtimeFiles, basePath, outputDirectory) {
  const expectedAssetPrefix = `${basePath}assets/actual/`;

  runtimeFiles.forEach((relativePath) => {
    const content = readText(relativePath);
    assert(!content.includes('/v5.1/'), `Unrewritten /v5.1/ URL in ${relativePath}`);

    collectRuntimeUrls(content).forEach((url) => {
      if (url.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(url) || !url.startsWith('/')) return;

      if (url.includes('/assets/')) {
        assert(
          url.startsWith(expectedAssetPrefix),
          `Asset URL is not rewritten to assets/actual in ${relativePath}: ${url}`,
        );
      }
      assert(
        basePath === '/' || url.startsWith(basePath),
        `Root-absolute internal URL is outside BASE_PATH in ${relativePath}: ${url}`,
      );

      const artifactRelativePath = routeToOutputPath(url, basePath);
      const targetPath = path.resolve(outputDirectory, artifactRelativePath);
      assert(
        targetPath === outputDirectory || targetPath.startsWith(`${outputDirectory}${path.sep}`),
        `Internal URL escapes the artifact in ${relativePath}: ${url}`,
      );
      assert(fs.existsSync(targetPath), `Internal URL target is missing in ${relativePath}: ${url}`);
    });
  });
}

function verifyMetadata(homepageHtml, projectPages) {
  const expectedHomepageTitle = 'Ashish Kumar Singh — Presentation and visual communication';
  const expectedHomepageDescription =
    'Ashish Kumar Singh — senior presentation and visual communication design for ideas that need a clear point of entry.';
  assert(homepageHtml.includes(`<title>${expectedHomepageTitle}</title>`), 'Homepage title metadata is missing.');
  assert(
    hasMetaTag(homepageHtml, 'description', expectedHomepageDescription),
    'Homepage description metadata is missing.',
  );

  [homepageHtml, ...projectPages].forEach((html, index) => {
    const label = index === 0 ? 'homepage' : `project route ${projectSlugs[index - 1]}`;
    assert(
      hasMetaTag(html, 'viewport', 'width=device-width, initial-scale=1'),
      `${label} viewport metadata is missing.`,
    );
    assert(
      hasMetaTag(html, 'theme-color', '#171c1e'),
      `${label} theme-color metadata is missing.`,
    );
  });

  projectPages.forEach((html, index) => {
    const slug = projectSlugs[index];
    const project = projectData[slug];
    const projectName = escapeHtml(project.projectName);
    const projectDescription = `${projectName} — ${escapeHtml(project.intro)}`;
    assert(
      html.includes(`<title>${projectName} — Ashish Kumar Singh</title>`),
      `${slug} title metadata is missing.`,
    );
    assert(
      hasMetaTag(html, 'description', projectDescription),
      `${slug} description metadata is missing.`,
    );
    assert(html.includes(`<body class="project-page project-page--${slug}">`), `${slug} route marker is missing.`);
    assert(html.includes('<main id="main-content"'), `${slug} main content marker is missing.`);
  });
}

function collectAssetStrings(value, result = new Set()) {
  if (typeof value === 'string' && value.startsWith('/assets/actual/')) {
    result.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((entry) => collectAssetStrings(entry, result));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectAssetStrings(entry, result));
  }
  return result;
}

function verifyAssetCopy(outputDirectory) {
  const sourceAssetFiles = walkFiles(actualAssetsSource);
  sourceAssetFiles.forEach((sourceFile) => {
    const relativePath = path.relative(actualAssetsSource, sourceFile);
    const copiedPath = path.join(outputDirectory, 'assets', 'actual', relativePath);
    assert(fs.existsSync(copiedPath) && fs.statSync(copiedPath).isFile(), `Missing copied asset: ${relativePath}`);
  });

  const generatedFiles = walkFiles(outputDirectory).map((filePath) => path.relative(outputDirectory, filePath));
  generatedFiles
    .filter((relativePath) => relativePath.startsWith('assets/'))
    .forEach((relativePath) => {
      assert(relativePath.startsWith('assets/actual/'), `Generated asset is outside assets/actual: ${relativePath}`);
    });

  const expectedDataAssets = collectAssetStrings(projectData);
  expectedDataAssets.forEach((assetUrl) => {
    const relativePath = assetUrl.slice('/'.length);
    const copiedPath = path.join(outputDirectory, relativePath);
    assert(fs.existsSync(copiedPath), `Project data asset is missing from artifact: ${assetUrl}`);
  });
}

function verifyNoNodeServerDependency(outputDirectory, runtimeFiles) {
  const generatedFiles = walkFiles(outputDirectory).map((filePath) => path.relative(outputDirectory, filePath));
  ['serve.js', 'project-data.js', 'project-template.js', 'package.json', 'package-lock.json'].forEach((forbiddenFile) => {
    assert(!generatedFiles.includes(forbiddenFile), `Runtime server/source file was copied: ${forbiddenFile}`);
  });
  assert(!generatedFiles.some((relativePath) => relativePath.startsWith('v5.1/')), 'The artifact contains a v5.1 runtime directory.');

  runtimeFiles
    .filter((relativePath) => path.extname(relativePath) === '.js')
    .forEach((relativePath) => {
      const content = readText(relativePath);
      for (const pattern of [/\brequire\s*\(/, /\bcreateServer\s*\(/, /\bnode:(?:http|fs|path|url)\b/]) {
        assert(!pattern.test(content), `Node server dependency ${pattern} found in ${relativePath}.`);
      }
    });
}

function verifyStaticPages() {
  const basePath = normalizeBasePath(process.env.BASE_PATH);
  const outputDirectory = resolveOutputDirectory();
  assert(fs.existsSync(outputDirectory) && fs.statSync(outputDirectory).isDirectory(), `Missing output directory: ${outputDirectory}`);

  const requiredFiles = [
    'index.html',
    'styles.css',
    'app.js',
    'favicon.svg',
    'projects/project.css',
    'projects/project.js',
    '.nojekyll',
    manifestFileName,
  ];
  requiredFiles.forEach(assertFile);
  assert(fs.readFileSync(outputPath('.nojekyll'), 'utf8') === '', '.nojekyll must be empty.');

  const manifest = JSON.parse(readText(manifestFileName));
  assert(manifest.basePath === basePath, `Manifest basePath must be ${basePath}.`);
  assert(Array.isArray(manifest.routes), 'Manifest routes must be an array.');
  assert(JSON.stringify(manifest.routes) === JSON.stringify(expectedRoutes()), 'Manifest route list is incorrect.');

  const homepageHtml = readText('index.html');
  const projectPages = projectSlugs.map((slug) => readText(path.join('projects', slug, 'index.html')));
  const runtimeFiles = [
    'index.html',
    'styles.css',
    'app.js',
    'favicon.svg',
    'projects/project.css',
    'projects/project.js',
    ...projectSlugs.map((slug) => path.join('projects', slug, 'index.html')),
  ];

  verifyMetadata(homepageHtml, projectPages);
  verifyAssetCopy(outputDirectory);
  verifyInternalUrls(runtimeFiles, basePath, outputDirectory);
  verifyNoNodeServerDependency(outputDirectory, runtimeFiles);

  const expectedSharedFiles = [
    `${basePath}styles.css`,
    `${basePath}app.js`,
    `${basePath}favicon.svg`,
  ];
  expectedSharedFiles.forEach((url) => assert(homepageHtml.includes(url), `Homepage is missing rewritten URL: ${url}`));
  projectSlugs.forEach((slug, index) => {
    const routeUrl = `${basePath}projects/${slug}/`;
    assert(homepageHtml.includes(routeUrl), `Homepage is missing rewritten project link: ${routeUrl}`);
    const projectHtml = projectPages[index];
    [`${basePath}projects/project.css`, `${basePath}projects/project.js`, `${basePath}favicon.svg`, `${basePath}`].forEach((url) => {
      assert(projectHtml.includes(url), `${slug} route is missing rewritten URL: ${url}`);
    });
  });

  console.log(
    `V5.1 GitHub Pages artifact verified at ${path.relative(root, outputDirectory) || '.'} ` +
      `(${projectSlugs.length} project routes, base ${basePath}).`,
  );
}

try {
  verifyStaticPages();
} catch (error) {
  console.error(`V5.1 GitHub Pages verification failed: ${error.message}`);
  process.exitCode = 1;
}
