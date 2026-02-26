// lib/schemas/product.ts
import { z } from "zod";

// Utility function to handle empty strings, null, or undefined inputs
const coerceToString = (value: unknown): string | null => {
    if (value === "" || value === null || value === undefined) {
        return null;
    }
    return String(value);
};

export const variantSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Variant title is required"),
    availableForSale: z.boolean().default(true),
    selectedOptions: z.any().optional(),
    // Ensures that the priceAmount is always a string or null before validation
    priceAmount: z.preprocess(coerceToString, z.string().nullable().optional()),
    priceCurrency: z.string().min(1, "Currency is required"),
    sku: z.string().optional(),
});

export const imageSchema = z.object({
    id: z.string().optional(),
    url: z.string().url("Must be a valid URL"),
    altText: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
});

export const createProductSchema = z.object({
    handle: z.string().min(1, "Product handle is required"),
    title: z.string().min(1, "Product title is required"),
    description: z.string().nullable().optional(),
    descriptionHtml: z.string().nullable().optional(),
    availableForSale: z.boolean().default(true),
    options: z.any().optional(),
    minVariantPriceAmount: z.number().int().nullable(),
    minVariantPriceCurrency: z.string().optional(),
    maxVariantPriceAmount: z.number().int().nullable(),
    maxVariantPriceCurrency: z.string().optional(),
    featuredImageId: z.string().uuid().nullable().optional(),
    tags: z.array(z.string()).default([]),
    seoId: z.string().uuid().nullable().optional(),
    variants: z.array(variantSchema).default([]),
    images: z.array(imageSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;