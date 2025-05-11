import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userModel";
import { registerSchema, loginSchema } from "../validators/userValidators";
import { config } from "../config/config";
import { signToken, verifyToken } from "../utils/jwt";
import {
  sendForgotPasswordEmail,
  sendVerificationEmail,
} from "../utils/mailer";
import OtpModel from "../models/otpModel";
import { generateOtp } from "../utils/generateOtps";
import { sendOtpSchema, verifyOtpSchema } from "../validators/otpValidators";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/passwordValidators";
import logger from "../utils/logger";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing user registration request");

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `Registration validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { name, email, age, password } = parsed.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      logger.info(`Registration attempt with existing email: ${email}`);
      res.status(409).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      age,
      password: hashedPassword,
      verified: false,
    });

    logger.info(`New user created: ${newUser._id}`);

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    await OtpModel.create({
      email,
      otp,
      expiresAt,
    });

    try {
      // Send OTP email
      await sendVerificationEmail(email, otp);
      logger.info(`Verification email sent to: ${email}`);
    } catch (emailError) {
      logger.error(
        `Failed to send verification email: ${(emailError as Error).message}`,
      );
    }

    res.status(201).json({
      success: true,
      message:
        "User registered. Check your email for the OTP to verify your account.",
    });
  } catch (err) {
    logger.logError(err as Error, "registerUser");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing login request");

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `Login validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      logger.info(`Login attempt with non-existent email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.warn(`Failed login attempt for user: ${user._id}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if user is verified
    if (!user.verified) {
      logger.info(`Login attempt for unverified user: ${user._id}`);

      // Generate new OTP for verification
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await OtpModel.findOneAndUpdate(
        { email },
        { otp, expiresAt },
        { upsert: true, new: true },
      );

      try {
        await sendVerificationEmail(email, otp);
        logger.info(`New verification email sent to: ${email}`);
      } catch (emailError) {
        logger.error(
          `Failed to send verification email: ${(emailError as Error).message}`,
        );
      }

      res.status(403).json({
        success: false,
        message: "Email not verified. A new OTP has been sent to your email.",
      });
      return;
    }

    // Generate tokens
    const accessToken = signToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
      "15m",
    );

    const refreshToken = signToken(
      {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion || 0,
      },
      "7d",
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in successfully: ${user._id}`);

    // Return access token
    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.contactNumber,
        role: user.role || "user",
      },
    });
  } catch (err) {
    logger.logError(err as Error, "loginUser");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Processing refresh token request");

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      logger.warn("Refresh token missing from cookie");
      res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
      return;
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken) as {
      userId: string;
      tokenVersion: number;
    };

    if (!decoded || !decoded.userId) {
      logger.warn("Invalid refresh token payload");
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      logger.warn(`User not found for refresh token: ${decoded.userId}`);
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      logger.warn(`Token version mismatch for user: ${user._id}`);
      res
        .status(401)
        .json({ success: false, message: "Token has been revoked" });
      return;
    }

    const newAccessToken = signToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
      "15m",
    );

    logger.info(`Access token refreshed for user: ${user._id}`);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      logger.info("Refresh token expired");
      res.status(401).json({
        success: false,
        message: "Refresh token expired, please login again",
      });
      return;
    }

    logger.logError(err as Error, "refreshAccessToken");
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

const sendOtpToEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing OTP request");

    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `OTP request validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { email } = parsed.data;
    const user = await UserModel.findOne({ email });

    if (!user) {
      logger.info(`OTP requested for non-existent email: ${email}`);
      res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent",
      });
      return;
    }

    if (user.verified) {
      logger.info(`OTP requested for already verified user: ${user._id}`);
      res.status(400).json({
        success: false,
        message: "User is already verified",
      });
      return;
    }

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true },
    );

    try {
      await sendVerificationEmail(email, otp);
      logger.info(`Verification OTP sent to: ${email}`);
    } catch (emailError) {
      logger.error(
        `Failed to send OTP email: ${(emailError as Error).message}`,
      );
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    logger.logError(err as Error, "sendOtpToEmail");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing OTP verification");

    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `OTP verification validation failed: ${JSON.stringify(
          parsed.error.errors,
        )}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { email, otp } = parsed.data;
    const otpRecord = await OtpModel.findOne({ email });

    if (!otpRecord) {
      logger.info(`OTP verification attempt with no OTP record: ${email}`);
      res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      logger.info(`OTP verification attempt with expired OTP: ${email}`);
      await OtpModel.deleteOne({ email }); // Clean up expired OTP
      res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
      return;
    }

    if (otpRecord.otp !== otp) {
      logger.warn(`OTP verification attempt with invalid OTP: ${email}`);
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    // Mark user as verified
    await UserModel.updateOne({ email }, { verified: true });
    await OtpModel.deleteOne({ email }); // OTP used, so remove

    const user = await UserModel.findOne({ email });

    if (!user) {
      logger.info(`User not found for email: ${email}`);
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const accessToken = signToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || "user",
      },
      "15m",
    );

    const refreshToken = signToken(
      {
        userId: user._id.toString(),
        tokenVersion: user.tokenVersion || 0,
      },
      "7d",
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.lastLogin = new Date();
    await user.save();

    logger.info(`Email verified successfully: ${email}`);
    res.status(200).json({
      success: true,
      message: "Email successfully verified",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        phone: user.contactNumber,
        role: user.role || "user",
      },
    });
  } catch (err) {
    logger.logError(err as Error, "verifyOtp");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing forgot password request");

    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `Forgot password validation failed: ${JSON.stringify(
          parsed.error.errors,
        )}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { email } = parsed.data;
    const user = await UserModel.findOne({ email });

    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      res.status(200).json({
        success: true,
        message: "If this email is registered, an OTP has been sent",
      });
      return;
    }

    // Generate and store password reset OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, expiresAt, type: "password_reset" },
      { upsert: true, new: true },
    );

    try {
      await sendForgotPasswordEmail(email, otp);
      logger.info(`Password reset OTP sent to: ${email}`);
    } catch (emailError) {
      logger.error(
        `Failed to send password reset email: ${(emailError as Error).message}`,
      );
      res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "If this email is registered, an OTP has been sent",
    });
  } catch (err) {
    logger.logError(err as Error, "forgotPassword");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyPasswordResetOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Processing password reset OTP verification");

    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `OTP verification validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { email, otp } = parsed.data;
    const otpRecord = await OtpModel.findOne({ email });

    if (!otpRecord) {
      logger.info(`OTP verification attempt with no OTP record: ${email}`);
      res.status(404).json({
        success: false,
        message:
          "No OTP found for this email. Please request a new OTP to continue.",
      });
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      logger.info(`OTP verification attempt with expired OTP: ${email}`);
      await OtpModel.deleteOne({ email });
      res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
      return;
    }

    if (otpRecord.otp !== otp) {
      logger.warn(`OTP verification attempt with invalid OTP: ${email}`);
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    await OtpModel.deleteOne({ email });

    const token = signToken(
      {
        email,
        purpose: "password_reset",
      },
      "10m",
    );

    logger.info(`OTP verified and reset token issued for: ${email}`);
    res.status(200).json({
      success: true,
      message: "OTP verified. Use the provided token to reset your password.",
      token,
    });
  } catch (err) {
    logger.logError(err as Error, "verifyPasswordResetOtp");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing password reset");

    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `Password reset validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { newPassword } = parsed.data;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Authorization token missing" });
      return;
    }

    let payload;
    try {
      payload = verifyToken(token) as { email: string; purpose: string };
    } catch (err) {
      logger.warn("Invalid or expired reset token");
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    if (payload.purpose !== "password_reset") {
      logger.warn("Invalid token purpose for password reset");
      res
        .status(403)
        .json({ success: false, message: "Invalid token purpose" });
      return;
    }

    const email = payload.email;

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        $inc: { tokenVersion: 1 },
      },
    );

    logger.info(`Password reset successful for: ${email}`);
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    logger.logError(err as Error, "resetPassword");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing logout request");

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    logger.logError(err as Error, "logoutUser");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  sendOtpToEmail,
  verifyOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
  verifyPasswordResetOtp,
};
