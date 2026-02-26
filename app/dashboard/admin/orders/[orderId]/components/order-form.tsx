"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { LuCopy as CopyIcon, LuPrinter as PrintIcon, LuTrash2 as Trash } from "react-icons/lu";
import * as z from "zod";

import { Address, Order, OrderItem, Payment, Shipment } from "@/generated/prisma";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { isMerchandiseSnapshot, parseJsonField } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/dashboard/alert-modal";
import { Heading } from "@/components/ui/dashboard/heading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

/**
 * UX-focused order admin form
 *
 * - Read-only fields are shown as disabled inputs
 * - Order items are shown as visual cards (expandable)
 * - Admin may only update `status` and `notes`
 */

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "CONFIRMED",
  "CANCELLED",
  "FULFILLED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "REFUNDED",
] as const;

interface MerchandiseSnapshot {
  id: string;
  title?: string;
  product: {
    id: string;
    title?: string;
    handle?: string;
    images?: { id: string; url: string; altText?: string | null }[];
    featuredImage?: any;
  };
  selectedOptions?: { name: string; value: string }[];
  variant?: {
    title?: string;
    sku?: string;
  };
}


export const formSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  notes: z.string().nullable(),
});

export type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  initialData: Order & {
    shippingAddress: Address | null;
    items: OrderItem[];
    payments: Payment[];
    shipments: Shipment[];
  };
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: initialData.status,
      notes: initialData.notes ?? "",
    },
  });

  const currencyFormat = (value?: any) => {
    // Accept Decimal-like (toString) or number
    const n = value?.toString ? Number(value.toString()) : Number(value ?? 0);
    if (isNaN(n)) return "KES 0.00";
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: initialData.currency ?? "KES" }).format(n);
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/admin/orders/${params.orderId}`, data);
      router.refresh();
      toast.success("Order updated.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/orders/${params.orderId}`);
      router.refresh();
      router.push("/dashboard/admin/orders");
      toast.success("Order deleted.");
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const copyOrderNumber = async () => {
    await navigator.clipboard.writeText(initialData.orderNumber);
    toast.success("Order number copied");
  };

  const printOrder = () => {
    window.print();
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />

      {/* Header: Order title + quick actions */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <Heading title={`Order ${initialData.orderNumber}`} description={`Placed ${new Date(initialData.createdAt).toLocaleString()}`} />
          <div className="mt-2 text-sm text-muted-foreground">Order ID: <span className="font-mono">{initialData.id}</span></div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyOrderNumber} aria-label="Copy order number">
            <CopyIcon className="mr-2" /> Copy
          </Button>
          <Button size="sm" variant="outline" onClick={printOrder} aria-label="Print order">
            <PrintIcon className="mr-2" /> Print
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setOpen(true)}>
            <Trash className="mr-2" /> Cancel / Delete
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Top grid: Shipping (left) + Order summary (right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shipping card */}
            <section className="col-span-2 bg-card p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Shipping & Customer</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Recipient</label>
                  <Input disabled value={initialData.shippingAddress?.fullName ?? "—"} />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                  <Input disabled value={initialData.shippingAddress?.phone ?? "—"} />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Email</label>
                  <Input disabled value={initialData.shippingAddress?.email ?? "—"} />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">County</label>
                  <Input disabled value={initialData.shippingAddress?.county ?? "—"} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Town / Address</label>
                  <Input disabled value={initialData.shippingAddress?.town ?? "—"} />
                </div>
              </div>
            </section>

            {/* Summary card */}
            <aside className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{currencyFormat(initialData.subtotalAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">{currencyFormat(initialData.shippingAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium">{currencyFormat(initialData.taxAmount)}</dd>
                </div>

                <div className="border-t pt-2 mt-2 flex justify-between">
                  <dt className="text-sm">Total</dt>
                  <dd className="text-lg font-semibold">{currencyFormat(initialData.totalAmount)}</dd>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Payment</dt>
                    <dd className="font-medium">{initialData.paymentStatus}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Items</dt>
                    <dd className="font-medium">{initialData.totalQuantity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Placed</dt>
                    <dd className="font-medium">{new Date(initialData.createdAt).toLocaleString()}</dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>

          <Separator />

          {/* Order items — visual, expandable, organized */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Order Items.</h3>
            <div className="space-y-4">
              {initialData.items.map((item) => {
                const unit = currencyFormat(item.unitPriceAmount);
                const line = currencyFormat(item.lineTotalAmount);

                 // normalize the raw json fields
  const rawSnapshot = parseJsonField(item.merchandiseSnapshot);
  const rawSelected = parseJsonField(item.selectedOptions ?? rawSnapshot?.selectedOptions);

  // narrow to MerchandiseSnapshot if possible
  const snapshot = isMerchandiseSnapshot(rawSnapshot) ? (rawSnapshot as MerchandiseSnapshot) : null;

  // derive values with fallbacks (safe)
  const productTitle = item.productTitle ?? snapshot?.product?.title ?? "Product";
  const variantTitle = item.variantTitle ?? snapshot?.variant?.title ?? "";
  const sku = item.sku ?? snapshot?.variant?.sku ?? "";

  // selected options may be object/array/string — keep flexible for rendering
  const selectedOptions = rawSelected ?? null;
  const imageUrl =
    snapshot?.product?.images?.[0]?.url ?? "/placeholder.png";

                return (
                  <article key={item.id} className="bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* optional thumbnail - show placeholder if none */}
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        
                         <Image alt={productTitle} src={imageUrl} width={80} height={80} className="object-cover" />
                        </div>

                        <div>
                          <div className="text-sm font-medium">{productTitle}</div>
                          {variantTitle && <div className="text-xs text-muted-foreground">{variantTitle}</div>}
                          {item.sku && <div className="text-xs text-muted-foreground mt-1">SKU:  {item.sku}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-sm text-muted-foreground text-center">
                          <div className="text-xs">Unit</div>
                          <div className="font-medium">{unit}</div>
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                          <div className="text-xs">Qty</div>
                          <div className="font-medium">{item.quantity}</div>
                        </div>

                        <div className="text-sm text-muted-foreground text-center">
                          <div className="text-xs">Line total</div>
                          <div className="font-medium">{line}</div>
                        </div>
                      </div>
                    </div>

                    {/* expandable details for options / snapshot */}
                    <details className="mt-3">
                      <summary className="text-xs text-muted-foreground cursor-pointer">View details</summary>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Selected options</div>
                          <pre className="whitespace-pre-wrap text-xs mt-1 bg-gray-50 p-2 rounded">{JSON.stringify(selectedOptions ?? {}, null, 2)}</pre>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Merchandise snapshot</div>
                          <pre className="whitespace-pre-wrap text-xs mt-1 bg-gray-50 p-2 rounded">{JSON.stringify(item.merchandiseSnapshot ?? {}, null, 2)}</pre>
                        </div>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Editable area: status + notes */}
          <section className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Update order (admins)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
             <FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <FormControl>
        <Select
          value={field.value}
          onValueChange={field.onChange}
          defaultValue={field.value}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                        <Textarea
          {...field}
          value={field.value ?? ""}
          placeholder="Private notes for this order (visible to admins)"
        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                Save changes
              </Button>
            </div>
          </section>
        </form>
      </Form>
    </>
  );
};

export default OrderForm;
