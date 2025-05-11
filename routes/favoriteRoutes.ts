import { Router } from "express";
import * as favoriteContentController from "../controllers/favoriteContentController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  favoriteContentController.getFavoriteContent,
);

export default router;
