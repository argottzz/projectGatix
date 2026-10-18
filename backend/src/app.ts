import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import authRoutes from "./routes/auth.routes.ts";
import eventRoutes from "./routes/event.routes.ts";
import registrationRoutes from "./routes/registration.routes.ts";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/registrations", registrationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message ?? "Upload gagal" });
    }
    next();
  },
);

export default app;
