// A tiny SMTP server for the tests: it accepts every email and writes it to a file (one .eml per email). Usage: node e2e/smtp-sink.mjs <directory> [port]
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const directory = process.argv[2] ?? 'e2e/.mail';
const port = Number(process.argv[3] ?? 2525);
fs.mkdirSync(directory, { recursive: true });
let counter = Date.now();

net.createServer(socket => {
    const reply = text => socket.write(`${text}\r\n`);
    let inData = false;
    let message = [];
    let buffer = '';
    reply('220 smtp-sink ready');
    socket.on('data', chunk => {
        buffer += chunk.toString('utf8');
        let index;
        while ((index = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, index).replace(/\r$/, '');
            buffer = buffer.slice(index + 1);
            if (inData) {
                if (line === '.') {
                    inData = false;
                    fs.writeFileSync(path.join(directory, `${String(counter++)}.eml`), message.join('\n'));
                    message = [];
                    reply('250 ok');
                } else {
                    message.push(line.startsWith('..') ? line.slice(1) : line);
                }
                continue;
            }
            const command = line.toUpperCase();
            if (command.startsWith('EHLO') || command.startsWith('HELO')) reply('250 smtp-sink');
            else if (command.startsWith('DATA')) { inData = true; reply('354 go ahead'); }
            else if (command.startsWith('QUIT')) { reply('221 bye'); socket.end(); }
            else reply('250 ok');
        }
    });
    socket.on('error', () => undefined);
}).listen(port, '127.0.0.1', () => console.log(`smtp-sink listening on ${port}, writing to ${directory}`));
