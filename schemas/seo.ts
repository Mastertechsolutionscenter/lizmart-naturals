// lib/schemas/seo.ts
import { z } from "zod";

export const createSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export const updateSeoSchema = createSeoSchema.partial();

export type CreateSeoInput = z.infer<typeof createSeoSchema>;
export type UpdateSeoInput = z.infer<typeof updateSeoSchema>;
