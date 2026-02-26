// app/collections/page.tsx
import prisma from "@/lib/prisma";
import { Metadata } from "next";

import { FormattedCollection } from "@/schemas/collection";
import { CollectionsClient } from "./client";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function CollectionsPage() {
  const collections = await prisma.collection.findMany({
    include: {
      products: {
        include: {
          product: {
            include: { images: true, variants: true, featuredImage: true },
          },
        },
        take: 1, 
      },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted: FormattedCollection[] = collections.map((c) => {
    const firstCP = c.products?.[0]?.product;
    const image = firstCP?.images?.[0]?.url ?? firstCP?.featuredImage?.url ?? null;
    return {
      id: c.id,
      title: c.title,
      handle: c.handle,
      productCount: c._count?.products ?? 0,
      image,
      createdAt: c.createdAt.toISOString(),
    };
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <p className="text-sm text-muted-foreground">Manage product collections</p>
      </div>

      <CollectionsClient data={formatted} />
    </div>
  );
}
