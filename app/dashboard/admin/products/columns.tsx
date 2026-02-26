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
import Image from "next/image";
import Link from "next/link";

// columns.tsx
export type FormattedProduct = {
  id: string;
  title: string;
  image: string | null;
  price: number;
  inStock: boolean;
  collections: string[];
  createdAt: string; // we converted Date -> string
};

export type ProductColumn = {
  id: string;
  image: string | null; // could be null, so we handle fallback
  title: string;
  price: number;
  inStock: boolean;
  collections: string[]; // array because you are joining them in the cell
  createdAt: string;
};

export const columns: ColumnDef<FormattedProduct>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-10 h-10 relative">
        <Image
          src={row.original.image ?? "/placeholder.png"}
          alt={row.original.title}
          fill
          className="rounded-md object-cover"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <>KES {row.original.price.toLocaleString()}</>,
  },
  {
    accessorKey: "inStock",
    header: "Stock",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${
          row.original.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {row.original.inStock ? "In Stock" : "Out of Stock"}
      </span>
    ),
  },
  {
    accessorKey: "collections",
    header: "Collections",
    cell: ({ row }) =>
      row.original.collections.length > 0
        ? row.original.collections.join(", ")
        : "—",
  },
    {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
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
            Copy Product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/admin/products/${row.original.id}`}>View Product</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
