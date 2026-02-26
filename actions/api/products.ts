// lib/products.ts
import prisma from "../../lib/prisma";
import { reshapeProduct } from "../../lib/server-helpers/reshapeProduct"; // if you already have this helper
// If reshapeProduct doesn't exist, create a simple mapper that converts Prisma model to Product shape.

export type Product = {
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

export type GetProductsParams = {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  page?: number;
  perPage?: number;
};

export type GetProductsResult = {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function getProducts({
  query,
  reverse = false,
  sortKey,
  page = 1,
  perPage = 12
}: GetProductsParams): Promise<GetProductsResult> {
  const where: any = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } }
    ];
  }

  // Default ordering: newest first (createdAt desc)
  const orderBy: any = {};
  if (sortKey) {
    // if user provided a sort key, use it; fallback to createdAt
    orderBy[sortKey] = reverse ? "asc" : "desc";
  } else {
    orderBy["createdAt"] = reverse ? "asc" : "desc";
  }

  const take = Math.max(1, Math.min(100, perPage || 12)); // clamp perPage (1..100)
  const skip = Math.max(0, (page - 1) * take);

  // get total count for pagination
  const total = await prisma.product.count({ where });

  const itemsRaw = await prisma.product.findMany({
    where,
    include: {
      images: true,
      featuredImage: true,
      variants: true,
      seo: true
    },
    orderBy,
    skip,
    take
  });

  const items = itemsRaw.map(reshapeProduct).filter(Boolean) as Product[];

  const totalPages = Math.max(1, Math.ceil(total / take));

  return {
    items,
    total,
    page,
    perPage: take,
    totalPages
  };
}
