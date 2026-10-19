import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import eventRoutes from "./event.routes.ts";
import registrationRoutes from "./registration.routes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);

export default router;
