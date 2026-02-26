
import prisma from "@/lib/prisma";
import type { Collection as PrismaCollection } from "@/generated/prisma";

export type SEO = {
  title: string;
  description: string;
};

function normalizeSeo(seo: { title: string | null; description: string | null } | null | undefined): SEO {
  return {
    title: seo?.title ?? 'Shop',
    description: seo?.description ?? 'Purchase this high quality product' 
  };
}


export type NavCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  parentId?: string | null;
  gender?: string | null; 
  seo?: any;
  updatedAt?: string;
  path: string;
};

export async function getCollections(): Promise<NavCollection[]> {
  
  const cols = await prisma.collection.findMany({
    orderBy: { title: "asc" },
    include: { seo: true },
  });

  const mapped: NavCollection[] = cols.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description ?? null,
    parentId: c.parentId ?? null,
    gender: c.gender ?? "general",
    seo: c.seo ? c.seo : undefined,
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : undefined,
    path: `/search/${c.handle}`,
  }));

  
  return mapped.filter((c) => !c.handle.startsWith("hidden"));
}
