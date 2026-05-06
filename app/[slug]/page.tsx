import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findNoteBySlug, incrementViews, noteToPublic } from '@/lib/db';
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
  return {
    title: note.title || `/${note.slug}`,
    description: `Developed by Matteo Caputo. Reading /${note.slug} on (t)ext.`
  };
}

export default async function PublicNotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = await findNoteBySlug(slug);
  if (!note) notFound();

  await incrementViews(slug);

  return <NoteArticle note={noteToPublic({ ...note, views: note.views + 1 })} />;
}
