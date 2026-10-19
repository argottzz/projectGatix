import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(1),
  date: z.string().min(1).refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Tanggal tidak valid",
  }),
  location: z.string().min(1).max(255),
  price: z.coerce.number().min(0).default(0),
  quota: z.coerce.number().int().min(1),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
