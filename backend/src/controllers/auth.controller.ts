import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.ts";
import { env } from "../config/env.ts";
import { loginSchema, registerSchema, updateProfileSchema } from "../validations/auth.ts";

export class AuthController {
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

      const { name, email, password } = validation.data;

      const [existing]: any = await pool.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email],
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email Sudah Ada",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result]: any = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
        [name, email, hashedPassword],
      );

      const token = jwt.sign(
        { id: result.insertId, name, email, role: "user" },
        env.jwtSecret,
        {
          expiresIn: env.jwtExpiresIn as any,
        },
      );

      return res.status(201).json({
        success: true,
        message: "Register berhasil",
        data: { id: result.insertId, name, email, role: "user" },
        token,
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

      const { email, password } = validation.data;

      const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email],
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any },
      );

      return res.json({
        success: true,
        message: "Login berhasil",
        token,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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
      const userId = (req as any).user.id;
      const [rows]: any = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
        [userId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.json({ message: "Fetch Successfully.", data: rows[0] });
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

      const userId = (req as any).user.id;
      const [result]: any = await pool.query("UPDATE users SET name = ? WHERE id = ?", [
        validation.data.name,
        userId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const [rows]: any = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
        [userId],
      );

      res.json({ message: "Profil berhasil diperbarui", data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal memperbarui profil" });
    }
  };

  becomeOrganizer = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [rows]: any = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
        [userId],
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      if (rows[0].role === "organizer") {
        return res.status(400).json({ message: "Akun ini sudah menjadi organizer" });
      }

      await pool.query("UPDATE users SET role = 'organizer' WHERE id = ?", [userId]);

      const updated = { ...rows[0], role: "organizer" };
      const token = jwt.sign(
        { id: updated.id, email: updated.email, name: updated.name, role: updated.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as any },
      );

      res.json({ message: "Akun berhasil diupgrade menjadi organizer", data: updated, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal upgrade menjadi organizer" });
    }
  };
}

export default new AuthController();
