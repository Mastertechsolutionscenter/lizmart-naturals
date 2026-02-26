// lib/schemas/page.ts
import { z } from "zod";

export const createPageSchema = z.object({
  title: z.string().min(1),
  handle: z.string().min(1),
  body: z.string().optional(),
  bodySummary: z.string().optional(),
  seoId: z.string().uuid().optional(),
});

export const updatePageSchema = createPageSchema.partial();

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
