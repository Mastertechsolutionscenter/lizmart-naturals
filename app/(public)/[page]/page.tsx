import type { Metadata } from 'next';

import { getPage } from '@/lib/neondb';
import Prose from 'components/prose';
import { notFound } from 'next/navigation';



export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
   
  // if (params.page.startsWith('dashboard')) {
  //   return {};
  // }

   const handle = params.page;

  if (shouldSkip(handle)) return {};


  const page = await getPage(params.page);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: 'article'
    }
  };
}



export default async function Page(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;

  // if (params.page.startsWith('dashboard')) {
  //   return null;
  // }
  
   const handle = params.page;

  // ✅ Skip rendering entirely for dashboard/static files
  if (shouldSkip(handle)) return null;

  
  const page = await getPage(params.page);

  if (!page) return notFound();

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body} />
      <p className="text-sm italic">
        {`This document was last updated on ${new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(page.updatedAt))}.`}
      </p>
    </>
  );
}


function shouldSkip(handle: string) {
  return (
    handle.startsWith('dashboard') ||
    handle.endsWith('.svg') ||
    handle.endsWith('.ico') ||
    handle.endsWith('.png') ||
    handle.endsWith('.jpg') ||
    handle.endsWith('.jpeg') ||
    handle.endsWith('.webp')
  );
}