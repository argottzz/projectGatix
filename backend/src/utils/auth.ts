import type { Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";
import type { AuthUser } from "../types/auth.ts";

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return token || null;
}

export function decodeToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthUser;
  } catch {
    return null;
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as any },
  );
}
