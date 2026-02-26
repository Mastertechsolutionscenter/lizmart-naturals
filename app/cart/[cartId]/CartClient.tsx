"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Cart } from "@/lib/neondb/types";
import Image from "next/image";

import AddressForm from "./AddressForm";

interface CartClientProps {
  cart?: Cart;
  userId?: string | null;
}

export default function CartClient({ cart, userId }: CartClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showAddressForm, setShowAddressForm] = useState(false);

  const WHATSAPP_PHONE_NUMBER =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254703919844";

  const removeAll = async () => {};

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment completed.");
      removeAll();
    }

    if (searchParams.get("canceled")) {
      toast.error("Something went wrong.");
    }
  }, [searchParams]);

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const handleWhatsappOrder = () => {
    if (!cart) return;

    const orderItems = cart.lines
      .map((line) => {
        const title = line.merchandise.product.title;
        const options = line.merchandise.selectedOptions
          ?.map((opt) => `${opt.name}: ${opt.value}`)
          .join(", ");

        const quantity = line.quantity;
        const price = `${line.cost.totalAmount.amount} ${line.cost.totalAmount.currencyCode}`;

        return `- ${title}${options ? ` (${options})` : ""} x ${quantity} (${price})`;
      })
      .join("\n");

    const total = `${cart.cost.totalAmount.amount} ${cart.cost.totalAmount.currencyCode}`;

    const rawMessage = `Hello, I'd like to place an order!

*My Cart Details:*
${orderItems}

*Total Amount:* ${total}

*Please send me a payment link / details.*`;

    const encodedMessage = encodeURIComponent(rawMessage);

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Your Cart</h1>

        {cart.lines.map((line, idx) => (
          <Card key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            <CardContent className="flex-1 flex gap-4">
              {line.merchandise.product.images?.[0] && (
                <Image
                  src={line.merchandise.product.images[0].url}
                  alt={line.merchandise.product.title}
                  width={100}
                  height={100}
                  className="rounded object-cover"
                />
              )}

              <div className="flex-1 flex flex-col space-y-1">
                <div className="font-medium text-lg">
                  {line.merchandise.product.title}
                </div>

                {line.merchandise.selectedOptions?.map((opt) => (
                  <div key={opt.name} className="text-sm text-muted-foreground">
                    {opt.name}: {opt.value}
                  </div>
                ))}

                <div className="mt-2 text-sm text-muted-foreground">
                  Quantity: {line.quantity}
                </div>
              </div>
            </CardContent>

            <div className="p-4 sm:ml-4 font-semibold text-lg">
              {line.cost.totalAmount.amount} {line.cost.totalAmount.currencyCode}
            </div>
          </Card>
        ))}
      </div>

      <div className="w-full max-w-md space-y-8">

        {!showAddressForm ? (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Order Summary</h2>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {cart.cost.subtotalAmount.amount}{" "}
                  {cart.cost.subtotalAmount.currencyCode}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {cart.cost.totalAmount.amount}{" "}
                  {cart.cost.totalAmount.currencyCode}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">

              <Button
                className="w-full"
                onClick={() => {
                  if (!userId) {
                    toast.error("Please log in to continue checkout.");
                    router.push("/dashboard/login");
                    return;
                  }

                  setShowAddressForm(true);
                }}
              >
                Enter Address & Pay
              </Button>

              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={handleWhatsappOrder}
              >
                Order via WhatsApp
              </Button>

            </CardFooter>
          </Card>
        ) : null}

      </div>
    </div>
  );
}
