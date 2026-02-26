// actions/getCollectionSales.ts
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getCollectionSales = unstable_cache(async () => {
  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      title: true,
      products: {
        select: {
          product: {
            select: {
              variants: {
                select: {
                  OrderItem: {
                    select: { quantity: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const result = collections.map(col => {
    let totalSold = 0;
    col.products.forEach(cp => {
      cp.product.variants.forEach(v => {
        v.OrderItem.forEach(item => {
          totalSold += item.quantity;
        });
      });
    });

    return { title: col.title, sold: totalSold };
  });

  return result;
}, ["collection-sales"], { revalidate: 60 * 60 * 8 }); // 8 hours cache
