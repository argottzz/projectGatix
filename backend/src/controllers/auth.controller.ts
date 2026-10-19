import type { Request, Response } from "express";
import {
  findUserById,
  loginUser,
  registerUser,
  updateUserRole,
  updateUserName,
} from "../services/auth.service.ts";
import type { AuthenticatedRequest } from "../types/auth.ts";
import { signToken } from "../utils/auth.ts";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validations/auth.validation.ts";

class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const result = await registerUser(validation.data);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Email Sudah Ada",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Register berhasil",
        data: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error("ERROR REGISTER:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal register",
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const result = await loginUser(validation.data);

      if (!result) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      return res.json({
        success: true,
        message: "Login berhasil",
        token: result.token,
        data: result.user,
      });
    } catch (error) {
      console.error("ERROR LOGIN:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal login",
      });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const user = await findUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({ message: "Fetch Successfully.", data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil user" });
    }
  };

  updateMe = async (req: Request, res: Response) => {
    try {
      const validation = updateProfileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const userId = (req as AuthenticatedRequest).user.id;
      const user = await updateUserName(userId, validation.data.name);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({ message: "Profil berhasil diperbarui", data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal memperbarui profil" });
    }
  };

  becomeOrganizer = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const user = await findUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      if (user.role === "organizer") {
        return res
          .status(400)
          .json({ message: "Akun ini sudah menjadi organizer" });
      }

      const updated = await updateUserRole(userId, "organizer");

      if (!updated) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const token = signToken(updated);

      res.json({
        message: "Akun berhasil diupgrade menjadi organizer",
        data: updated,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal upgrade menjadi organizer" });
    }
  };
}

export default new AuthController();
