import { Payment } from "@/app/dashboard/admin/payments/columns";
import prisma from "@/lib/prisma";

export const getData = async (): Promise<Payment[]> => {
  const callbacks = await prisma.stkCallback.findMany({
    include: {
      callbackMetadata: true,
      order: {
        include: {
          shippingAddress: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  
    const data: Payment[] = callbacks.flatMap((cb) =>
    cb.order.map((o) => ({
      id: o.id,
      amount: cb.callbackMetadata?.amount
        ? Number(cb.callbackMetadata.amount)
        : Number(o.totalAmount ?? 0),
      status: o.paymentStatus as Payment["status"],
      fullName: o.shippingAddress?.fullName ?? "N/A",
      userId: o.userId ?? "N/A",
      email: o.shippingAddress?.email ?? "N/A",
    }))
  );

  return data;
};
