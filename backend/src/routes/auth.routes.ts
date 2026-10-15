import { Router } from "express";
import rateLimit from "express-rate-limit";
import authController from "../controllers/auth.controller.ts";
import { verifyToken } from "../middlewares/auth.ts";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Terlalu banyak percobaan login, coba lagi nanti" },
});

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.get("/me", verifyToken, authController.me);
router.patch("/me", verifyToken, authController.updateMe);
router.post("/become-organizer", verifyToken, authController.becomeOrganizer);

export default router;
