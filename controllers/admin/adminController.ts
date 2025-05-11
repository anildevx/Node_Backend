import { Request, Response } from "express";
import UserModel from "../../models/userModel";
import logger from "../../utils/logger";
import { ToggleVerificationSchema } from "../../validators/adminValidators";

const toggleUserVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = ToggleVerificationSchema.safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Validation failed in toggleUserVerification: ${JSON.stringify(validation.error.errors)}`,
    );
    res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: validation.error.format(),
    });
    return;
  }

  const { userId } = validation.data;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      logger.info(`User not found for verification toggle: ${userId}`);
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.verified = !user.verified;
    await user.save();

    logger.debug(
      `Verification status toggled for user ${userId}: now ${user.verified}`,
    );
    res.status(200).json({
      success: true,
      message: `User verification status updated to ${user.verified}`,
      data: { userId: user._id, verified: user.verified },
    });
  } catch (error) {
    logger.logError(error as Error, "toggleUserVerification");
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

export { toggleUserVerification };
