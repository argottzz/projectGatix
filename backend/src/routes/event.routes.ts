import { Router } from "express";
import eventController from "../controllers/event.controller.ts";
import registrationController from "../controllers/registration.controller.ts";
import { verifyToken } from "../middlewares/auth.ts";
import { requireRole } from "../middlewares/role.ts";
import upload from "../middlewares/upload.ts";

const router = Router();

router.get("/", eventController.list);
router.get("/:id", eventController.detail);
router.post("/", verifyToken, requireRole("organizer"), upload.single("banner"), eventController.create);
router.patch("/:id", verifyToken, requireRole("organizer"), upload.single("banner"), eventController.update);
router.delete("/:id", verifyToken, requireRole("organizer"), eventController.remove);

router.get("/:id/registrations", verifyToken, requireRole("organizer"), registrationController.listByEvent);

export default router;
