import winston, { createLogger, transports, format } from "winston";

const { combine, printf, json, timestamp, prettyPrint, colorize, errors } =
  format;

const logFormat = printf(({ level, timestamp, message }) => {
  return `${level} ${timestamp} ${message}`;
});

winston.loggers.add("authLogger", {
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp(),
    colorize(),
    json(),
    logFormat,
    prettyPrint()
  ),

  transports: [
    new transports.Console(),
    new transports.File({ filename: "authCombinedLogger.log" }),
    // new transports.File({ filename: "authErrorLogger.log", level: "error" }),
  ],

  defaultMeta: { service: "authService" },
});


export const authLogger = winston.loggers.get("authLogger");