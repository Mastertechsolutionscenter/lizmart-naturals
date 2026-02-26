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

export type CollectionColumn = {
  id: string;
  title: string;
  handle: string;
  productCount: number;
  createdAt: string;
};

export const columns: ColumnDef<CollectionColumn>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/admin/health-topics/${row.original.id}`}
        className="font-medium text-blue-600"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "handle",
    header: "Handle",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.handle}</div>,
  },
  {
    accessorKey: "productCount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Products
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.productCount}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => <div>{new Date(row.original.createdAt).toLocaleString()}</div>,
  },
  {
    id: "actions",
    header: "Actions",
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

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
            Copy Topic ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={`/dashboard/admin/health-topics/${row.original.id}`}>View / Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
