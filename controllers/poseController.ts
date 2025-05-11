import type { Request, Response } from "express";
import PoseModel from "../models/poseModel";
import { poseParamsSchema } from "../validators/reqValidators";
import logger from "../utils/logger";

const getPose = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = poseParamsSchema.safeParse(req.params);

    if (!validationResult.success) {
      logger.warn(
        `Invalid parameters: ${JSON.stringify(validationResult.error.errors)}`,
      );
      res.status(400).json({
        message: "Invalid parameters",
        errors: validationResult.error.errors,
      });
      return;
    }

    const { category, subCategory } = validationResult.data;

    logger.info(
      `Fetching pose: category=${category}, subCategory=${subCategory}`,
    );

    const pose = await PoseModel.findOne(
      {
        category: new RegExp(`^${category}$`, "i"),
        subCategory: new RegExp(`^${subCategory}$`, "i"),
      },
      { __v: 0 },
    ).lean();

    if (!pose) {
      logger.info(
        `Pose not found: category=${category}, subCategory=${subCategory}`,
      );
      res.status(404).json({ message: "Pose not found" });
      return;
    }

    logger.info(`Successfully retrieved pose: ${subCategory}`);
    res.status(200).json(pose);
  } catch (err) {
    logger.logError(err as Error, "getPose");
    res.status(500).json({ message: "Server error" });
  }
};

export { getPose };
