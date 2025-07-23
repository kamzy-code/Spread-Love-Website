import winston, { createLogger, transports, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import dotenv from "dotenv";
dotenv.config();

const { combine, printf, json, timestamp, prettyPrint, splat, errors } = format;

const logFormat = printf(({ level, timestamp, message }) => {
  return `${level} ${timestamp} ${message}`;
});

export const logtail = new Logtail(process.env.BETTER_STACK_SOURCE as string, {
  endpoint: process.env.BETTER_STACK_ENDPOINT,
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),
  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/appInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/appError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],
});

const authLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/authInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/authError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],

  defaultMeta: { service: "authService" },
});

const adminLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/adminInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/adminError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),

    new transports.Console(),
  ],

  defaultMeta: { service: "adminService" },
});

const bookingLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/bookingInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/bookingError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],

  defaultMeta: { service: "bookingService" },
});

const emailLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/emailInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/emailError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],

  defaultMeta: { service: "emailService" },
});

const logsLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/logInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/logError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],

  defaultMeta: { service: "logService" },
});

const paymentLogger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    ...(process.env.NODE_ENV === "production"
      ? [
          new LogtailTransport(logtail),
          new DailyRotateFile({
            filename: "logs/paymentInfo-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
          }),
          new DailyRotateFile({
            filename: "logs/paymentError-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
    new transports.Console(),
  ],

  defaultMeta: { service: "paymentService" },
});
export default logger;
export { authLogger, adminLogger, bookingLogger, emailLogger, logsLogger, paymentLogger };
