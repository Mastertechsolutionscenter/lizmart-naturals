// app/health-need/page.tsx (Server Component)

import { getAllHealthTopics, HealthTopicListItem } from "@/actions/api/get-health-topic";
import Footer from "@/components/layout/footer";
import { Heading } from "@/components/ui/dashboard/heading";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata = {
  title: "Shop By Health Need",
  description: "Browse products tailored to specific health goals and concerns.",
};

// UI/UX Consideration: Use a clean, card-based layout for easy scanning.
function TopicCard({ topic }: { topic: HealthTopicListItem }) {
  return (
    <div className="border rounded-lg p-6 flex flex-col justify-between bg-white hover:shadow-md transition duration-200">
      <div>
        <h2 className="text-xl font-semibold text-teal-700 mb-2">{topic.title}</h2>
        <p className="text-gray-600 text-sm mb-4">{topic.descriptionSnippet}</p>
      </div>
      <Link
        href={`/health-need/${topic.handle}`}
        className="text-indigo-600 font-medium text-sm hover:underline self-start"
      >
        Learn More →
      </Link>
    </div>
  );
}

export default async function HealthNeedPage() {
  const topics = await getAllHealthTopics();

  return (
    <div className="w-screen">
    <div className="max-w-screen-xl mx-auto py-10 px-4 md:px-6">
      <Heading 
        title="Shop by Health Need" 
        description="Find expertly curated products for your specific wellness goals." 
      />
      <Separator className="my-6" />

      {topics.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No health topics are currently available. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
 </div>
 <Footer />
    </div>
  );
}