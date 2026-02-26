// lib/schemas/menu.ts
import { z } from "zod";

// Each menu item is { title, url } - adjust if you store more props
export const menuItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
});

export const createMenuSchema = z.object({
  handle: z.string().min(1),
  items: z.array(menuItemSchema),
});

export const updateMenuSchema = createMenuSchema.partial();

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
