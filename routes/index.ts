import { Router } from "express";
import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import meditationCategoryRoutes from "./medCategoryRoutes";
import yogaCategoryRoutes from "./yogaCategoryRoutes";
import poseRoutes from "./poseRoutes";
import favoriteRoutes from "./favoriteRoutes";
import userFavoriteRoutes from "./userFavoriteRoutes";

const router = Router();

// admin routes
router.use("/admin", adminRoutes);

// user routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/meditation-categories", meditationCategoryRoutes);
router.use("/yoga-categories", yogaCategoryRoutes);
router.use("/poses", poseRoutes);
router.use("/favorite-content", favoriteRoutes);
router.use("/user-favorites", userFavoriteRoutes);

export default router;
