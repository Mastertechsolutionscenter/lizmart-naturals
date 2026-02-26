// actions/api/get-health-topics.ts

import prisma from "@/lib/prisma";

import { ProductDTO, reshapeProduct } from "@/lib/server-helpers/reshapeProduct";

export type Product = ProductDTO;

// Type for the list view
export type HealthTopicListItem = {
  id: string;
  handle: string;
  title: string;
  descriptionSnippet: string;
};

// Type for the detail view
export type HealthTopicDetail = {
  id: string;
  handle: string;
  title: string;
  description: string; // Full markdown content
  seo?: { title: string | null; description: string | null } | null;
};

// --- Action 1: Get all topics for the list page ---
export async function getAllHealthTopics(): Promise<HealthTopicListItem[]> {
  const topics = await prisma.healthTopic.findMany({
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return topics.map(topic => {
    // Snippet: take the first 150 characters, then find the last space to avoid cutting a word.
    const rawText = topic.description.replace(/(\*\*|__|#|\n)/g, " ").trim();
    let snippet = rawText.substring(0, 150);
    if (rawText.length > 150) {
      snippet = snippet.substring(0, snippet.lastIndexOf(" ")) + "...";
    }

    return {
      id: topic.id,
      handle: topic.handle,
      title: topic.title,
      descriptionSnippet: snippet,
    };
  });
}

// --- Action 2: Get a single topic for the detail page ---
export async function getHealthTopicByHandle(handle: string): Promise<HealthTopicDetail | null> {
  const topic = await prisma.healthTopic.findUnique({
    where: { handle },
    select: {
      id: true,
      handle: true,
      title: true,
      description: true,
      seo: { select: { title: true, description: true } },
    },
  });

  if (!topic) return null;

  return {
    ...topic,
    seo: topic.seo,
  };
}

// --- Action 3: Get products related to a topic (by topic ID) ---
export type GetTopicProductsParams = {
  topicId: string;
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

export async function getProductsByTopicId({
  topicId,
  page = 1,
  perPage = 12,
}: GetTopicProductsParams): Promise<GetProductsResult> {
  const take = Math.max(1, Math.min(100, perPage));
  const skip = Math.max(0, (page - 1) * take);

  // 1. Get total count of linked products
  const total = await prisma.healthTopicProduct.count({
    where: { healthTopicId: topicId },
  });

  // 2. Fetch the linked product IDs in order
  const productLinks = await prisma.healthTopicProduct.findMany({
    where: { healthTopicId: topicId },
    select: { productId: true },
    orderBy: { order: "asc" }, // Use the 'order' field if present, fallback to default order
    skip,
    take,
  });

  const productIds = productLinks.map(link => link.productId);

  if (productIds.length === 0) {
    return {
      items: [],
      total: 0,
      page: 1,
      perPage: take,
      totalPages: 1,
    };
  }

  // 3. Fetch the actual product data
  const itemsRaw = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    include: {
      images: true,
      featuredImage: true,
      variants: true,
      seo: true,
    },
    // Order the results by the order of the productIds array (not possible directly in Prisma, but we'll map it)
  });

  const items: Product[] = itemsRaw
    .map(reshapeProduct)
    .filter(Boolean) as Product[];

  const totalPages = Math.max(1, Math.ceil(total / take));

  return {
    items,
    total,
    page,
    perPage: take,
    totalPages,
  };
}