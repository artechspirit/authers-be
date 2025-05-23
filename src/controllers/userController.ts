import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";

export const getProfile = async (req: AuthRequest, res: Response) => {
  // req.user sudah ada dari middleware authenticate
  return res.json({
    message: "Ini data profile yang aman",
    user: req.user,
  });
};
