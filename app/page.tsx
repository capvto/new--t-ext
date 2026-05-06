import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PublishForm } from '@/components/notes/PublishForm';

export default function HomePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center font-ui text-sm text-[var(--color-text-faint)]">Loading editor...</div>}>
        <PublishForm />
      </Suspense>
    </AppShell>
  );
}
