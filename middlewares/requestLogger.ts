import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.logRequest(req);

  const start = Date.now();

  res.on("finish", () => {
    // Calculate request processing time
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      `${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`,
    );
  });

  next();
};
