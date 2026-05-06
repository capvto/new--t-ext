import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { LocalArchiveView } from '@/components/notes/LocalArchiveView';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Notes'
};

export default function ArchivePage() {
  return (
    <AppShell>
      <LocalArchiveView />
    </AppShell>
  );
}
