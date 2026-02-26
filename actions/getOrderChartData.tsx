
import { OrderStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function getOrderChartData() {
  const orders = await prisma.order.findMany({
    select: {
      createdAt: true,
      status: true,
      totalAmount: true,
    },
  });

    const grouped = orders.reduce((acc, order) => {
    const month = order.createdAt.toLocaleString("default", { month: "long" });
    if (!acc[month]) {
      acc[month] = { month, total: 0, successful: 0 };
    }

    // Convert Decimal or null to number safely
    const amount = order.totalAmount ? +order.totalAmount.toString() : 0;

    acc[month].total += amount;
    
if (order.status === OrderStatus.DELIVERED) {
  acc[month].successful += amount;
}
    return acc;
  }, {} as Record<string, { month: string; total: number; successful: number }>);

  return Object.values(grouped);
}
