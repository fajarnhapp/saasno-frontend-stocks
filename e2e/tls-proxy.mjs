// HTTPS in front of the frontend: the CSRF cookie (__Host-) is only accepted by the browser over HTTPS.
// Usage: node e2e/tls-proxy.mjs <key.pem> <cert.pem> [listen port] [frontend port]
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';

const [key, cert, listen = '3443', target = '3100'] = process.argv.slice(2);
https.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, (req, res) => {
    const upstream = http.request(
        { host: '127.0.0.1', port: Number(target), path: req.url, method: req.method, headers: { ...req.headers, host: `localhost:${listen}`, 'x-forwarded-proto': 'https' } },
        response => {
            res.writeHead(response.statusCode ?? 502, response.headers);
            response.pipe(res);
        },
    );
    upstream.on('error', () => {
        res.writeHead(502);
        res.end('Bad gateway');
    });
    req.pipe(upstream);
}).listen(Number(listen), () => console.log(`tls-proxy: https://localhost:${listen} -> http://127.0.0.1:${target}`));
