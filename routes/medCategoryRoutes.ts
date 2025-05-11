import { Router } from "express";
import * as medCategoryController from "../controllers/meditationCategoryController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  medCategoryController.getMeditationCategories,
);

export default router;
