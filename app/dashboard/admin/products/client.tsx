"use client";

import { useParams, useRouter } from "next/navigation";
import { LuPlus as Plus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dashboard/data-table";
import { Heading } from "@/components/ui/dashboard/heading";
import { Separator } from "@/components/ui/dashboard/separator";


import { ProductColumn, columns } from "./columns";

interface ProductClientProps {
  data: ProductColumn[];
}

export const ProductsClient: React.FC<ProductClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Products (${data.length})`} description="Manage your products" />
        <Button onClick={() => router.push(`/dashboard/admin/products/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columns} data={data} />
      
      
    </>
  );
};