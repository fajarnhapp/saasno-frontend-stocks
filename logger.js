const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.LOG_DIR || '/data/logs/com/saasno/frontend';

function ensureLogDirectory() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function getLogFilePath() {
    const date = new Date().toISOString().slice(0, 10);
    return path.join(LOG_DIR, `saasno-frontend-${date}.log`);
}

function formatValue(value) {
    if (value instanceof Error) {
        return value.stack || value.message;
    }
    if (typeof value === 'string') {
        return value;
    }
    try {
        return JSON.stringify(value, getCircularReplacer(), 2);
    } catch {
        return String(value);
    }
}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    };
}

function writeLog(level, message, meta) {
    ensureLogDirectory();
    const formattedMessage = typeof message === 'string' ? message : formatValue(message);
    const metaText = meta ? ` ${formatValue(meta)}` : '';
    const logLine = `${new Date().toISOString()} [${level}] ${formattedMessage}${metaText}\n`;
    try {
        fs.appendFileSync(getLogFilePath(), logLine, 'utf8');
    } catch (error) {
        // If logging fails, fallback to stdout to avoid crashing the app.
        process.stdout.write(`${new Date().toISOString()} [ERROR] Failed to write log: ${error}\n`);
        process.stdout.write(logLine);
    }
}

module.exports = {
    formatValue,
    info: (message, meta) => writeLog('INFO', message, meta),
    warn: (message, meta) => writeLog('WARN', message, meta),
    error: (message, meta) => writeLog('ERROR', message, meta),
    debug: (message, meta) => writeLog('DEBUG', message, meta),
};
