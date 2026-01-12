import pino from 'pino';

// Define log level based on environment
const level = process.env.LOG_LEVEL || 'info';

// Use pino-pretty for dev, plain JSON for prod
const transport = process.env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss'
        }
    }
    : undefined;

export const logger = pino({
    level,
    transport,
    base: { pid: process.pid } // Include PID
});
