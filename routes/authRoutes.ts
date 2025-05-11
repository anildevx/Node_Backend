import { Router } from "express";
import * as authController from "../controllers/authController";
import {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  registrationLimiter,
} from "../middlewares/rateLimiter";
import {
  authenticateToken,
  validateResetToken,
} from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registrationLimiter, authController.registerUser);
router.post("/login", authLimiter, authController.loginUser);
router.post("/refresh-token", authLimiter, authController.refreshAccessToken);
router.post("/send-otp", otpLimiter, authController.sendOtpToEmail);
router.post("/verify-otp", otpLimiter, authController.verifyOtp);
router.post(
  "/verify-resetpassword-otp",
  otpLimiter,
  authController.verifyPasswordResetOtp,
);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validateResetToken,
  passwordResetLimiter,
  authController.resetPassword,
);
router.post("/logout", authenticateToken, authController.logoutUser);

export default router;
