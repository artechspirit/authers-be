"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res
            .status(401)
            .json({ message: "Token autentikasi tidak ditemukan" });
    const payload = (0, jwt_1.verifyJwt)(token);
    if (!payload)
        return res
            .status(401)
            .json({ message: "Token tidak valid atau kedaluwarsa" });
    req.user = payload;
    next();
};
exports.authenticate = authenticate;
