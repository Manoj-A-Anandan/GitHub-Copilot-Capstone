import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']]
]);

export function createAppServer() {
  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    let pathname;
    try {
      pathname = new URL(request.url, 'http://localhost').pathname;
    } catch {
      response.writeHead(400).end();
      return;
    }

    const asset = assets.get(pathname);
    if (!asset) {
      response.writeHead(404).end();
      return;
    }

    try {
      const body = await readFile(new URL(`./${asset[0]}`, import.meta.url));
      response.writeHead(200, {
        'Content-Type': asset[1],
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(500).end();
    }
  });
}

function listen(port, fallback = false) {
  const server = createAppServer();
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && fallback) {
      listen(0);
      return;
    }
    console.error(`Unable to start TODO app server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`TODO app available at http://127.0.0.1:${server.address().port}/`);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const configuredPort = process.env.PORT;
  const port = configuredPort === undefined ? 4173 : Number(configuredPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error('PORT must be an integer from 0 to 65535.');
    process.exitCode = 1;
  } else {
    listen(port, configuredPort === undefined);
  }
}