import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/authController";

const router = Router();

// POST /api/auth/register
router.post("/register", register);
// POST /api/auth/login
router.post("/login", login);
// POST /api/auth/logout
router.post("/logout", logout);
// POST /api/auth/refresh_token
router.post("/refresh_token", refreshToken);

export default router;
