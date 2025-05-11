import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/edit-profile", authenticateToken, userController.editProfile);

export default router;
