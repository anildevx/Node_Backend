import { Request, Response } from "express";
import UserModel from "../models/userModel";
import { editProfileSchema } from "../validators/userValidators";
import logger from "../utils/logger";

const editProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Processing profile update");

    const userId = req.user?.userId;
    if (!userId) {
      logger.warn("Unauthorized profile update attempt");
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const parsed = editProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn(
        `Edit profile validation failed: ${JSON.stringify(parsed.error.errors)}`,
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
      return;
    }

    const { name, email, contactNumber, age } = parsed.data;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { name, email, contactNumber, age },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      logger.warn(`User not found for profile update: ${userId}`);
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    logger.info(`User profile updated successfully: ${userId}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        contactNumber: updatedUser.contactNumber,
        age: updatedUser.age,
      },
    });
  } catch (err) {
    logger.logError(err as Error, "editProfile");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { editProfile };
