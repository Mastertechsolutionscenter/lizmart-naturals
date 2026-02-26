import { getCollection } from '@/lib/neondb';
import OpengraphImage from 'components/opengraph-image';

export default async function Image({
  params
}: {
  params: { collection: string };
}) {
  const collection = await getCollection(params.collection);
  const title = collection?.seo?.title || collection?.title;

  return await OpengraphImage({ title });
}
