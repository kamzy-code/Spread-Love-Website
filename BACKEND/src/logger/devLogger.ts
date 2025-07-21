import winston, { createLogger, transports, format } from "winston";

const { combine, printf, json, timestamp, prettyPrint, splat, errors } = format;

const logFormat = printf(({ level, timestamp, message }) => {
  return `${level} ${timestamp} ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), errors({ stack: true }), splat(), json(), prettyPrint(),),
  transports: [
    new transports.Console({ level: "debug" }), // Dev mode
    // new transports.File({ filename: "logs/error.log", level: "error" }),
    // new transports.File({ filename: "logs/combined.log" }),
  ],
});

winston.loggers.add("authLogger", {
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    new transports.Console(),
    // new transports.File({ filename: "authCombinedLogger.log" }),
    // new transports.File({ filename: "authErrorLogger.log", level: "error" }),
  ],

  defaultMeta: { service: "authService" },
});

winston.loggers.add("adminLogger", {
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    new transports.Console(),
    // new transports.File({ filename: "authCombinedLogger.log" }),
    // new transports.File({ filename: "authErrorLogger.log", level: "error" }),
  ],

  defaultMeta: { service: "adminService" },
});

winston.loggers.add("bookingLogger", {
  level: "info",
  format: combine(
    timestamp(),
    errors({ stack: true }),
    splat(),
    json(),
    prettyPrint()
  ),

  transports: [
    new transports.Console(),
    // new transports.File({ filename: "authCombinedLogger.log" }),
    // new transports.File({ filename: "authErrorLogger.log", level: "error" }),
  ],

  defaultMeta: { service: "bookingService" },
});

export default logger;
export const authLogger = winston.loggers.get("authLogger");
export const adminLogger = winston.loggers.get("adminLogger");
export const bookingLogger = winston.loggers.get("bookingLogger")
