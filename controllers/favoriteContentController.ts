import { Request, Response } from "express";
import FavoriteContentModel from "../models/favoriteContentModel";
import logger from "../utils/logger";

const getFavoriteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Fetching all favorite content");

    const content = await FavoriteContentModel.find({}, { __v: 0 }).lean();

    if (!content || content.length === 0) {
      logger.info("No favorite content found in database");
      res.status(200).json({ success: true, content: [] });
      return;
    }

    logger.info(`Successfully retrieved ${content.length} favorite items`);
    res.status(200).json({ success: true, content });
  } catch (error) {
    logger.logError(error as Error, "getFavoriteContent");
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getFavoriteContent };
