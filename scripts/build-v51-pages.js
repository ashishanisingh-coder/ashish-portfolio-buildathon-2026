#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectData = require('../v5.1/projects/project-data');
const { renderProject } = require('../v5.1/projects/project-template');

const root = path.resolve(__dirname, '..');
const v51Source = path.join(root, 'v5.1');
const actualAssetsSource = path.join(root, 'assets', 'actual');
const defaultBasePath = '/ashish-portfolio-buildathon-2026/';
const defaultOutputDirectory = 'dist-v51-pages';
const manifestFileName = 'v51-pages-manifest.json';
const projectSlugs = ['philips', 'india', 'rotavirus', 'uno'];

function normalizeBasePath(value) {
  const raw = String(value ?? defaultBasePath).trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\r\n]/.test(raw)) {
    throw new Error(`BASE_PATH must be a root-relative path, received: ${raw}`);
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return `${withoutTrailingSlash || ''}/`;
}

function isSameOrInside(candidate, parent) {
  return candidate === parent || candidate.startsWith(`${parent}${path.sep}`);
}

function resolveOutputDirectory() {
  const configured = String(process.env.V51_PAGES_OUT_DIR || defaultOutputDirectory).trim();
  if (!configured) throw new Error('V51_PAGES_OUT_DIR cannot be empty.');

  const outputDirectory = path.resolve(root, configured);
  const protectedDirectories = [
    root,
    path.join(root, '.git'),
    path.join(root, '.github'),
    path.join(root, 'assets'),
    path.join(root, 'site'),
    path.join(root, 'v5'),
    v51Source,
  ];

  if (
    outputDirectory === root ||
    protectedDirectories
      .filter((directory) => directory !== root)
      .some((directory) => isSameOrInside(outputDirectory, directory))
  ) {
    throw new Error(`V51_PAGES_OUT_DIR would overwrite a protected project path: ${outputDirectory}`);
  }

  return outputDirectory;
}

function assertDirectory(directory, label) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`Missing ${label}: ${directory}`);
  }
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`Missing ${label}: ${filePath}`);
  }
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyFile(source, destination, label) {
  assertFile(source, label);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function rewriteRuntimeUrls(content, basePath) {
  return content.replace(/(^|["'(=\s])\/(v5\.1|assets)\//g, (_match, prefix, segment) => (
    `${prefix}${segment === 'v5.1' ? basePath : `${basePath}assets/`}`
  ));
}

function routeList() {
  return ['/', ...projectSlugs.map((slug) => `/projects/${slug}/`)];
}

function buildStaticPages() {
  const basePath = normalizeBasePath(process.env.BASE_PATH);
  const outputDirectory = resolveOutputDirectory();

  assertDirectory(v51Source, 'V5.1 source directory');
  assertDirectory(actualAssetsSource, 'actual asset directory');
  projectSlugs.forEach((slug) => {
    if (!projectData[slug]) throw new Error(`Missing V5.1 project data for ${slug}.`);
  });

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  writeText(
    path.join(outputDirectory, 'index.html'),
    rewriteRuntimeUrls(fs.readFileSync(path.join(v51Source, 'index.html'), 'utf8'), basePath),
  );
  copyFile(path.join(v51Source, 'styles.css'), path.join(outputDirectory, 'styles.css'), 'V5.1 stylesheet');
  copyFile(path.join(v51Source, 'app.js'), path.join(outputDirectory, 'app.js'), 'V5.1 browser script');
  copyFile(path.join(v51Source, 'favicon.svg'), path.join(outputDirectory, 'favicon.svg'), 'V5.1 favicon');
  copyFile(
    path.join(v51Source, 'projects', 'project.css'),
    path.join(outputDirectory, 'projects', 'project.css'),
    'V5.1 project stylesheet',
  );
  copyFile(
    path.join(v51Source, 'projects', 'project.js'),
    path.join(outputDirectory, 'projects', 'project.js'),
    'V5.1 project browser script',
  );

  fs.cpSync(actualAssetsSource, path.join(outputDirectory, 'assets', 'actual'), { recursive: true });

  projectSlugs.forEach((slug) => {
    const projectHtml = rewriteRuntimeUrls(renderProject(projectData[slug], projectData), basePath);
    writeText(path.join(outputDirectory, 'projects', slug, 'index.html'), projectHtml);
  });

  writeText(path.join(outputDirectory, '.nojekyll'), '');
  writeText(
    path.join(outputDirectory, manifestFileName),
    `${JSON.stringify({ basePath, routes: routeList() }, null, 2)}\n`,
  );

  console.log(
    `V5.1 GitHub Pages artifact built at ${path.relative(root, outputDirectory) || '.'} ` +
      `for ${basePath} (${projectSlugs.length} project routes).`,
  );
}

buildStaticPages();
