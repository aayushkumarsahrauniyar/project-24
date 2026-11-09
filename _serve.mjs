import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('frontend');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, url === '/' ? 'index.html' : url);
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(8099, '127.0.0.1', () => console.log('serving on http://127.0.0.1:8099'));
