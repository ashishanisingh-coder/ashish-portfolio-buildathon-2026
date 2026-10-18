const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteSource = path.join(root, 'site');
const actualAssetsSource = path.join(root, 'assets', 'actual');
const outputDirectory = path.resolve(root, process.env.STATIC_OUT_DIR || 'dist');
const defaultBasePath = '/ashish-portfolio-buildathon-2026/';
const projectSlugs = ['philips', 'india', 'rotavirus', 'uno'];
const textExtensions = new Set(['.css', '.html', '.js', '.svg']);

function normalizeBasePath(value) {
  const raw = String(value || defaultBasePath).trim();
  if (!raw.startsWith('/') || /^\/\//.test(raw)) {
    throw new Error(`BASE_PATH must be a root-relative path, received: ${raw}`);
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return `${withoutTrailingSlash || ''}/`;
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function rewriteInternalUrls(content, basePath) {
  // The source site is also served by the Node preview under /site/. The
  // static artifact flattens those files into its document root, so remove
  // that source-only prefix before applying the GitHub Pages base path.
  const withoutSitePrefix = content.replace(/(["'`])\/site\//g, (_, quote) => `${quote}${basePath}`);

  // Rewrite only known internal URL roots. Keeping this list explicit avoids
  // changing JavaScript regex literals or ordinary strings such as split('/').
  const quotedInternalPaths = withoutSitePrefix.replace(
    /(["'`])\/(assets|projects)\//g,
    (_, quote, segment) => `${quote}${basePath}${segment}/`,
  );
  const cssInternalPaths = quotedInternalPaths.replace(
    /(url\(\s*["']?)\/(assets|projects)\//g,
    (_, prefix, segment) => `${prefix}${basePath}${segment}/`,
  );

  // Project pages link back to the site root with href="/". Rewrite that
  // exact attribute form while leaving fragment-only links and JS strings.
  return cssInternalPaths.replace(
    /((?:href|src|action|poster)\s*=\s*["'])\/(?=["'])/g,
    (_, prefix) => `${prefix}${basePath}`,
  );
}

function rewriteCopiedTextFiles(directory, basePath) {
  walkFiles(directory).forEach((filePath) => {
    if (!textExtensions.has(path.extname(filePath).toLowerCase())) return;
    const source = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, rewriteInternalUrls(source, basePath));
  });
}

function copyProjectRoutes(outputDirectoryPath, projectTemplate) {
  projectSlugs.forEach((slug) => {
    const routeDirectory = path.join(outputDirectoryPath, 'projects', slug);
    fs.mkdirSync(routeDirectory, { recursive: true });
    fs.writeFileSync(path.join(routeDirectory, 'index.html'), projectTemplate);
  });
}

function buildStaticSite() {
  const basePath = normalizeBasePath(process.env.BASE_PATH);

  if (!fs.existsSync(siteSource)) throw new Error(`Missing site source directory: ${siteSource}`);
  if (!fs.existsSync(actualAssetsSource)) {
    throw new Error(`Missing actual asset directory: ${actualAssetsSource}`);
  }
  if (outputDirectory === root) throw new Error('STATIC_OUT_DIR cannot be the project root.');

  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.cpSync(siteSource, outputDirectory, { recursive: true });
  fs.cpSync(actualAssetsSource, path.join(outputDirectory, 'assets', 'actual'), { recursive: true });

  rewriteCopiedTextFiles(outputDirectory, basePath);

  const projectTemplate = fs.readFileSync(path.join(outputDirectory, 'project.html'), 'utf8');
  copyProjectRoutes(outputDirectory, projectTemplate);
  fs.writeFileSync(path.join(outputDirectory, '.nojekyll'), '');

  console.log(
    `Static site built in ${path.relative(root, outputDirectory)} ` +
      `for ${basePath} (${projectSlugs.length} project routes).`,
  );
}

buildStaticSite();
