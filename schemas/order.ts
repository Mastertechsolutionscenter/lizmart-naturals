// lib/schemas/order.ts
import { z } from "zod";

export const addressInputSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1),
  mpesaNumber: z.string().min(1),
  county: z.string().min(1),
  town: z.string().min(1),
  userId: z.string().cuid().optional(),
});

export const createOrderFromCartSchema = z.object({
  cartId: z.string().uuid(),
  userId: z.string().cuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  shippingAddressId: z.string().uuid().optional(),
  billingAddress: addressInputSchema.optional(),
  shippingAddress: addressInputSchema.optional(),
  paymentProvider: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

export const updateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "CONFIRMED",
      "CANCELLED",
      "FULFILLED",
      "SHIPPED",
      "DELIVERED",
      "RETURNED",
      "REFUNDED",
    ])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"])
    .optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

export const createPaymentSchema = z.object({
  provider: z.string().min(1),
  providerPaymentId: z.string().optional(),
  method: z.string().optional(),
  amount: z.union([z.string(), z.number()]),
  currency: z.string().min(1),
  status: z
    .enum(["PENDING", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"])
    .optional()
    .default("PENDING"),
  rawResponse: z.any().optional(),
});

export const createShipmentSchema = z.object({
  carrier: z.string().optional(),
  service: z.string().optional(),
  trackingNumber: z.string().optional(),
  costAmount: z.union([z.string(), z.number()]).optional(),
  costCurrency: z.string().optional(),
  status: z.string().optional(),
  shippedAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  shipmentAddress: z.any().optional(),
  trackingEvents: z.any().optional(),
});

export type CreateOrderFromCartInput = z.infer<typeof createOrderFromCartSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>
