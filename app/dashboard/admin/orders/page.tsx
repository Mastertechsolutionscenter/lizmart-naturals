import prisma from "@/lib/prisma";
import { currentUser, currentRole } from "@/lib/auth";
import { redirect } from "next/navigation";

import { OrdersClient } from "./components/client";

const OrdersPage = async () => {
  const user = await currentUser();
  const role = await currentRole();

  
  if (!user) {
    redirect("dashboard/login"); 
  }

  
  if (role !== "ADMIN") {
    redirect("/unauthorized"); 
  }
  const orders = await prisma.order.findMany({
    include: { user: true, items: true, payments: true, shippingAddress: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    userEmail: o.user?.email ?? "Guest",
    totalAmount: Number(o.totalAmount ?? 0),
    totalQuantity: o.totalQuantity,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    shippingAddress: o.shippingAddress
      ? {
          fullName: o.shippingAddress.fullName,
          county: o.shippingAddress.county,
        }
      : null,
  }));

  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Orders</h1>
      </div>
      <OrdersClient data={formattedOrders} />
    </div>
  );
};

export default OrdersPage;
