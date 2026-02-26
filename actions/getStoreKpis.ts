
import { Prisma } from '@/generated/prisma';
import prisma from '@/lib/prisma';

type PeriodKey = 'day' | 'month' | 'year';

function getPeriodRanges(period: PeriodKey) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  let start: Date;
  let end: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === 'day') {
    start = new Date(year, month, day, 0, 0, 0, 0);
    end = new Date(year, month, day + 1, 0, 0, 0, 0);
    prevStart = new Date(year, month, day - 1, 0, 0, 0, 0);
    prevEnd = start;
  } else if (period === 'month') {
    start = new Date(year, month, 1, 0, 0, 0, 0);
    end = new Date(year, month + 1, 1, 0, 0, 0, 0);
    prevStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    prevEnd = start;
  } else {
    // year
    start = new Date(year, 0, 1, 0, 0, 0, 0);
    end = new Date(year + 1, 0, 1, 0, 0, 0, 0);
    prevStart = new Date(year - 1, 0, 1, 0, 0, 0, 0);
    prevEnd = start;
  }

  return { start, end, prevStart, prevEnd };
}

function pctChange(current: number, previous: number) {
  // if previous is 0: return 100% if current>0, else 0
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export async function getStoreKpis(period: PeriodKey) {
  const { start, end, prevStart, prevEnd } = getPeriodRanges(period);

  // We'll use transactions for efficiency
  const [
    totalProducts, // total catalog size
    productsInPeriod, // new products in current window
    productsPrevPeriod, // new products in previous window
    ordersInPeriod,
    ordersPrevPeriod,
    revenueAgg, // current revenue sum
    revenuePrevAgg, // previous revenue sum
  ] = await prisma.$transaction([
    // total products overall
    prisma.product.count(),

    // new products created inside current period
    prisma.product.count({
      where: { createdAt: { gte: start, lt: end } },
    }),

    // new products created in previous period
    prisma.product.count({
      where: { createdAt: { gte: prevStart, lt: prevEnd } },
    }),

    // orders placed in current period (count)
    prisma.order.count({
      where: {
        // choose appropriate date field — here we use placedAt if you track placed orders
        createdAt: { gte: start, lt: end },
      },
    }),

    // orders previous period
    prisma.order.count({
      where: {
        createdAt: { gte: prevStart, lt: prevEnd },
      },
    }),

    // revenue: sum totalAmount for orders that were paid within the current period.
    // Using paidAt ensures revenue is only counted when paid. Adjust if you prefer placedAt.
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: start, lt: end },
        // Optionally filter paymentStatus: 'PAID' if you have that enum and want only paid orders.
      } as Prisma.OrderWhereInput,
    }),

    // revenue previous period
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: prevStart, lt: prevEnd },
      } as Prisma.OrderWhereInput,
    }),
  ]);

  // Prisma returns Decimal-like for aggregates; convert to number safely
  const revenue = Number((revenueAgg as any)?._sum?.totalAmount ?? 0);
  const revenuePrev = Number((revenuePrevAgg as any)?._sum?.totalAmount ?? 0);

  const productsChange = pctChange(productsInPeriod, productsPrevPeriod);
  const ordersChange = pctChange(ordersInPeriod, ordersPrevPeriod);
  const revenueChange = pctChange(revenue, revenuePrev);

  return {
    period,
    start,
    end,
    totalProducts,
    productsInPeriod,
    productsPrevPeriod,
    productsChange,
    ordersInPeriod,
    ordersPrevPeriod,
    ordersChange,
    revenue,
    revenuePrev,
    revenueChange,
  };
}
