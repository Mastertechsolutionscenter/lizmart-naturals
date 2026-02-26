// components/OrdersList.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type OrderDTO = {
  id: string;
  orderNumber?: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: { fullName: string; county: string } | null;
  items: {
    productTitle?: string | null;
    merchandiseSnapshot?: any | null;
  }[];
  status?: string;
  paymentStatus?: string;
};

export default function OrdersList({ orders }: { orders: OrderDTO[] }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex flex-col gap-2">
        {orders.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4">No orders for this date.</div>
        ) : (
          orders.map((order) => {
           
            const firstItem = order.items[0];
let firstImage = "/placeholder.jpg";

if (firstItem?.merchandiseSnapshot) {
  const snap = firstItem.merchandiseSnapshot;

   if (
    snap.product &&
    Array.isArray(snap.product.images) &&
    snap.product.images.length > 0
  ) {
    firstImage = snap.product.images[0].url;
  }
  else if (Array.isArray(snap.images) && snap.images.length > 0) {
    firstImage = snap.images[0];
  }
  else if (typeof snap.image === "string") {
    firstImage = snap.image;
  }
  else if (snap.media && Array.isArray(snap.media) && snap.media.length > 0) {
    firstImage = snap.media[0];
  }
}

            const name = order.shippingAddress?.fullName ?? "Unknown";
            const county = order.shippingAddress?.county ?? "N/A";
            const total = Number(order.totalAmount ?? 0).toLocaleString("en-KE");

            return (
              <Card
                key={order.id}
                className="flex-row items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => router.push(`/dashboard/admin/orders/${order.id}`)}
              >
                <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                  <Image src={firstImage} alt={firstItem?.productTitle ?? "Product"} fill className="object-cover" />
                </div>

                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">{name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{county}</Badge>
                    <div className="text-xs text-muted-foreground">#{order.orderNumber ?? order.id}</div>
                  </div>
                </CardContent>

                <CardFooter className="p-0 text-sm font-semibold">KSH {total}</CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
