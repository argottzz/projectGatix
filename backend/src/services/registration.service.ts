import cloudinary from "../config/cloudinary.ts";
import pool from "../db/index.ts";
import type { AuthUser } from "../types/auth.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinary.ts";
import type { UpdateRegistrationStatusInput } from "../validations/registration.validation.ts";

export type CreateRegistrationResult =
  | { type: "event_not_found" }
  | { type: "already_registered" }
  | { type: "quota_full" }
  | {
      type: "reactivated";
      data: { id: number; event_id: number; status: string };
    }
  | { type: "created"; data: { id: number; event_id: number; status: string } };

export type UpdateStatusResult =
  | { type: "not_found" }
  | { type: "forbidden_owner" }
  | { type: "forbidden" }
  | { type: "quota_full" }
  | { type: "success"; data: { id: number; status: string } };

export async function createRegistration(
  eventId: number,
  userId: number,
): Promise<CreateRegistrationResult> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [events]: any = await conn.query(
      "SELECT * FROM events WHERE id = ? LIMIT 1 FOR UPDATE",
      [eventId],
    );

    if (events.length === 0) {
      await conn.rollback();
      return { type: "event_not_found" };
    }

    const event = events[0];

    const [existing]: any = await conn.query(
      "SELECT * FROM registrations WHERE event_id = ? AND user_id = ? LIMIT 1",
      [eventId, userId],
    );

    if (existing.length > 0 && existing[0].status !== "cancelled") {
      await conn.rollback();
      return { type: "already_registered" };
    }

    const [[{ taken }]]: any = await conn.query(
      "SELECT COUNT(*) AS taken FROM registrations WHERE event_id = ? AND status IN ('pending','approved')",
      [eventId],
    );

    if (Number(taken) >= Number(event.quota)) {
      await conn.rollback();
      return { type: "quota_full" };
    }

    const status = Number(event.price) === 0 ? "approved" : "pending";

    if (existing.length > 0 && existing[0].status === "cancelled") {
      await conn.query("UPDATE registrations SET status = ? WHERE id = ?", [
        status,
        existing[0].id,
      ]);
      await conn.commit();

      return {
        type: "reactivated",
        data: { id: existing[0].id, event_id: eventId, status },
      };
    }

    const [result]: any = await conn.query(
      "INSERT INTO registrations (event_id, user_id, status) VALUES (?, ?, ?)",
      [eventId, userId, status],
    );
    await conn.commit();

    return {
      type: "created",
      data: { id: result.insertId, event_id: eventId, status },
    };
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    throw error;
  } finally {
    conn.release();
  }
}

export async function getTicketsByUser(userId: number) {
  const [rows] = await pool.query(
    `SELECT r.*, e.title, e.date, e.location, e.banner_url, e.price
     FROM registrations r JOIN events e ON r.event_id = e.id
     WHERE r.user_id = ? ORDER BY r.created_at DESC`,
    [userId],
  );

  return rows;
}

export async function getRegistrationDetail(id: number) {
  const [rows]: any = await pool.query(
    `SELECT r.*, e.title, e.date, e.location, e.banner_url, e.price, e.created_by
     FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.id = ? LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
}

export async function findRegistrationById(
  id: number,
): Promise<any | null> {
  const [rows]: any = await pool.query(
    "SELECT * FROM registrations WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] ?? null;
}

export async function uploadPaymentProof(
  id: number,
  registration: any,
  file: Express.Multer.File,
) {
  let newPublicId: string | null = null;

  try {
    const uploaded = await uploadBufferToCloudinary(
      file.buffer,
      file.mimetype,
      "payments/proofs",
    );
    newPublicId = uploaded.public_id;
    const oldPublicId = registration.payment_proof_public_id ?? null;

    await pool.query(
      "UPDATE registrations SET payment_proof_url = ?, payment_proof_public_id = ? WHERE id = ?",
      [uploaded.secure_url, uploaded.public_id, id],
    );

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch {}
    }

    return uploaded.secure_url;
  } catch (error) {
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch {}
    }
    throw error;
  }
}

export async function getRegistrationsByEvent(eventId: number) {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM registrations r JOIN users u ON r.user_id = u.id
     WHERE r.event_id = ? ORDER BY r.created_at DESC`,
    [eventId],
  );

  return rows;
}

export async function updateRegistrationStatus(
  id: number,
  status: UpdateRegistrationStatusInput["status"],
  requester: AuthUser,
): Promise<UpdateStatusResult> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      `SELECT r.*, e.created_by, e.quota FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.id = ? LIMIT 1 FOR UPDATE`,
      [id],
    );

    if (rows.length === 0) {
      await conn.rollback();
      return { type: "not_found" };
    }

    const reg = rows[0];
    const isEventOwner = reg.created_by === requester.id;
    const isOrganizer = requester.role === "organizer";

    // Hanya pemilik event yang boleh mengubah status bebas.
    // User biasa hanya boleh membatalkan tiket miliknya sendiri.
    if (!isEventOwner && isOrganizer) {
      await conn.rollback();
      return { type: "forbidden_owner" };
    }

    if (!isEventOwner && !isOrganizer) {
      if (reg.user_id !== requester.id || status !== "cancelled") {
        await conn.rollback();
        return { type: "forbidden" };
      }
    }

    if (status === "approved") {
      const [[{ approved }]]: any = await conn.query(
        "SELECT COUNT(*) AS approved FROM registrations WHERE event_id = ? AND status = 'approved' AND id != ?",
        [reg.event_id, id],
      );

      if (Number(approved) >= Number(reg.quota)) {
        await conn.rollback();
        return { type: "quota_full" };
      }
    }

    await conn.query("UPDATE registrations SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    await conn.commit();

    return { type: "success", data: { id, status } };
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    throw error;
  } finally {
    conn.release();
  }
}
