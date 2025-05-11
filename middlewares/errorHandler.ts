import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.logError(err, `${req.method} ${req.path}`);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "production" ? "Server error" : err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};
