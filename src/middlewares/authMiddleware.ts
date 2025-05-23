import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Token autentikasi tidak ditemukan" });

  const payload = verifyJwt(token);

  if (!payload)
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kedaluwarsa" });

  req.user = payload;
  next();
};
