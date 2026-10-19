import type { Request, Response } from "express";
import { findEventById } from "../services/event.service.ts";
import {
  createRegistration,
  findRegistrationById,
  getRegistrationDetail,
  getRegistrationsByEvent,
  getTicketsByUser,
  updateRegistrationStatus,
  uploadPaymentProof,
} from "../services/registration.service.ts";
import type { AuthenticatedRequest } from "../types/auth.ts";
import { parseId } from "../utils/parseId.ts";
import {
  createRegistrationSchema,
  updateRegistrationStatusSchema,
} from "../validations/registration.validation.ts";

class RegistrationController {
  create = async (req: Request, res: Response) => {
    try {
      const validation = createRegistrationSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Data tidak valid",
          error: validation.error.issues,
        });
      }

      const userId = (req as AuthenticatedRequest).user.id;
      const result = await createRegistration(
        validation.data.event_id,
        userId,
      );

      if (result.type === "event_not_found") {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      if (result.type === "already_registered") {
        return res
          .status(400)
          .json({ message: "Kamu sudah terdaftar di event ini" });
      }

      if (result.type === "quota_full") {
        return res.status(400).json({ message: "Kuota event sudah habis" });
      }

      if (result.type === "reactivated") {
        return res.status(200).json({
          message: "Pendaftaran diaktifkan kembali",
          data: result.data,
        });
      }

      res.status(201).json({
        message: "Berhasil mendaftar event",
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR CREATE REGISTRATION:", error);
      res.status(500).json({ message: "Gagal mendaftar event" });
    }
  };

  myTickets = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const tickets = await getTicketsByUser(userId);

      res.json({ message: "Berhasil mengambil tiket", data: tickets });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil tiket" });
    }
  };

  detail = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res
          .status(400)
          .json({ message: "ID pendaftaran tidak valid" });
      }

      const registration = await getRegistrationDetail(id);

      if (!registration) {
        return res
          .status(404)
          .json({ message: "Pendaftaran tidak ditemukan" });
      }

      const requester = (req as AuthenticatedRequest).user;

      if (
        registration.user_id !== requester.id &&
        registration.created_by !== requester.id
      ) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      res.json({
        message: "Berhasil mengambil detail pendaftaran",
        data: registration,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil detail pendaftaran" });
    }
  };

  uploadPayment = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res
          .status(400)
          .json({ message: "ID pendaftaran tidak valid" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Bukti pembayaran wajib diunggah" });
      }

      const registration = await findRegistrationById(id);

      if (!registration) {
        return res
          .status(404)
          .json({ message: "Pendaftaran tidak ditemukan" });
      }

      const requester = (req as AuthenticatedRequest).user;

      if (registration.user_id !== requester.id) {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Bukan tiket milikmu." });
      }

      if (registration.status !== "pending") {
        return res.status(400).json({
          message: "Bukti hanya bisa diunggah untuk status pending",
        });
      }

      const paymentProofUrl = await uploadPaymentProof(
        id,
        registration,
        req.file,
      );

      res.json({
        message: "Berhasil mengunggah bukti pembayaran",
        data: { id, payment_proof_url: paymentProofUrl },
      });
    } catch (error) {
      console.error("ERROR UPLOAD PAYMENT:", error);
      res.status(500).json({ message: "Gagal mengunggah bukti pembayaran" });
    }
  };

  listByEvent = async (req: Request, res: Response) => {
    try {
      const eventId = parseId(req.params.id);

      if (eventId === null) {
        return res.status(400).json({ message: "ID event tidak valid" });
      }

      const event = await findEventById(eventId);

      if (!event) {
        return res.status(404).json({ message: "Event tidak ditemukan" });
      }

      const requester = (req as AuthenticatedRequest).user;

      if (event.created_by !== requester.id) {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      const registrations = await getRegistrationsByEvent(eventId);

      res.json({
        message: "Berhasil mengambil pendaftaran event",
        data: registrations,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Gagal mengambil pendaftaran event" });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === null) {
        return res
          .status(400)
          .json({ message: "ID pendaftaran tidak valid" });
      }

      const validation = updateRegistrationStatusSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Status tidak valid",
          error: validation.error.issues,
        });
      }

      const requester = (req as AuthenticatedRequest).user;
      const result = await updateRegistrationStatus(
        id,
        validation.data.status,
        requester,
      );

      if (result.type === "not_found") {
        return res
          .status(404)
          .json({ message: "Pendaftaran tidak ditemukan" });
      }

      if (result.type === "forbidden_owner") {
        return res
          .status(403)
          .json({ message: "Akses ditolak. Bukan event milikmu." });
      }

      if (result.type === "forbidden") {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      if (result.type === "quota_full") {
        return res.status(400).json({ message: "Kuota event sudah habis" });
      }

      res.json({
        message: "Berhasil mengubah status pendaftaran",
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR UPDATE STATUS:", error);
      res
        .status(500)
        .json({ message: "Gagal mengubah status pendaftaran" });
    }
  };
}

export default new RegistrationController();
