import winston from 'winston';
import path from 'path';

const logDir = 'logs';
const { combine, timestamp, printf, colorize } = winston.format;

interface LogInfo extends winston.Logform.TransformableInfo {
    timestamp?: string;
    level: string;
    message: string;
    [key: string]: unknown;
}

// Custom log format
const logFormat = printf((info: winston.Logform.TransformableInfo) => {
    const logInfo = info as LogInfo;
    let msg = `${logInfo.timestamp || new Date().toISOString()} [${logInfo.level}] : ${logInfo.message}`;
    
    const metadata = { ...logInfo };
    const excludeKeys = ['timestamp', 'level', 'message'];
    for (const key of excludeKeys) {
        if (key in metadata) {
            delete metadata[key];
        }
    }
    
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        // Write all logs error (and below) to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp(),
            logFormat
        )
    }));
}

export const logError = (error: Error, context?: Record<string, unknown>) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        timestamp: new Date().toISOString()
    });
};

export const logInfo = (message: string, metadata?: Record<string, unknown>) => {
    logger.info(message, metadata);
};

export const logDebug = (message: string, metadata?: Record<string, unknown>) => {
    logger.debug(message, metadata);
};

export const logWarn = (message: string, metadata?: Record<string, unknown>) => {
    logger.warn(message, metadata);
};

export default logger; 