import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedExt = new Set([".jpg", ".jpeg", ".png"]);
const allowedMime = new Set(["image/jpeg", "image/png"]);

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.has(ext) || !allowedMime.has(file.mimetype)) {
      cb(new Error("Hanya file jpg, jpeg, png yang diperbolehkan"));
      return;
    }
    cb(null, true);
  },
});

export default upload;
