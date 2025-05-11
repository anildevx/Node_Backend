import { Request, Response } from "express";
import PoseModel from "../../models/poseModel";
import logger from "../../utils/logger";
import { PoseSchema } from "../../validators/adminValidators";
import mongoose from "mongoose";

const createPose = async (req: Request, res: Response): Promise<void> => {
  const validation = PoseSchema.safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid pose data: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const existing = await PoseModel.findOne({
      title: validation.data.title,
    });
    if (existing) {
      logger.warn(`Pose already exists with title: ${validation.data.title}`);
      res.status(409).json({
        success: false,
        message: "Pose title already exists",
      });
      return;
    }

    const pose = await PoseModel.create(validation.data);
    logger.info(`Pose created: ${pose.title} (ID: ${pose.id})`);
    res.status(201).json({
      success: true,
      data: pose,
      message: "Pose created successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "createPose");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePose = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid pose ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid pose ID",
    });
    return;
  }

  const validation = PoseSchema.partial().safeParse(req.body);

  if (!validation.success) {
    logger.warn(
      `Invalid update data for pose ID ${id}: ${JSON.stringify(validation.error.format())}`,
    );
    res.status(400).json({
      success: false,
      errors: validation.error.format(),
      message: "Validation failed",
    });
    return;
  }

  try {
    const updatedPose = await PoseModel.findByIdAndUpdate(
      { _id: id },
      { $set: validation.data },
      { new: true, runValidators: true },
    );

    if (!updatedPose) {
      logger.warn(`Pose not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Pose not found",
      });
      return;
    }

    logger.info(`Pose updated: ${updatedPose.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      data: updatedPose,
      message: "Pose updated successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "updatePose");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePose = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`Invalid pose ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Invalid pose ID",
    });
    return;
  }

  try {
    const deletedPose = await PoseModel.findByIdAndDelete({ _id: id });

    if (!deletedPose) {
      logger.warn(`Pose not found: ID ${id}`);
      res.status(404).json({
        success: false,
        message: "Pose not found",
      });
      return;
    }

    logger.info(`Pose deleted: ${deletedPose.title} (ID: ${id})`);
    res.status(200).json({
      success: true,
      message: "Pose deleted successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "deletePose");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllPoses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const poses = await PoseModel.find({}, { __v: 0 }).lean();
    res.status(200).json({
      success: true,
      data: poses,
      message: "All poses fetched successfully",
    });
  } catch (error) {
    logger.logError(error as Error, "getAllPoses");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createPose, updatePose, deletePose, getAllPoses };
