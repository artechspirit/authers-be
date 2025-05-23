"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", authController_1.register);
// POST /api/auth/login
router.post("/login", authController_1.login);
// POST /api/auth/logout
router.post("/logout", authController_1.logout);
// POST /api/auth/refresh_token
router.post("/refresh_token", authController_1.refreshToken);
exports.default = router;
