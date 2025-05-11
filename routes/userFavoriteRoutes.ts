import { Router } from "express";
import * as userFavoriteController from "../controllers/userFavoriteController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticateToken, userFavoriteController.getUserFavorites);
router.post(
  "/toggle",
  authenticateToken,
  userFavoriteController.toggleFavorite,
);

export default router;
