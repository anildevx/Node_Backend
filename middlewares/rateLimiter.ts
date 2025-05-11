import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import logger from "../utils/logger";

const getRateLimiterOptions = (
  windowMs: number,
  max: number,
  message: string,
) => ({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      `Rate limit exceeded for ${req.method} ${req.originalUrl} from IP: ${req.ip}`,
    );
    res.status(429).json({
      success: false,
      message: message || "Too many requests, please try again later.",
    });
  },
});

export const authLimiter = rateLimit(
  getRateLimiterOptions(
    15 * 60 * 1000, // 15 minutes window
    5, // 5 requests per window
    "Too many login attempts. Please try again after 15 minutes.",
  ),
);

export const otpLimiter = rateLimit(
  getRateLimiterOptions(
    60 * 60 * 1000, // 1 hour window
    3, // 3 requests per hour
    "Too many OTP requests. Please try again after 1 hour.",
  ),
);

export const registrationLimiter = rateLimit(
  getRateLimiterOptions(
    24 * 60 * 60 * 1000, // 24 hours window
    5, // 5 registrations per day per IP
    "Too many accounts created from this IP. Please try again tomorrow.",
  ),
);

export const passwordResetLimiter = rateLimit(
  getRateLimiterOptions(
    60 * 60 * 1000, // 1 hour
    3, // 3 requests per hour
    "Too many password reset attempts. Please try again later.",
  ),
);

export const apiLimiter = rateLimit(
  getRateLimiterOptions(
    60 * 1000, // 1 minute
    60, // 60 requests per minute
    "Too many requests. Please try again later.",
  ),
);
