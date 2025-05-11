import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
