import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(150),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  location: z.string().min(1, "Lokasi wajib diisi").max(255),
  price: z.number({ error: "Harga tidak valid" }).min(0, "Harga tidak valid"),
  quota: z.number({ error: "Kuota tidak valid" }).int().min(1, "Kuota minimal 1"),
});

export type EventInput = z.infer<typeof eventSchema>;
