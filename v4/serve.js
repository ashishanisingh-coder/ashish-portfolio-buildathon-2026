#!/usr/bin/env node

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const V4_ROOT = path.join(ROOT, 'v4');
const PORT = Number(process.env.PORT || 4182);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function safePath(root, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const resolved = path.resolve(root, `.${decoded}`);
  return resolved.startsWith(root + path.sep) || resolved === root ? resolved : null;
}

function sendFile(response, filePath) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(request.url || '/', 'http://localhost');
  } catch (_error) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  let filePath;
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/v4' || parsedUrl.pathname === '/v4/') {
    filePath = path.join(V4_ROOT, 'index.html');
  } else if (parsedUrl.pathname.startsWith('/v4/')) {
    filePath = safePath(V4_ROOT, parsedUrl.pathname.slice('/v4'.length));
  } else if (parsedUrl.pathname.startsWith('/assets/')) {
    filePath = safePath(ROOT, parsedUrl.pathname);
  }

  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  if (request.method === 'HEAD') {
    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        response.writeHead(404);
        response.end();
        return;
      }
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': contentTypes[extension] || 'application/octet-stream',
        'Content-Length': stats.size,
      });
      response.end();
    });
    return;
  }

  sendFile(response, filePath);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`V4 prototype running at http://127.0.0.1:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
