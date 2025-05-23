"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const index_1 = require("../index");
const User_1 = require("../entities/User");
const hash_1 = require("../utils/hash");
const class_validator_1 = require("class-validator");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    const { email, password } = req.body;
    // Validasi awal
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan password wajib diisi" });
    }
    try {
        const userRepo = index_1.AppDataSource.getRepository(User_1.User);
        // Cek apakah user sudah ada
        const existing = await userRepo.findOneBy({ email });
        if (existing) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }
        const user = new User_1.User();
        user.email = email;
        user.password = await (0, hash_1.hashPassword)(password);
        // Validasi dengan class-validator
        const errors = await (0, class_validator_1.validate)(user);
        if (errors.length > 0) {
            return res.status(400).json({ message: "Data tidak valid", errors });
        }
        const savedUser = await userRepo.save(user);
        return res
            .status(201)
            .json({ message: "Registrasi berhasil", userId: savedUser.id });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email dan password wajib diisi" });
    try {
        const userRepo = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ email });
        if (!user)
            return res.status(401).json({ message: "Email atau password salah" });
        const passwordMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!passwordMatch)
            return res.status(401).json({ message: "Email atau password salah" });
        const accessToken = (0, jwt_1.signJwt)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: user.id,
            email: user.email,
        });
        user.refreshToken = refreshToken;
        await userRepo.save(user);
        // Set cookie HttpOnly
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
        });
        return res.json({ message: "Login berhasil", accessToken });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token)
            return res.status(401).json({ message: "No token provided" });
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const userRepo = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ id: payload.userId });
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = (0, jwt_1.signJwt)({ userId: user.id, email: user.email });
        const newRefreshToken = (0, jwt_1.signRefreshToken)({
            userId: user.id,
            email: user.email,
        });
        user.refreshToken = newRefreshToken;
        await userRepo.save(user);
        res
            .cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .json({ accessToken: newAccessToken });
    }
    catch {
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const userRepo = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ id: payload.userId });
        if (user) {
            user.refreshToken = null;
            await userRepo.save(user);
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return res.json({ message: "Logout berhasil" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat logout" });
    }
};
exports.logout = logout;
