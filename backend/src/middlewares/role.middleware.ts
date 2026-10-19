import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.ts";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Akses ditolak. Role tidak diizinkan.",
      });
    }

    next();
  };
}
