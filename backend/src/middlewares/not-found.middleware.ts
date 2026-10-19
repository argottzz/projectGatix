import type { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
}
