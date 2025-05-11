import { Router } from "express";
import * as yogaCategoryController from "../controllers/yogaCategoryController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticateToken, yogaCategoryController.getYogaCategories);

export default router;
