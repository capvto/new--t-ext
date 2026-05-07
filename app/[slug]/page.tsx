import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findNoteBySlug, incrementViews, noteToPublic } from '@/lib/db';
import { markdownExcerpt } from '@/lib/seo';
import { NoteArticle } from '@/components/notes/NoteArticle';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await findNoteBySlug(slug);
  if (!note) return { title: 'Not found' };

  const title = note.title || `/${note.slug}`;
  const description = markdownExcerpt(note.content_markdown);

  return {
    title,
    description,
    alternates: { canonical: `/${note.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: note.created_at,
      modifiedTime: note.updated_at,
      url: `/${note.slug}`
    }
  };
}

export default async function PublicNotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = await findNoteBySlug(slug);
  if (!note) notFound();

  await incrementViews(slug);

  const title = note.title || `/${note.slug}`;
  const description = markdownExcerpt(note.content_markdown);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: note.created_at,
    dateModified: note.updated_at,
    url: `/${note.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NoteArticle note={noteToPublic({ ...note, views: note.views + 1 })} />
    </>
  );
}
