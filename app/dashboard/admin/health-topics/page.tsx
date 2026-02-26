// app/collections/page.tsx
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { FormattedCollection } from "@/schemas/collection";
import { CollectionsClient } from "./client";

export const metadata: Metadata = {
  title: "Health Topics",
};

export default async function CollectionsPage() {
  const topics = await prisma.healthTopic.findMany({
    include: {
      relatedProducts: {
        include: {
          product: {
            include: { images: true, variants: true, featuredImage: true },
          },
        },
        take: 1,
      },
      _count: { select: { relatedProducts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted: FormattedCollection[] = topics.map((t) => {
    const firstProduct = t.relatedProducts?.[0]?.product;
    const image =
      firstProduct?.images?.[0]?.url ?? firstProduct?.featuredImage?.url ?? null;

    return {
      id: t.id,
      title: t.title,
      handle: t.handle,
      productCount: t._count?.relatedProducts ?? 0,
      image,
      createdAt: t.createdAt.toISOString(),
    };
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Health Topics</h1>
        <p className="text-sm text-muted-foreground">Manage Health Topics</p>
      </div>

      <CollectionsClient data={formatted} />
    </div>
  );
}
