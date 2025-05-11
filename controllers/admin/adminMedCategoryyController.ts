import { Request, Response } from "express";
import MeditationCategoryModel from "../../models/meditationCategoryModel";
import logger from "../../utils/logger";
import { MeditationCategorySchema } from "../../validators/adminValidators";
import mongoose from "mongoose";

const createMeditationCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = MeditationCategorySchema.safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid meditation category data: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const existing = await MeditationCategoryModel.findOne({
      title: validation.data.title,
    });
    if (existing) {
      logger.warn(
        `Meditation category already exists with title: ${validation.data.title}`,
      );
      res.status(409).json({
        success: false,
        message: "Category title already exists",
      });
      return;
    }

    const category = await MeditationCategoryModel.create(validation.data);
    logger.info(
      `Meditation category created: ${category.title} (ID: ${category.id})`,
    );
    res.status(201).json({
      success: true,
      data: category,
      message: "Meditation category created successfully",
    });
  } catch (error) {
    logger.error(
      `Error creating meditation category: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMeditationCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid meditation category ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid meditation category ID",
    });
    return;
  }

  const validation = MeditationCategorySchema.partial().safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid update data for category ID ${id}: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const updated = await MeditationCategoryModel.findByIdAndUpdate(
      { _id: id },
      { $set: validation.data },
      { new: true, runValidators: true },
    );

    if (!updated) {
      logger.warn(`Meditation category not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Meditation category not found",
      });
      return;
    }

    logger.info(`Meditation category updated: ${updated.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: updated,
      message: "Meditation category updated successfully",
    });
  } catch (error) {
    logger.error(
      `Error updating meditation category ID ${id}: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteMeditationCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid meditation category ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid meditation category ID",
    });
    return;
  }

  try {
    const deleted = await MeditationCategoryModel.findByIdAndDelete({
      _id: id,
    });

    if (!deleted) {
      logger.warn(`Meditation category not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Meditation category not found",
      });
      return;
    }

    logger.info(`Meditation category deleted: ${deleted.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      message: "Meditation category deleted successfully",
    });
  } catch (error) {
    logger.error(
      `Error deleting meditation category ID ${id}: ${(error as Error).message}`,
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  createMeditationCategory,
  updateMeditationCategory,
  deleteMeditationCategory,
};
