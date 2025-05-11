import { Request, Response } from "express";
import UserFavoriteModel from "../models/userFavoriteModel";
import logger from "../utils/logger";
import FavoriteContentModel from "../models/favoriteContentModel";
import { toggleFavoriteSchema } from "../validators/reqValidators";
import mongoose from "mongoose";

// const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = req.user?.userId;

//     const validation = toggleFavoriteSchema.safeParse(req.body);
//     if (!validation.success) {
//       logger.info("Invalid contentId provided in request body");
//       res.status(400).json({
//         success: false,
//         message: "Invalid input",
//         errors: validation.error.errors,
//       });
//       return;
//     }

//     const { type, title } = validation.data;

//     logger.info(
//       `Toggling favorite for user: ${userId}, type: ${type}, title: ${title}`,
//     );

//     if (!userId) {
//       logger.info("User not authenticated");
//       res
//         .status(400)
//         .json({ success: false, message: "User not authenticated" });
//       return;
//     }

//     const contentExists = await FavoriteContentModel.findOne({
//       type,
//       title,
//     });
//     if (!contentExists) {
//       logger.info(`Content not found with type: ${type}, title: ${title}`);
//       res.status(404).json({ success: false, message: "Content not found" });
//       return;
//     }

//     // Find the user's favorite record
//     let favoriteRecord = await UserFavoriteModel.findOne({ user: userId });

//     if (!favoriteRecord) {
//       logger.info("No favorite record found. Creating new one.");
//       await UserFavoriteModel.create({
//         user: userId,
//         favoriteContent: [contentExists._d],
//       });
//       logger.info("Added content to new favorite list");
//       res.status(200).json({ success: true, message: "Added to favorites" });
//       return;
//     }

//     const index = favoriteRecord.favoriteContent.findIndex(
//       (id) => id.toString() === contentId.toString(),
//     );

//     if (index > -1) {
//       // Remove from favorites
//       favoriteRecord.favoriteContent.splice(index, 1);
//       await favoriteRecord.save();
//       logger.info("Removed content from favorites");
//       res
//         .status(200)
//         .json({ success: true, message: "Removed from favorites" });
//     } else {
//       // Add to favorites
//       favoriteRecord.favoriteContent.push(
//         new mongoose.Types.ObjectId(contentId),
//       );
//       await favoriteRecord.save();
//       logger.info("Added content to favorites");
//       res.status(200).json({ success: true, message: "Added to favorites" });
//     }
//   } catch (err) {
//     logger.logError(err as Error, "toggleFavorite");
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err });
//   }
// };

const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const validation = toggleFavoriteSchema.safeParse(req.body);
    if (!validation.success) {
      logger.info("Invalid type or title provided in request body");
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
      return;
    }

    const { type, title } = validation.data;

    logger.info(
      `Toggling favorite for user: ${userId}, type: ${type}, title: ${title}`,
    );

    if (!userId) {
      logger.info("User not authenticated");
      res
        .status(400)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const contentExists = await FavoriteContentModel.findOne({ type, title });
    if (!contentExists) {
      logger.info(`Content not found with type: ${type}, title: ${title}`);
      res.status(404).json({ success: false, message: "Content not found" });
      return;
    }

    const contentId = contentExists._id as mongoose.Types.ObjectId;

    let favoriteRecord = await UserFavoriteModel.findOne({ user: userId });

    if (!favoriteRecord) {
      logger.info("No favorite record found. Creating new one.");
      await UserFavoriteModel.create({
        user: userId,
        favoriteContent: [contentId],
      });
      logger.info("Added content to new favorite list");
      res.status(200).json({ success: true, message: "Added to favorites" });
      return;
    }

    const index = favoriteRecord.favoriteContent.findIndex(
      (id) => id.toString() === contentId.toString(),
    );

    if (index > -1) {
      // Remove from favorites
      favoriteRecord.favoriteContent.splice(index, 1);
      await favoriteRecord.save();
      logger.info("Removed content from favorites");
      res
        .status(200)
        .json({ success: true, message: "Removed from favorites" });
    } else {
      // Add to favorites
      favoriteRecord.favoriteContent.push(contentId);
      await favoriteRecord.save();
      logger.info("Added content to favorites");
      res.status(200).json({ success: true, message: "Added to favorites" });
    }
  } catch (err) {
    logger.logError(err as Error, "toggleFavorite");
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

const getUserFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info("Fetching user-specific favorite items");

    const userId = req.user?.userId;
    logger.info(`Fetching favorites for user ID: ${userId}`);

    const favoriteRecord = await UserFavoriteModel.findOne({
      user: userId,
    }).populate("favoriteContent");

    if (!favoriteRecord || favoriteRecord.favoriteContent.length === 0) {
      logger.info("No favorite items found for user");
      res.status(200).json({ success: true, favorites: [] });
      return;
    }

    logger.info(
      `Successfully retrieved ${favoriteRecord.favoriteContent.length} favorite items`,
    );
    res
      .status(200)
      .json({ success: true, favorites: favoriteRecord.favoriteContent });
  } catch (err) {
    logger.logError(err as Error, "getUserFavorites");
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

export { toggleFavorite, getUserFavorites };
