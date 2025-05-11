import nodemailer from "nodemailer";
import { config } from "../config/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendVerificationEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"YogaMed" <${config.email.user}>`,
    to,
    subject: "Your YogaMed Verification Code",
    html: `<p>Enter the following OTP to verify your email address:</p>
               <h2>${otp}</h2>
               <p>This code will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendForgotPasswordEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"YogaMed Support" <${config.email.user}>`,
    to,
    subject: "Reset Your YogaMed Password",
    html: `<p>Use the following OTP to reset your YogaMed account password:</p>
           <h2>${otp}</h2>
           <p>This OTP will expire in 10 minutes. If you didn’t request this, please ignore this email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
