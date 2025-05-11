import winston from "winston";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

interface CustomLogger extends winston.Logger {
  logRequest(req: any, message?: string): void;
  logError(err: Error, context?: string): void;
}

winston.addColors(colors);

const timeFormat = winston.format.timestamp({
  format: "YYYY-MM-DD HH:mm:ss",
});

const consoleFormat = winston.format.combine(
  timeFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const fileFormat = winston.format.combine(timeFormat, winston.format.json());

const logger = winston.createLogger({
  levels,
  format: winston.format.json(),
  defaultMeta: { service: "api-service" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
}) as CustomLogger;

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    }),
  );
}

logger.logRequest = (req: any, message: string = "HTTP Request") => {
  logger.http(`${message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
};

logger.logError = (err: Error, context: string = "") => {
  const logMessage = context ? `[${context}] ${err.message}` : err.message;
  logger.error(`${logMessage}\n${err.stack}`);
};

export default logger;
