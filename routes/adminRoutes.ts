import { Router } from "express";
import * as adminController from "../controllers/admin/adminController";
import * as adminYogaCategoryController from "../controllers/admin/adminYogaCategoryController";
import * as meditationCategoryController from "../controllers/admin/adminMedCategoryyController";
import * as favoriteContentController from "../controllers/admin/adminFavoriteContentController";
import * as poseController from "../controllers/admin/adminPoseController";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// user management routes
router.post(
  "/toggle-verification",
  authenticateToken,
  requireAdmin,
  adminController.toggleUserVerification,
);

// yoga category routes
router.post(
  "/create-yoga-category",
  authenticateToken,
  requireAdmin,
  adminYogaCategoryController.createYogaCategory,
);
router.put(
  "/update-yoga-category/:id",
  authenticateToken,
  requireAdmin,
  adminYogaCategoryController.updateYogaCategory,
);
router.delete(
  "/delete-yoga-category/:id",
  authenticateToken,
  requireAdmin,
  adminYogaCategoryController.deleteYogaCategory,
);

// meditation category routes
router.post(
  "/create-meditation-category",
  authenticateToken,
  requireAdmin,
  meditationCategoryController.createMeditationCategory,
);
router.put(
  "/update-meditation-category/:id",
  authenticateToken,
  requireAdmin,
  meditationCategoryController.updateMeditationCategory,
);
router.delete(
  "/delete-meditation-category/:id",
  authenticateToken,
  requireAdmin,
  meditationCategoryController.deleteMeditationCategory,
);

// favorite content routes
router.post(
  "/create-favorite-content",
  authenticateToken,
  requireAdmin,
  favoriteContentController.createFavoriteContent,
);
router.put(
  "/update-favorite-content/:id",
  authenticateToken,
  requireAdmin,
  favoriteContentController.updateFavoriteContent,
);
router.delete(
  "/delete-favorite-content/:id",
  authenticateToken,
  requireAdmin,
  favoriteContentController.deleteFavoriteContent,
);

// pose routes
router.post(
  "/create-pose",
  authenticateToken,
  requireAdmin,
  poseController.createPose,
);
router.put(
  "/update-pose/:id",
  authenticateToken,
  requireAdmin,
  poseController.updatePose,
);
router.delete(
  "/delete-pose/:id",
  authenticateToken,
  requireAdmin,
  poseController.deletePose,
);
router.get(
  "/get-all-poses",
  authenticateToken,
  requireAdmin,
  poseController.getAllPoses,
);

export default router;
