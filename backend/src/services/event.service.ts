import cloudinary from "../config/cloudinary.ts";
import pool from "../db/index.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinary.ts";
import { toMysqlDatetime } from "../utils/datetime.ts";
import type { CreateEventInput } from "../validations/event.validation.ts";

export interface EventListFilters {
  search: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  sortBy: "date" | "price";
  order: "ASC" | "DESC";
  page: number;
  limit: number;
}

export interface CreateEventData extends Omit<CreateEventInput, "date"> {
  date: Date;
}

export interface UpdateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  quota: number;
  banner_url: string | null;
  banner_public_id: string | null;
}

export async function getEvents(filters: EventListFilters) {
  const { search, location, dateFrom, dateTo, sortBy, order, page, limit } =
    filters;
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

  return {
    rows: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventDetail(id: number) {
  const [rows]: any = await pool.query(
    `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email,
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('pending','approved')) AS taken
     FROM events e JOIN users u ON e.created_by = u.id
     WHERE e.id = ? LIMIT 1`,
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  const event = rows[0];

  return {
    ...event,
    available_quota: Math.max(0, event.quota - Number(event.taken)),
  };
}

export async function findEventById(id: number): Promise<any | null> {
  const [rows]: any = await pool.query(
    "SELECT * FROM events WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] ?? null;
}

export async function createEvent(
  data: CreateEventData,
  userId: number,
  file?: Express.Multer.File,
) {
  let uploadedPublicId: string | null = null;

  try {
    let banner_url: string | null = null;
    let banner_public_id: string | null = null;

    if (file) {
      const uploaded = await uploadBufferToCloudinary(
        file.buffer,
        file.mimetype,
        "events/banners",
      );
      banner_url = uploaded.secure_url;
      banner_public_id = uploaded.public_id;
      uploadedPublicId = banner_public_id;
    }

    const date = toMysqlDatetime(data.date);
    const price = data.price ?? 0;

    const [result]: any = await pool.query(
      `INSERT INTO events (title, description, date, location, banner_url, banner_public_id, price, quota, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        date,
        data.location,
        banner_url,
        banner_public_id,
        price,
        data.quota,
        userId,
      ],
    );

    return {
      id: result.insertId,
      title: data.title,
      description: data.description,
      date,
      location: data.location,
      banner_url,
      banner_public_id,
      price,
      quota: data.quota,
      created_by: userId,
    };
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId);
      } catch {}
    }
    throw error;
  }
}

export async function updateEvent(
  id: number,
  data: UpdateEventData,
  file?: Express.Multer.File,
) {
  let newPublicId: string | null = null;

  try {
    let banner_url = data.banner_url;
    let banner_public_id = data.banner_public_id;
    let oldPublicId: string | null = null;

    if (file) {
      const uploaded = await uploadBufferToCloudinary(
        file.buffer,
        file.mimetype,
        "events/banners",
      );
      banner_url = uploaded.secure_url;
      banner_public_id = uploaded.public_id;
      newPublicId = banner_public_id;
      oldPublicId = data.banner_public_id ?? null;
    }

    await pool.query(
      `UPDATE events SET title=?, description=?, date=?, location=?, banner_url=?, banner_public_id=?, price=?, quota=? WHERE id=?`,
      [
        data.title,
        data.description,
        data.date,
        data.location,
        banner_url,
        banner_public_id,
        data.price,
        data.quota,
        id,
      ],
    );

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch {}
    }

    return {
      id,
      title: data.title,
      banner_url,
      banner_public_id,
    };
  } catch (error) {
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch {}
    }
    throw error;
  }
}

export async function deleteEvent(
  id: number,
  bannerPublicId: string | null,
) {
  const [proofs]: any = await pool.query(
    "SELECT payment_proof_public_id FROM registrations WHERE event_id = ? AND payment_proof_public_id IS NOT NULL",
    [id],
  );

  if (bannerPublicId) {
    try {
      await cloudinary.uploader.destroy(bannerPublicId);
    } catch {}
  }

  for (const p of proofs) {
    try {
      await cloudinary.uploader.destroy(p.payment_proof_public_id);
    } catch {}
  }

  await pool.query("DELETE FROM registrations WHERE event_id = ?", [id]);
  await pool.query("DELETE FROM events WHERE id = ?", [id]);
}
