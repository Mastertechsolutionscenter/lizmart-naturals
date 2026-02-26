"use client";

import { useParams, useRouter } from "next/navigation";
import { LuPlus as Plus } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/dashboard/data-table";
import { Heading } from "@/components/ui/dashboard/heading";
import { Separator } from "@/components/ui/dashboard/separator";


import { CollectionColumn, columns } from "./columns";

interface CollectionClientProps {
  data: CollectionColumn[];
}

export const CollectionsClient: React.FC<CollectionClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Collections (${data.length})`} description="Manage collections for your products" />
        <Button onClick={() => router.push(`/dashboard/admin/collections/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="title" columns={columns} data={data} />
      
      
    </>
  );
};