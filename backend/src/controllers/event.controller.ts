import type { Request, Response } from "express";
import {
  createEvent,
  deleteEvent,
  findEventById,
  getEventDetail,
  getEvents,
  updateEvent,
  type UpdateEventData,
} from "../services/event.service.ts";
import type { AuthenticatedRequest } from "../types/auth.ts";
import { toMysqlDatetime } from "../utils/datetime.ts";
import { parseId } from "../utils/parseId.ts";
import {
  createEventSchema,
  updateEventSchema,
} from "../validations/event.validation.ts";

class EventController {
  list = async (req: Request, res: Response) => {
    try {
      const search =
        typeof req.query.search === "string" ? req.query.search.trim() : "";
      const location =
        typeof req.query.location === "string"
          ? req.query.location.trim()
          : "";
      const dateFrom =
        typeof req.query.date_from === "string" ? req.query.date_from : "";
      const dateTo =
        typeof req.query.date_to === "string" ? req.query.date_to : "";
      const sortBy = req.query.sort_by === "price" ? "price" : "date";
      const order = req.query.order === "asc" ? "ASC" : "DESC";
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

      const result = await getEvents({
        search,
        location,
        dateFrom,
        dateTo,
        sortBy,
        order,
        page,
        limit,
      });

      res.json({
        message: "Berhasil mengambil data event",
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("ERROR LIST EVENT:", error);
      res.status(500).json({ message: "Gagal mengambil data event" });
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }

      const event = await getEventDetail(id);

      if (!event) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      res.json({
        message: "Berhasil mengambil detail event",
        data: event,
      });
    } catch (error) {
      console.error("ERROR DETAIL EVENT:", error);
      res.status(500).json({ message: "Gagal mengambil detail event" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validation = createEventSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const date = new Date(validation.data.date);

      if (date.getTime() < Date.now() - 60_000) {
        return res
          .status(400)
          .json({ message: "Tanggal event tidak boleh kurang dari hari ini" });
      }

      const userId = (req as AuthenticatedRequest).user.id;
      const event = await createEvent(
        { ...validation.data, date },
        userId,
        req.file,
      );

      res.status(201).json({
        message: "Berhasil menambahkan event",
        data: event,
      });
    } catch (error) {
      console.error("ERROR CREATE EVENT:", error);
      res.status(500).json({ message: "Gagal menambahkan event" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }

      const validation = updateEventSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const existing = await findEventById(id);

      if (!existing) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      const requester = (req as AuthenticatedRequest).user;

      if (existing.created_by !== requester.id) {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      const merged = { ...existing, ...validation.data };
      let date = existing.date;

      if (validation.data.date) {
        const d = new Date(validation.data.date);

        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ message: "Tanggal tidak valid" });
        }
        if (d.getTime() < Date.now() - 60_000) {
          return res
            .status(400)
            .json({ message: "Tanggal event harus di masa depan" });
        }

        date = toMysqlDatetime(d);
      }

      if (Number(merged.price) < 0) {
        return res.status(400).json({ message: "Harga tidak valid" });
      }

      if (!Number.isInteger(Number(merged.quota)) || Number(merged.quota) < 1) {
        return res.status(400).json({ message: "Kuota tidak valid" });
      }

      const data: UpdateEventData = {
        title: merged.title,
        description: merged.description,
        date,
        location: merged.location,
        price: merged.price,
        quota: merged.quota,
        banner_url: existing.banner_url,
        banner_public_id: existing.banner_public_id,
      };

      const event = await updateEvent(id, data, req.file);

      res.json({ message: "Berhasil mengubah event", data: event });
    } catch (error) {
      console.error("ERROR UPDATE EVENT:", error);
      res.status(500).json({ message: "Gagal mengubah event" });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }

      const existing = await findEventById(id);

      if (!existing) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      const requester = (req as AuthenticatedRequest).user;

      if (existing.created_by !== requester.id) {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      await deleteEvent(id, existing.banner_public_id ?? null);

      res.json({ message: "Berhasil menghapus event" });
    } catch (error) {
      console.error("ERROR DELETE EVENT:", error);
      res.status(500).json({ message: "Gagal menghapus event" });
    }
  };
}

export default new EventController();
