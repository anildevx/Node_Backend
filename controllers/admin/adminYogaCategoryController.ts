import { Request, Response } from "express";
import YogaCategoryModel from "../../models/yogaCategoryModel";
import logger from "../../utils/logger";
import { YogaCategorySchema } from "../../validators/adminValidators";
import mongoose from "mongoose";

const createYogaCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = YogaCategorySchema.safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid yoga category data: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const existing = await YogaCategoryModel.findOne({
      title: validation.data.title,
    });
    if (existing) {
      logger.warn(
        `Yoga category already exists with title: ${validation.data.title}`,
      );
      res.status(409).json({
        success: false,
        message: "Category title already exists",
      });
      return;
    }

    const lastCategory = await YogaCategoryModel.findOne()
      .sort({
        id: -1,
      })
      .select("id");

    const newId = lastCategory ? Number(lastCategory.id) + 1 : 1;

    const category = await YogaCategoryModel.create({
      ...validation.data,
      id: newId,
    });
    logger.info(
      `Yoga category created: ${category.title} (ID: ${category.id})`,
    );
    res.status(201).json({
      success: true,
      data: category,
      message: "Yoga category created successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "createYogaCategory");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateYogaCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid yoga category ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid yoga category ID",
    });
    return;
  }

  const validation = YogaCategorySchema.partial().safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid update data for yoga category ID ${id}: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const updated = await YogaCategoryModel.findOneAndUpdate(
      { _id: id },
      { $set: validation.data },
      { new: true, runValidators: true },
    );

    if (!updated) {
      logger.warn(`Yoga category not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Yoga category not found",
      });
      return;
    }

    logger.info(`Yoga category updated: ${updated.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: updated,
      message: "Yoga category updated successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "updateYogaCategory");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteYogaCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid yoga category ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid yoga category ID",
    });
    return;
  }

  try {
    const deleted = await YogaCategoryModel.findOneAndDelete({ _id: id });

    if (!deleted) {
      logger.warn(`Yoga category not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Yoga category not found",
      });
      return;
    }

    logger.info(`Yoga category deleted: ${deleted.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      message: "Yoga category deleted successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "deleteYogaCategory");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createYogaCategory, updateYogaCategory, deleteYogaCategory };
