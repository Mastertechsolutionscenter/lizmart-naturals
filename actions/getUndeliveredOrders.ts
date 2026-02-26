"use server";

import prisma from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export async function getOrdersByDate(selectedDate?: Date) {
  const date = selectedDate ? new Date(selectedDate) : new Date();
  const start = startOfDay(date);
  const end = endOfDay(date);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "CAPTURED",
      NOT: { status: "DELIVERED" },
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      shippingAddress: {
        select: {
          fullName: true,
          county: true,
        },
      },
      items: {
        take: 1,
        select: {
          productTitle: true,
          merchandiseSnapshot: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => ({
    ...order,
    totalAmount: order.totalAmount ? order.totalAmount.toNumber() : 0,
  }));
}
