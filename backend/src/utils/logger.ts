import winston from 'winston';
import path from 'path';
import { isDevelopment } from '../config/env.config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), logFormat),
  }),
];

if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: jsonFormat,
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export default logger;
