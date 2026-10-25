// Mode dev: menulis semua output server ke file log yang sama seperti produksi (server.js + logger.js), supaya log dev juga terbaca di Grafana.
// Dimuat lewat NODE_OPTIONS=--require di script "dev" (package.json), jadi ikut aktif di proses worker Next.js.
// Tidak dipakai di produksi dan tidak ikut ke image Docker.
const logger = require('./logger');

// Next.js menulis baris request ("GET /login 200 in 3s") langsung ke stdout, tanpa lewat console. Karena itu stdout/stderr ikut dibungkus,
// dan console.* menandai dirinya agar tidak tercatat dua kali.
let insideConsole = false;

const ANSI = /\u001b\[[0-9;]*m/g;
// Penanda internal antar-proses Turbopack, bukan log aplikasi.
const INTERNAL = /^TURBOPACK_OUTPUT_/;

// Satu pemanggilan = satu entri (objek multi-baris dan stack trace tetap utuh), sama seperti logger.js di produksi.
function writeEntry(level, text) {
    const message = text.replace(ANSI, '').trimEnd();
    if (message.trim() && !INTERNAL.test(message)) {
        logger[level](message);
    }
}

for (const [method, level] of [['log', 'info'], ['info', 'info'], ['warn', 'warn'], ['error', 'error']]) {
    const original = console[method].bind(console);
    console[method] = (...args) => {
        writeEntry(level, args.map((arg) => logger.formatValue(arg)).join(' '));
        insideConsole = true;
        try {
            original(...args);
        } finally {
            insideConsole = false;
        }
    };
}

for (const [stream, level] of [[process.stdout, 'info'], [process.stderr, 'error']]) {
    const originalWrite = stream.write.bind(stream);
    stream.write = (chunk, ...rest) => {
        if (!insideConsole && (typeof chunk === 'string' || Buffer.isBuffer(chunk))) {
            writeEntry(level, chunk.toString());
        }
        return originalWrite(chunk, ...rest);
    };
}
