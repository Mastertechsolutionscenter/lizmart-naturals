import prisma from "../../lib/prisma";
import { reshapeProduct } from "../../lib/server-helpers/reshapeProduct";

export type ProductLite = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyCode?: string;
  images?: any[];
  featuredImage?: any;
  variants?: any[];
  seo?: any;
  createdAt?: Date;
 
};

/**
 * Fetch up to `limit` products that belong to any collection matching `collectionHandle`.
 * Matching logic:
 *  - collection.handle === collectionHandle (exact)
 *  - collection.handle contains collectionHandle (substring)
 *  - collection.title contains collectionHandle (case-insensitive)
 *
 * This intentionally ignores parentId and gender — it returns products from all matching collections.
 */
export async function getProductsByCollection({
  collectionHandle,
  limit = 8,
}: {
  collectionHandle: string;
  limit?: number;
}): Promise<ProductLite[]> {
  if (!collectionHandle || typeof collectionHandle !== "string") return [];

  const normalized = collectionHandle.trim().toLowerCase();

  // 1) Find all collections whose handle/title match the requested handle (flexible)
  const collections = await prisma.collection.findMany({
  where: {
    OR: [
      { handle: normalized },
      { title: { equals: normalized, mode: "insensitive" } },
    ],
  },
  select: { id: true },
});


  if (!collections || collections.length === 0) {
    // no matching collections -> nothing to return
    return [];
  }

  const collectionIds = collections.map((c) => c.id);

  // 2) Query products that belong to any of those collections.
  //    We include images, featuredImage, variants, seo — same as your other queries.
  //    Order by createdAt desc (newest first) and take up to `limit`.
  const take = Math.max(1, Math.min(100, limit)); // clamp limit reasonably

  const productsRaw = await prisma.product.findMany({
    where: {
      // product must be linked to at least one of the matched collections
      CollectionProduct: {
        some: {
          collectionId: { in: collectionIds },
        },
      },
      // optional: only available products; remove if you want all
      availableForSale: true,
    },
    include: {
      images: true,
      featuredImage: true,
      variants: true,
      seo: true,
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  // 3) Map to UI shape (use your existing helper)
  const products = productsRaw.map((p) => reshapeProduct(p)).filter(Boolean) as ProductLite[];

  return products;
}
