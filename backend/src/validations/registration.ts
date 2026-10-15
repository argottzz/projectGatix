import { z } from "zod";

export const createRegistrationSchema = z.object({
  event_id: z.coerce.number().int().positive(),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(["approved", "cancelled"]),
});
