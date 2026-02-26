// app/orders/[orderId]/page.tsx
import { Order } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { OrderForm } from "./components/order-form";

export const metadata: Metadata = {
  title: "Order",
};

interface PageProps {
  params: Promise<{ orderId: string }>;
}


export default async function OrderPage({ params }: PageProps){
 
  const { orderId } = await params;
 
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
      shipments: true,
      shippingAddress: true,
    },
  });

    return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* OrderForm expects the full Order with included relations */}
        <OrderForm initialData={order as Order & {
          shippingAddress: any;
          items: any[];
          payments: any[];
          shipments: any[];
        }} />
      </div>
    </div>
  );
}
