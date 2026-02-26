// lib/schemas/address.ts
import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  county: z.string().min(1),
  town: z.string().min(1),
  userId: z.string().cuid().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
