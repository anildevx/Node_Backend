import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpSchema: Schema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically remove expired OTPs

const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
export default OtpModel;
