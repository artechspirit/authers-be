import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getProfile } from "../controllers/userController";

const router = Router();

router.get("/profile", authenticate, getProfile);

export default router;
