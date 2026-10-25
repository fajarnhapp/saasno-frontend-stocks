const path = require('path');
const logger = require('./logger');

function formatArgument(arg) {
    if (arg instanceof Error) {
        return arg.stack || arg.message;
    }
    if (typeof arg === 'string') {
        return arg;
    }
    try {
        return JSON.stringify(arg, getCircularReplacer(), 2);
    } catch {
        return String(arg);
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

function wrapConsoleMethod(level) {
    const original = console[level].bind(console);
    return (...args) => {
        const message = args.map(formatArgument).join(' ');
        if (level === 'error') {
            logger.error(message);
        } else if (level === 'warn') {
            logger.warn(message);
        } else {
            logger.info(message);
        }
        original(...args);
    };
}

console.log = wrapConsoleMethod('log');
console.info = wrapConsoleMethod('info');
console.warn = wrapConsoleMethod('warn');
console.error = wrapConsoleMethod('error');

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    console.error(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
    console.error(reason);
});

const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
require(serverPath);
