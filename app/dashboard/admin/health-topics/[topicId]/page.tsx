// app/dashboard/admin/health-topics/[topicId]/page.tsx
import prisma from "@/lib/prisma";
import { TopicForm } from "./components/topic-form";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function HealthTopicPage({ params }: PageProps) {
  const { topicId } = await params;

  const topic = await prisma.healthTopic.findUnique({
    where: { id: topicId },
    include: {
      relatedProducts: {
        include: { product: { select: { id: true, title: true } } },
        orderBy: { order: "asc" },
      },
      seo: true,
    },
  });

  const allProducts = await prisma.product.findMany({
    select: { id: true, title: true, handle: true },
    orderBy: { title: "asc" },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TopicForm
          initialData={topic ?? null}
          allProducts={allProducts}
        />
      </div>
    </div>
  );
}
