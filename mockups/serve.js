const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 4173);
const root = path.join(__dirname, '..');

const files = {
  '/': ['site/index.html', 'text/html; charset=utf-8'],
  '/site/index.html': ['site/index.html', 'text/html; charset=utf-8'],
  '/site/project.html': ['site/project.html', 'text/html; charset=utf-8'],
  '/site/styles.css': ['site/styles.css', 'text/css; charset=utf-8'],
  '/site/app.js': ['site/app.js', 'text/javascript; charset=utf-8'],
  '/site/project.js': ['site/project.js', 'text/javascript; charset=utf-8'],
  '/site/favicon.svg': ['site/favicon.svg', 'image/svg+xml'],
  '/projects/philips': ['site/project.html', 'text/html; charset=utf-8'],
  '/projects/india': ['site/project.html', 'text/html; charset=utf-8'],
  '/projects/rotavirus': ['site/project.html', 'text/html; charset=utf-8'],
  '/projects/uno': ['site/project.html', 'text/html; charset=utf-8'],
  '/mockup': ['mockups/png/portfolio-b-the-fold-v3.png', 'image/png'],
  '/fold-v3.png': ['mockups/png/portfolio-b-the-fold-v3.png', 'image/png'],
  '/fold-v3.svg': ['mockups/portfolio-b-the-fold-v3.svg', 'image/svg+xml'],
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let entry = files[requestPath];
  if (!entry && requestPath.startsWith('/assets/actual/') && !requestPath.includes('..')) {
    const extension = path.extname(requestPath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };
    entry = [requestPath.slice(1), contentTypes[extension] || 'application/octet-stream'];
  }
  if (!entry) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const filePath = path.join(root, entry[0]);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Missing artifact: ${entry[0]}`);
    return;
  }

  res.writeHead(200, { 'content-type': entry[1], 'cache-control': 'no-cache' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio preview: http://localhost:${port}/`);
});
