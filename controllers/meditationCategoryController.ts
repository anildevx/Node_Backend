import type { Request, Response } from "express";
import MeditationCategoryModel from "../models/meditationCategoryModel";
import logger from "../utils/logger";

const getMeditationCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Fetching all meditation categories");

    const categories = await MeditationCategoryModel.find(
      {},
      { __v: 0 },
    ).lean();

    if (!categories || categories.length === 0) {
      logger.info("No meditation categories found in database");
      res.status(200).json({ success: true, categories: [] });
      return;
    }

    logger.info(
      `Successfully retrieved ${categories.length} meditation categories`,
    );
    res.status(200).json({ success: true, categories });
  } catch (error) {
    logger.logError(error as Error, "getMeditationCategories");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getMeditationCategories };
