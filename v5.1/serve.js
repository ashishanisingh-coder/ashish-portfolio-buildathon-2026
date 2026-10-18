#!/usr/bin/env node

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const projectData = require('./projects/project-data');
const { renderProject } = require('./projects/project-template');

const ROOT = path.resolve(__dirname, '..');
const V51_ROOT = path.join(ROOT, 'v5.1');
const PORT = Number(process.env.PORT || 4184);

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

function sendHtml(response, html, method) {
  const body = Buffer.from(html, 'utf8');
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length,
  });

  if (method === 'HEAD') {
    response.end();
    return;
  }

  response.end(body);
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

  const projectMatch = parsedUrl.pathname.match(/^\/v5\.1\/projects\/([a-z0-9-]+)\/?$/);
  if (projectMatch) {
    const projectSlug = projectMatch[1];
    const project = Object.prototype.hasOwnProperty.call(projectData, projectSlug)
      ? projectData[projectSlug]
      : null;
    if (!project) {
      respondNotFound(response);
      return;
    }
    sendHtml(response, renderProject(project), request.method);
    return;
  }

  let filePath;
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/v5.1' || parsedUrl.pathname === '/v5.1/') {
    filePath = path.join(V51_ROOT, 'index.html');
  } else if (parsedUrl.pathname.startsWith('/v5.1/')) {
    filePath = safePath(V51_ROOT, parsedUrl.pathname.slice('/v5.1'.length));
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
  console.log(`Flat Signal running at http://127.0.0.1:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
