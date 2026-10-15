import type { Request, Response } from "express";
import pool from "../config/database.ts";
import cloudinary from "../config/cloudinary.ts";
import { createRegistrationSchema, updateRegistrationStatusSchema } from "../validations/registration.ts";
import { uploadBufferToCloudinary } from "../utils/upload.ts";

export class RegistrationController {
  create = async (req: Request, res: Response) => {
    const conn = await pool.getConnection();
    try {
      const validation = createRegistrationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Data tidak valid", error: validation.error.issues });
      }
      const { event_id } = validation.data;
      const userId = (req as any).user.id;

      await conn.beginTransaction();
      const [events]: any = await conn.query("SELECT * FROM events WHERE id = ? LIMIT 1 FOR UPDATE", [event_id]);
      if (events.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      const event = events[0];

      const [existing]: any = await conn.query(
        "SELECT * FROM registrations WHERE event_id = ? AND user_id = ? LIMIT 1",
        [event_id, userId],
      );
      if (existing.length > 0 && existing[0].status !== "cancelled") {
        await conn.rollback();
        return res.status(400).json({ message: "Kamu sudah terdaftar di event ini" });
      }

      const [[{ taken }]]: any = await conn.query(
        "SELECT COUNT(*) AS taken FROM registrations WHERE event_id = ? AND status IN ('pending','approved')",
        [event_id],
      );
      if (Number(taken) >= Number(event.quota)) {
        await conn.rollback();
        return res.status(400).json({ message: "Kuota event sudah habis" });
      }

      const status = Number(event.price) === 0 ? "approved" : "pending";

      if (existing.length > 0 && existing[0].status === "cancelled") {
        await conn.query("UPDATE registrations SET status = ? WHERE id = ?", [status, existing[0].id]);
        await conn.commit();
        return res.status(200).json({ message: "Pendaftaran diaktifkan kembali", data: { id: existing[0].id, event_id, status } });
      }

      const [result]: any = await conn.query(
        "INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, ?)",
        [event_id, userId, status],
      );
      await conn.commit();
      res.status(201).json({ message: "Berhasil mendaftar event", data: { id: result.insertId, event_id, status } });
    } catch (error) {
      try { await conn.rollback(); } catch {}
      console.error("ERROR CREATE REGISTRATION:", error);
      res.status(500).json({ message: "Gagal mendaftar event" });
    } finally {
      conn.release();
    }
  };

  myTickets = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const [rows] = await pool.query(
        `SELECT r.*, e.title, e.date, e.location, e.banner_url, e.price
         FROM registrations r JOIN events e ON r.event_id = e.id
         WHERE r.user_id = ? ORDER BY r.created_at DESC`,
        [userId],
      );
      res.json({ message: "Berhasil mengambil tiket", data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil tiket" });
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID pendaftaran tidak valid" });
      }
      const [rows]: any = await pool.query(
        `SELECT r.*, e.title, e.date, e.location, e.banner_url, e.price, e.created_by
         FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.id = ? LIMIT 1`,
        [id],
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
      }
      const reg = rows[0];
      const requester = (req as any).user;
      if (reg.user_id !== requester.id && reg.created_by !== requester.id) {
        return res.status(403).json({ message: "Akses ditolak." });
      }
      res.json({ message: "Berhasil mengambil detail pendaftaran", data: reg });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil detail pendaftaran" });
    }
  };

  uploadPayment = async (req: Request, res: Response) => {
    let newPublicId: string | null = null;
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID pendaftaran tidak valid" });
      }
      if (!(req as any).file) {
        return res.status(400).json({ message: "Bukti pembayaran wajib diunggah" });
      }
      const [rows]: any = await pool.query("SELECT * FROM registrations WHERE id = ? LIMIT 1", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
      }
      const reg = rows[0];
      const requester = (req as any).user;
      if (reg.user_id !== requester.id) {
        return res.status(403).json({ message: "Akses ditolak. Bukan tiket milikmu." });
      }
      if (reg.status !== "pending") {
        return res.status(400).json({ message: "Bukti hanya bisa diunggah untuk status pending" });
      }

      const f = (req as any).file as Express.Multer.File;
      const uploaded = await uploadBufferToCloudinary(f.buffer, f.mimetype, "payments/proofs");
      newPublicId = uploaded.public_id;
      const oldPublicId = reg.payment_proof_public_id ?? null;

      await pool.query(
        "UPDATE registrations SET payment_proof_url = ?, payment_proof_public_id = ? WHERE id = ?",
        [uploaded.secure_url, uploaded.public_id, id],
      );
      if (oldPublicId) {
        try { await cloudinary.uploader.destroy(oldPublicId); } catch {}
      }
      res.json({ message: "Berhasil mengunggah bukti pembayaran", data: { id, payment_proof_url: uploaded.secure_url } });
    } catch (error) {
      if (newPublicId) {
        try { await cloudinary.uploader.destroy(newPublicId); } catch {}
      }
      console.error("ERROR UPLOAD PAYMENT:", error);
      res.status(500).json({ message: "Gagal mengunggah bukti pembayaran" });
    }
  };

  listByEvent = async (req: Request, res: Response) => {
    try {
      const eventId = Number(req.params.id);
      if (!Number.isSafeInteger(eventId) || eventId <= 0) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }
      const [events]: any = await pool.query("SELECT * FROM events WHERE id = ? LIMIT 1", [eventId]);
      if (events.length === 0) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      const requester = (req as any).user;
      if (events[0].created_by !== requester.id) {
        return res.status(403).json({ message: "Akses ditolak. Bukan event milikmu." });
      }
      const [rows] = await pool.query(
        `SELECT r.*, u.name AS user_name, u.email AS user_email
         FROM registrations r JOIN users u ON r.user_id = u.id
         WHERE r.event_id = ? ORDER BY r.created_at DESC`,
        [eventId],
      );
      res.json({ message: "Berhasil mengambil pendaftaran event", data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil pendaftaran event" });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    const conn = await pool.getConnection();
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID pendaftaran tidak valid" });
      }
      const validation = updateRegistrationStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Status tidak valid", error: validation.error.issues });
      }
      const { status } = validation.data;
      const requester = (req as any).user;

      await conn.beginTransaction();
      const [rows]: any = await conn.query(
        `SELECT r.*, e.created_by, e.quota FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.id = ? LIMIT 1 FOR UPDATE`,
        [id],
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
      }
      const reg = rows[0];

      if (requester.role === "organizer" || reg.created_by === requester.id) {
        if (reg.created_by !== requester.id && requester.role !== "organizer") {
          await conn.rollback();
          return res.status(403).json({ message: "Akses ditolak." });
        }
        if (reg.created_by !== requester.id) {
          await conn.rollback();
          return res.status(403).json({ message: "Akses ditolak. Bukan event milikmu." });
        }
      } else {
        if (reg.user_id !== requester.id || status !== "cancelled") {
          await conn.rollback();
          return res.status(403).json({ message: "Akses ditolak." });
        }
      }

      if (status === "approved") {
        if (requester.role !== "organizer" && reg.created_by !== requester.id) {
          await conn.rollback();
          return res.status(403).json({ message: "Hanya organizer yang bisa menyetujui." });
        }
        const [[{ approved }]]: any = await conn.query(
          "SELECT COUNT(*) AS approved FROM registrations WHERE event_id = ? AND status = 'approved' AND id != ?",
          [reg.event_id, id],
        );
        if (Number(approved) >= Number(reg.quota)) {
          await conn.rollback();
          return res.status(400).json({ message: "Kuota event sudah habis" });
        }
      }

      await conn.query("UPDATE registrations SET status = ? WHERE id = ?", [status, id]);
      await conn.commit();
      res.json({ message: "Berhasil mengubah status pendaftaran", data: { id, status } });
    } catch (error) {
      try { await conn.rollback(); } catch {}
      console.error("ERROR UPDATE STATUS:", error);
      res.status(500).json({ message: "Gagal mengubah status pendaftaran" });
    } finally {
      conn.release();
    }
  };
}

export default new RegistrationController();
