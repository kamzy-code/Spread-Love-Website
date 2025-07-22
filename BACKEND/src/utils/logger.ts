import winston, { createLogger, transports, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";
dotenv.config();

const { combine, printf, json, timestamp, prettyPrint, splat, errors } = format;

const logFormat = printf(({ level, timestamp, message }) => {
  return `${level} ${timestamp} ${message}`;
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
  transports: [new transports.Console({ level: "debug" })],
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

  transports: [new transports.Console()],

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

  transports: [new transports.Console()],

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

  transports: [new transports.Console()],

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

  transports: [new transports.Console()],

  defaultMeta: { service: "emailService" },
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new DailyRotateFile({
      filename: "logs/appInfo-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
  logger.add(
    new DailyRotateFile({
      filename: "logs/appError-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );

  authLogger.add(
    new DailyRotateFile({
      filename: "logs/authInfo-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
  authLogger.add(
    new DailyRotateFile({
      filename: "logs/authError-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );

  adminLogger.add(
    new DailyRotateFile({
      filename: "logs/adminInfo-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
  adminLogger.add(
    new DailyRotateFile({
      filename: "logs/adminError-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );

  bookingLogger.add(
    new DailyRotateFile({
      filename: "logs/bookingInfo-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
  bookingLogger.add(
    new DailyRotateFile({
      filename: "logs/bookingError-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );

  emailLogger.add(
    new DailyRotateFile({
      filename: "logs/emailInfo-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );
  emailLogger.add(
    new DailyRotateFile({
      filename: "logs/emailError-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );
}

export default logger;
export { authLogger, adminLogger, bookingLogger, emailLogger };
