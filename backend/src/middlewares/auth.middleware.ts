import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.ts";
import { decodeToken, extractToken } from "../utils/auth.ts";

export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Token tidak ditemukan",
    });
  }

  const user = decodeToken(token);

  if (!user) {
    return res.status(401).json({
      message: "Token tidak valid atau kadaluarsa",
    });
  }

  (req as AuthenticatedRequest).user = user;
  next();
}
