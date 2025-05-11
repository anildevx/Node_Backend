import { Router } from "express";
import * as poseController from "../controllers/poseController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/:category/:subCategory",
  authenticateToken,
  poseController.getPose,
);

export default router;
