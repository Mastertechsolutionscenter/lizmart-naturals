"use client";

import { useParams, useRouter } from "next/navigation";
import { LuPlus as Plus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dashboard/data-table";
import { Heading } from "@/components/ui/dashboard/heading";
import { Separator } from "@/components/ui/dashboard/separator";

import { FormattedOrder, columns } from "./columns";

interface OrderClientProps {
  data: FormattedOrder[];
}

export const OrdersClient: React.FC<OrderClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Orders (${data.length})`} description="Manage your orders" />
        <Button onClick={() => router.push(`/dashboard/admin/orders/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="orderNumber"  
        columns={columns}
        data={data}
      />
    </>
  );
};
