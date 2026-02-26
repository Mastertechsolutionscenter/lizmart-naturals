import { currentRole, currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { ProductForm } from "./components/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: PageProps){
    const user = await currentUser();
    const role = await currentRole();
  
    
    if (!user) {
      redirect("dashboard/login"); 
    }
  
    
    if (role !== "ADMIN") {
      redirect("/unauthorized"); 
    }
  
  const { productId } = await params;
  
 const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    images: true,
    variants: true,
    featuredImage: true,
    seo: true,
    healthTopics: {
      include: {
        healthTopic: {
          select: {
            id: true,
            title: true
          }
        }
      }
    },
    CollectionProduct: {
      include: { collection: true }
    }
  }
});



const healthTopicsList = await prisma.healthTopic.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" }, }); 
const collections = await prisma.collection.findMany({ orderBy: { createdAt: "desc" }, }); 
const mappedHealthTopics = (product?.healthTopics ?? []).map(hp => ({ id: hp.healthTopic.id, title: hp.healthTopic.title, }));

    // Map CollectionProduct to the simpler { collectionId: string }[] structure
    const mappedCollections = product?.CollectionProduct
        ? product.CollectionProduct.map(cp => ({ collectionId: cp.collectionId }))
        : [];
        
    // Construct initialData explicitly to satisfy the ProductFormProps interface
    const initialData = product ? {
        ...product,
        // Replace Prisma's nested CollectionProduct with the required array of IDs
        CollectionProduct: mappedCollections, 
        // Use the flattened array for the form
        healthTopics: mappedHealthTopics,
        // Ensure images and variants are present, even if empty array
        images: product.images ?? [],
        variants: product.variants ?? [],
    } : null; // Pass null for a new product

return ( 
<div className="flex-col"> 
  <div className="flex-1 space-y-4 p-8 pt-6"> 
    <ProductForm collections={collections} initialData={initialData} healthTopics={healthTopicsList} /> 
    </div>
     </div> 
  );
}
