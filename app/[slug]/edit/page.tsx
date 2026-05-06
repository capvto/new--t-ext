import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { EditNoteForm } from '@/components/notes/EditNoteForm';
import { findNoteBySlug } from '@/lib/db';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit /${slug}`
  };
}

export default async function EditPage({ params }: PageProps) {
  const { slug } = await params;
  const note = await findNoteBySlug(slug);
  if (!note) notFound();

  return (
    <AppShell>
      <EditNoteForm slug={slug} />
    </AppShell>
  );
}
