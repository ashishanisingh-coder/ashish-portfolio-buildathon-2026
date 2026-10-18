#!/usr/bin/env node

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const V5_ROOT = path.join(ROOT, 'v5');
const PORT = Number(process.env.PORT || 4183);

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
  let decoded;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch (_error) {
    return null;
  }
  const resolved = path.resolve(root, `.${decoded}`);
  return resolved.startsWith(root + path.sep) || resolved === root ? resolved : null;
}

function respondNotFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
}

function sendFile(response, filePath, method) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      respondNotFound(response);
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Content-Length': stats.size,
    });

    if (method === 'HEAD') {
      response.end();
      return;
    }

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
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/v5' || parsedUrl.pathname === '/v5/') {
    filePath = path.join(V5_ROOT, 'index.html');
  } else if (parsedUrl.pathname.startsWith('/v5/')) {
    filePath = safePath(V5_ROOT, parsedUrl.pathname.slice('/v5'.length));
  } else if (parsedUrl.pathname.startsWith('/assets/')) {
    filePath = safePath(ROOT, parsedUrl.pathname);
  }

  if (!filePath) {
    respondNotFound(response);
    return;
  }

  sendFile(response, filePath, request.method);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`V5 prototype running at http://127.0.0.1:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
