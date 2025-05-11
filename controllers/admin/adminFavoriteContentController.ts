import { Request, Response } from "express";
import FavoriteContentModel from "../../models/favoriteContentModel";
import logger from "../../utils/logger";
import { FavoriteContentSchema } from "../../validators/adminValidators";
import mongoose from "mongoose";

const createFavoriteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = FavoriteContentSchema.safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid favorite content data: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const existing = await FavoriteContentModel.findOne({
      title: validation.data.title,
    });
    if (existing) {
      logger.warn(
        `Favorite content already exists with title: ${validation.data.title}`,
      );
      res.status(409).json({
        success: false,
        message: "Content title already exists",
      });
      return;
    }

    const lastCategory = await FavoriteContentModel.findOne()
      .sort({
        id: -1,
      })
      .select("id");

    const newId = lastCategory ? Number(lastCategory.id) + 1 : 1;

    const content = await FavoriteContentModel.create({
      ...validation.data,
      id: newId,
    });
    logger.info(
      `Favorite content created: ${content.title} (ID: ${content.id})`,
    );

    res.status(201).json({
      success: true,
      data: content,
      message: "Favorite content created successfully",
    });
  } catch (error) {
    logger.error(
      `Error creating favorite content: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateFavoriteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid favorite content ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid favorite content ID",
    });
    return;
  }

  const validation = FavoriteContentSchema.partial().safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid update data for content ID ${id}: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const updated = await FavoriteContentModel.findByIdAndUpdate(
      { _id: id },
      { $set: validation.data },
      { new: true, runValidators: true },
    );

    if (!updated) {
      logger.warn(`Favorite content not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Favorite content not found",
      });
      return;
    }

    logger.info(`Favorite content updated: ${updated.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: updated,
      message: "Favorite content updated successfully",
    });
  } catch (error) {
    logger.error(
      `Error updating favorite content ID ${id}: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteFavoriteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid favorite content ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid favorite content ID",
    });
    return;
  }

  try {
    const deleted = await FavoriteContentModel.findByIdAndDelete({ _id: id });

    if (!deleted) {
      logger.warn(`Favorite content not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Favorite content not found",
      });
      return;
    }

    logger.info(`Favorite content deleted: ${deleted.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      message: "Favorite content deleted successfully",
    });
  } catch (error) {
    logger.error(
      `Error deleting favorite content ID ${id}: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createFavoriteContent, updateFavoriteContent, deleteFavoriteContent };
