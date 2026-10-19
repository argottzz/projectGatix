import type { Request } from "express";

export interface AuthUser {
  id: number;
  name?: string;
  email?: string;
  role: "user" | "organizer";
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
