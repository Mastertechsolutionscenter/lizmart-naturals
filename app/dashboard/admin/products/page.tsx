import { currentUser, currentRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";


import { ProductsClient } from "./client";


const ProductsPage = async () => {
    const user = await currentUser();
    const role = await currentRole();
  
    
    if (!user) {
      redirect("dashboard/login"); 
    }
  
    
    if (role !== "ADMIN") {
      redirect("/unauthorized"); 
    }

const products = await prisma.product.findMany({
  include: {
    variants: true,
    images: true,
    CollectionProduct: {
      include: { collection: true },
    },
  },
  orderBy: { createdAt: "desc" },
});

const formattedProducts = products.map((p) => ({
  id: p.id,
  title: p.title,
  image: p.images[0]?.url ?? null,
  price: Number(p.variants[0]?.priceAmount ?? 0),
  inStock: p.variants.some((v) => v.availableForSale),
  collections: p.CollectionProduct.map((c) => c.collection.title),
  createdAt: p.createdAt.toISOString(),
}));



  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Products</h1>
      </div>
      <ProductsClient data={formattedProducts} />
    </div>
  );
};

export default ProductsPage;
