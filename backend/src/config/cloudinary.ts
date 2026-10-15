import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.ts";

const { cloudName, apiKey, apiSecret } = env.cloudinary;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Konfigurasi Cloudinary tidak lengkap");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
