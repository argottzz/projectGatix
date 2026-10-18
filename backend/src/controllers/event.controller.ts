import type { Request, Response } from "express";
import pool from "../config/database.ts";
import cloudinary from "../config/cloudinary.ts";
import { createEventSchema, updateEventSchema } from "../validations/event.ts";
import { uploadBufferToCloudinary } from "../utils/upload.ts";

function toMysqlDatetime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export class EventController {
  list = async (req: Request, res: Response) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const location = typeof req.query.location === "string" ? req.query.location.trim() : "";
      const dateFrom = typeof req.query.date_from === "string" ? req.query.date_from : "";
      const dateTo = typeof req.query.date_to === "string" ? req.query.date_to : "";
      const sortBy = req.query.sort_by === "price" ? "price" : "date";
      const order = req.query.order === "asc" ? "ASC" : "DESC";
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
      const offset = (page - 1) * limit;

      const where: string[] = [];
      const params: any[] = [];

      if (search) {
        where.push("(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)");
        const like = `%${search}%`;
        params.push(like, like, like);
      }
      if (location) {
        where.push("e.location LIKE ?");
        params.push(`%${location}%`);
      }
      if (dateFrom && !Number.isNaN(Date.parse(dateFrom))) {
        where.push("e.date >= ?");
        params.push(toMysqlDatetime(new Date(dateFrom)));
      }
      if (dateTo && !Number.isNaN(Date.parse(dateTo))) {
        where.push("e.date <= ?");
        params.push(toMysqlDatetime(new Date(dateTo)));
      }

      const whereSql = where.length > 0 ? "WHERE " + where.join(" AND ") : "";
      const [[{ total }]]: any = await pool.query(
        `SELECT COUNT(*) AS total FROM events e ${whereSql}`,
        params,
      );

      const [rows]: any = await pool.query(
        `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email,
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('pending','approved')) AS taken
         FROM events e JOIN users u ON e.created_by = u.id
         ${whereSql} ORDER BY e.${sortBy} ${order} LIMIT ${limit} OFFSET ${offset}`,
        params,
      );

      const data = rows.map((e: any) => ({
        ...e,
        available_quota: Math.max(0, e.quota - Number(e.taken)),
      }));

      res.json({
        message: "Berhasil mengambil data event",
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error("ERROR LIST EVENT:", error);
      res.status(500).json({ message: "Gagal mengambil data event" });
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }
      const [rows]: any = await pool.query(
        `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email,
          (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('pending','approved')) AS taken
         FROM events e JOIN users u ON e.created_by = u.id
         WHERE e.id = ? LIMIT 1`,
        [id],
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      const event = rows[0];
      res.json({
        message: "Berhasil mengambil detail event",
        data: { ...event, available_quota: Math.max(0, event.quota - Number(event.taken)) },
      });
    } catch (error) {
      console.error("ERROR DETAIL EVENT:", error);
      res.status(500).json({ message: "Gagal mengambil detail event" });
    }
  };

  create = async (req: Request, res: Response) => {
    let uploadedPublicId: string | null = null;
    try {
      const validation = createEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Data tidak valid", error: validation.error.issues });
      }
      const { title, description, location, price, quota } = validation.data;
      const date = new Date(validation.data.date);
      if (date.getTime() < Date.now() - 60_000) {
        return res.status(400).json({ message: "Tanggal event harus di masa depan" });
      }

      let banner_url: string | null = null;
      let banner_public_id: string | null = null;
      if ((req as any).file) {
        const f = (req as any).file as Express.Multer.File;
        const uploaded = await uploadBufferToCloudinary(f.buffer, f.mimetype, "events/banners");
        banner_url = uploaded.secure_url;
        banner_public_id = uploaded.public_id;
        uploadedPublicId = banner_public_id;
      }

      const userId = (req as any).user.id;
      const [result]: any = await pool.query(
        `INSERT INTO events (title, description, date, location, banner_url, banner_public_id, price, quota, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, toMysqlDatetime(date), location, banner_url, banner_public_id, price ?? 0, quota, userId],
      );

      res.status(201).json({
        message: "Berhasil menambahkan event",
        data: { id: result.insertId, title, description, date: toMysqlDatetime(date), location, banner_url, banner_public_id, price: price ?? 0, quota, created_by: userId },
      });
    } catch (error) {
      if (uploadedPublicId) {
        try { await cloudinary.uploader.destroy(uploadedPublicId); } catch {}
      }
      console.error("ERROR CREATE EVENT:", error);
      res.status(500).json({ message: "Gagal menambahkan event" });
    }
  };

  update = async (req: Request, res: Response) => {
    let newPublicId: string | null = null;
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }
      const validation = updateEventSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Data tidak valid", error: validation.error.issues });
      }
      const [existing]: any = await pool.query("SELECT * FROM events WHERE id = ? LIMIT 1", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      const requester = (req as any).user;
      if (existing[0].created_by !== requester.id) {
        return res.status(403).json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      const merged = { ...existing[0], ...validation.data };
      if (validation.data.date) {
        const d = new Date(validation.data.date as string);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ message: "Tanggal tidak valid" });
        }
        if (d.getTime() < Date.now() - 60_000) {
          return res.status(400).json({ message: "Tanggal event harus di masa depan" });
        }
        (merged as any).date = toMysqlDatetime(d);
      } else {
        (merged as any).date = existing[0].date;
      }
      if (Number(merged.price) < 0) {
        return res.status(400).json({ message: "Harga tidak valid" });
      }
      if (!Number.isInteger(Number(merged.quota)) || Number(merged.quota) < 1) {
        return res.status(400).json({ message: "Kuota tidak valid" });
      }

      let banner_url = existing[0].banner_url;
      let banner_public_id = existing[0].banner_public_id;
      let oldPublicId: string | null = null;
      if ((req as any).file) {
        const f = (req as any).file as Express.Multer.File;
        const uploaded = await uploadBufferToCloudinary(f.buffer, f.mimetype, "events/banners");
        banner_url = uploaded.secure_url;
        banner_public_id = uploaded.public_id;
        newPublicId = banner_public_id;
        oldPublicId = existing[0].banner_public_id ?? null;
      }

      await pool.query(
        `UPDATE events SET title=?, description=?, date=?, location=?, banner_url=?, banner_public_id=?, price=?, quota=? WHERE id=?`,
        [merged.title, merged.description, (merged as any).date, merged.location, banner_url, banner_public_id, merged.price, merged.quota, id],
      );

      if (oldPublicId) {
        try { await cloudinary.uploader.destroy(oldPublicId); } catch {}
      }

      res.json({ message: "Berhasil mengubah event", data: { id, title: merged.title, banner_url, banner_public_id } });
    } catch (error) {
      if (newPublicId) {
        try { await cloudinary.uploader.destroy(newPublicId); } catch {}
      }
      console.error("ERROR UPDATE EVENT:", error);
      res.status(500).json({ message: "Gagal mengubah event" });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }
      const [existing]: any = await pool.query("SELECT * FROM events WHERE id = ? LIMIT 1", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }
      const requester = (req as any).user;
      if (existing[0].created_by !== requester.id) {
        return res.status(403).json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      const [proofs]: any = await pool.query(
        "SELECT payment_proof_public_id FROM registrations WHERE event_id = ? AND payment_proof_public_id IS NOT NULL",
        [id],
      );
      if (existing[0].banner_public_id) {
        try { await cloudinary.uploader.destroy(existing[0].banner_public_id); } catch {}
      }
      for (const p of proofs) {
        try { await cloudinary.uploader.destroy(p.payment_proof_public_id); } catch {}
      }
      await pool.query("DELETE FROM registrations WHERE event_id = ?", [id]);
      await pool.query("DELETE FROM events WHERE id = ?", [id]);

      res.json({ message: "Berhasil menghapus event" });
    } catch (error) {
      console.error("ERROR DELETE EVENT:", error);
      res.status(500).json({ message: "Gagal menghapus event" });
    }
  };
}

export default new EventController();
