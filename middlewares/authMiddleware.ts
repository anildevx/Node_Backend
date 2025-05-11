import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { JwtPayloadSchema } from "../validators/tokenValidators";
import logger from "../utils/logger";

interface ResetTokenPayload extends jwt.JwtPayload {
  purpose: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId?: string;
        email?: string;
        role?: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn("Authentication attempt with missing token");
    res
      .status(401)
      .json({ success: false, message: "Authorization token missing" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    logger.warn(`Invalid token format in Authorization header: ${authHeader}`);
    res.status(401).json({ success: false, message: "Invalid token format" });
    return;
  }

  if (!config.jwt?.secret) {
    logger.error("JWT secret missing in server configuration");
    res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const result = JwtPayloadSchema.safeParse(decoded);

    if (!result.success) {
      logger.warn(
        `Invalid token payload structure: ${JSON.stringify(
          result.error.errors,
        )}`,
      );
      res
        .status(403)
        .json({ success: false, message: "Invalid token structure" });
      return;
    }

    // Attach user information to request
    req.user = result.data;

    logger.debug(`User authenticated: ${req?.user?.userId}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.info("Authentication attempt with expired token");
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`Invalid token: ${(error as Error).message}`);
      res.status(403).json({ success: false, message: "Invalid token" });
      return;
    }

    logger.logError(error as Error, "authenticateToken");
    res.status(403).json({ success: false, message: "Authentication failed" });
  }
};

export const validateResetToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn("Password reset attempt with missing token");
    res
      .status(401)
      .json({ success: false, message: "Authorization token missing" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    logger.warn(`Invalid token format in Authorization header: ${authHeader}`);
    res.status(401).json({ success: false, message: "Invalid token format" });
    return;
  }

  if (!config.jwt?.secret) {
    logger.error("JWT secret missing in server configuration");
    res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as ResetTokenPayload;

    if (decoded.purpose !== "password_reset") {
      logger.warn("JWT used for wrong purpose during password reset");
      res
        .status(403)
        .json({ success: false, message: "Invalid token purpose" });
      return;
    }

    req.user = { email: decoded.email };
    logger.debug(`Password reset token validated for: ${decoded.email}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.info("Expired reset token used");
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`Invalid reset token: ${(error as Error).message}`);
      res.status(403).json({ success: false, message: "Invalid token" });
      return;
    }

    logger.logError(error as Error, "validateResetToken");
    res
      .status(403)
      .json({ success: false, message: "Reset token validation failed" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    logger.error("requireAdmin called without authenticateToken");
    res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
    return;
  }

  if (req.user.role !== "admin") {
    logger.warn(`Access to admin route denied for user: ${req.user.userId}`);
    res.status(403).json({ success: false, message: "Access denied" });
    return;
  }

  logger.debug(`Admin access granted for user: ${req.user.userId}`);
  next();
};
