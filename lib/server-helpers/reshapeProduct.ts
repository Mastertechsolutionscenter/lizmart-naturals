import type {
    Image as PrismaImage,
    Product as PrismaProduct,
    ProductVariant as PrismaProductVariant,
    SEO as PrismaSEO
} from "../../generated/prisma";

export type ProductDTO = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  availableForSale: boolean;
  tags: string[];
  price: number;
  currencyCode?: string;
  images: { id: string; src: string; alt?: string }[];
  featuredImage?: { id: string; src: string; alt?: string } | null;
  variants: {
    id: string;
    title: string;
    sku?: string | null;
    availableForSale: boolean;
    price?: number;
    priceCurrency?: string;
    selectedOptions?: any;
    createdAt?: Date;
    updatedAt?: Date | null;
  }[];
  seo?: { title?: string | null; description?: string | null } | null;
  createdAt?: Date;
  updatedAt?: Date | null;
};

/** Safely convert Prisma Decimal / string / number -> number */
function toNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof (value as any)?.toNumber === "function") {
    try {
      return (value as any).toNumber();
    } catch {}
  }
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

/** Map Prisma Image relation into a simpler shape */
function mapImage(
  i: Partial<PrismaImage> & { id?: string } | null | undefined,
  fallbackAlt?: string
) {
  if (!i || !i.id) return null;
  const src =
    (i as any).url ?? (i as any).src ?? (i as any).path ?? (i as any).publicUrl ?? "";
  const alt = (i as any).alt ?? (i as any).altText ?? fallbackAlt ?? undefined;
  return { id: i.id, src, alt };
}

/** Main reshaper */
export function reshapeProduct(
  p: PrismaProduct & {
    variants?: PrismaProductVariant[];
    images?: PrismaImage[];
    seo?: PrismaSEO | null;
  }
): ProductDTO | null {
  if (!p) return null;

  // Map all images
  const images = (p.images ?? [])
    .map((img) => mapImage(img, p.title))
    .filter(Boolean) as { id: string; src: string; alt?: string }[];

  // Use first image as featured if present
  const featuredImage = images.length > 0 ? images[0] : null;

  // Map variants
  const variants = (p.variants ?? []).map((v) => {
    const price = toNumber((v as any).priceAmount);
    return {
      id: v.id,
      title: v.title,
      sku: v.sku ?? null,
      availableForSale: v.availableForSale,
      price,
      priceCurrency: v.priceCurrency,
      selectedOptions: v.selectedOptions ?? null,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt ?? null
    };
  });

  // Pick display price
  let price: number | undefined;
  let currency: string | undefined;

  if (variants.length > 0) {
    const validPrices = variants
      .map((v) => v.price)
      .filter((n): n is number => typeof n === "number");
    if (validPrices.length > 0) {
      price = Math.min(...validPrices);
      currency = variants[0]?.priceCurrency;
    }
  }

  if (price === undefined && p.minVariantPriceAmount != null) {
    price = toNumber(p.minVariantPriceAmount);
    currency = p.minVariantPriceCurrency ?? currency;
  }

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description ?? null,
    descriptionHtml: p.descriptionHtml ?? null,
    availableForSale: Boolean(p.availableForSale),
    tags: p.tags ?? [],
    price: price ?? 0,
    currencyCode: currency ?? "USD",
    images,
    featuredImage,
    variants,
    seo: p.seo
      ? {
          title: (p.seo as any).title ?? null,
          description: (p.seo as any).description ?? null
        }
      : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? null
  };
}
