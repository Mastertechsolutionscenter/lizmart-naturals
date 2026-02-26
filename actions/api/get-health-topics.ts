import prisma from "@/lib/prisma";


export type NavHealthTopic = {
  id: string;
  handle: string;
  title: string;
};

/**
 * Fetches all Health Topics from the database for use in the navigation bar.
 * The data is ordered alphabetically by title.
 * @returns {Promise<NavHealthTopic[]>} An array of simplified health topic objects.
 */
export async function getHealthTopics(): Promise<NavHealthTopic[]> {
  try {
    const topics = await prisma.healthTopic.findMany({
      select: {
        id: true,
        title: true,
        handle: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    // The shape of the result already matches NavHealthTopic, so a simple return works.
    return topics;
  } catch (error) {
    console.error("Failed to fetch health topics:", error);
    // Return an empty array on failure to prevent the application from breaking
    return [];
  }
}