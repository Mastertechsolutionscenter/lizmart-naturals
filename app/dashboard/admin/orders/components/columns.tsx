"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export type FormattedOrder = {
  id: string;
  orderNumber: string;
  shippingAddress?: {
    fullName: string | null;
    county: string | null;
  } | null;
  totalAmount: number;
  paymentStatus: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED";
  createdAt: string; // ISO string
};

export const columns: ColumnDef<FormattedOrder>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => <span>{row.original.orderNumber}</span>,
  },
  {
    accessorKey: "shippingAddress.fullName",
    header: "Customer",
    cell: ({ row }) => row.original.shippingAddress?.fullName ?? "—",
  },
  {
    accessorKey: "shippingAddress.county",
    header: "County",
    cell: ({ row }) => row.original.shippingAddress?.county ?? "—",
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <>KES {row.original.totalAmount.toLocaleString()}</>,
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      const statusClasses = status === "PENDING"
        ? "bg-yellow-100 text-yellow-800"
        : status === "CAPTURED"
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800";

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusClasses}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Placed At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
   {
    header: "More",
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.original.id)}
          >
            Copy Order ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/admin/orders/${row.original.id}`}>View Order</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
