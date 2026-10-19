import { Router } from "express";
import registrationController from "../controllers/registration.controller.ts";
import { verifyToken } from "../middlewares/auth.middleware.ts";
import upload from "../middlewares/upload.middleware.ts";

const router = Router();

router.post("/", verifyToken, registrationController.create);
router.get("/my-tickets", verifyToken, registrationController.myTickets);
router.get("/:id", verifyToken, registrationController.detail);
router.patch("/:id/payment", verifyToken, upload.single("payment_proof"), registrationController.uploadPayment);
router.patch("/:id/status", verifyToken, registrationController.updateStatus);

export default router;
