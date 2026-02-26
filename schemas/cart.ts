// lib/schemas/cart.ts
import { z } from "zod";

export const createCartSchema = z.object({
  userId: z.string().cuid().optional(), // optional link to a user
  checkoutUrl: z.string().url().optional(),
});

export const addCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0), // 0 -> remove
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
