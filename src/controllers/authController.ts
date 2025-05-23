import { Request, Response } from "express";
import { AppDataSource } from "../index";
import { User } from "../entities/User";
import { comparePassword, hashPassword } from "../utils/hash";
import { validate } from "class-validator";
import { signJwt, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validasi awal
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const userRepo = AppDataSource.getRepository(User);

    // Cek apakah user sudah ada
    const existing = await userRepo.findOneBy({ email });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const user = new User();
    user.email = email;
    user.password = await hashPassword(password);

    // Validasi dengan class-validator
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Data tidak valid", errors });
    }

    const savedUser = await userRepo.save(user);

    return res
      .status(201)
      .json({ message: "Registrasi berhasil", userId: savedUser.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email dan password wajib diisi" });

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });

    if (!user)
      return res.status(401).json({ message: "Email atau password salah" });

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Email atau password salah" });

    const accessToken = signJwt({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    user.refreshToken = refreshToken;
    await userRepo.save(user);

    // Set cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return res.json({ message: "Login berhasil", accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No token provided" });
    const payload: any = verifyRefreshToken(token);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: payload.userId });

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = signJwt({ userId: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
    });

    user.refreshToken = newRefreshToken;
    await userRepo.save(user);

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    const payload: any = verifyRefreshToken(token);
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: payload.userId });

    if (user) {
      user.refreshToken = null;
      await userRepo.save(user);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat logout" });
  }
};
