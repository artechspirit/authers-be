"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get("/profile", authMiddleware_1.authenticate, userController_1.getProfile);
exports.default = router;
