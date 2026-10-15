import cloudinary from "../config/cloudinary.ts";

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  const dataURI = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder,
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};
