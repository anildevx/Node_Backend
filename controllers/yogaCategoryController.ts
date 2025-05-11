import { Request, Response } from "express";
import YogaCategoryModel from "../models/yogaCategoryModel";
import logger from "../utils/logger";

const getYogaCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Fetching all yoga categories");

    const categories = await YogaCategoryModel.find({}, { __v: 0 }).lean();

    if (!categories || categories.length === 0) {
      logger.info("No yoga categories found in database");
      res.status(200).json({ success: true, categories: [] });
      return;
    }

    logger.info(`Successfully retrieved ${categories.length} yoga categories`);
    res.status(200).json({ success: true, categories });
  } catch (error) {
    logger.logError(error as Error, "getYogaCategories");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getYogaCategories };
