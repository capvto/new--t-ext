import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { AdminPanel } from '@/components/notes/AdminPanel';

export const metadata: Metadata = {
  title: 'Admin'
};

export default function AdminPage() {
  const enabled = Boolean(process.env.ADMIN_PASSWORD_HASH);

  return (
    <AppShell>
      <div className="min-h-screen px-5 py-8 md:px-8">
        <header className="mb-8 border-b border-[var(--color-border)] pb-6">
          <h1 className="font-content text-4xl font-normal text-[var(--color-text)]">Admin</h1>
          <p className="mt-2 max-w-xl font-ui text-xs leading-6 text-[var(--color-text-soft)]">
            Optional abuse response and export panel. It is disabled unless ADMIN_PASSWORD_HASH is set.
          </p>
        </header>
        {enabled ? (
          <AdminPanel />
        ) : (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] p-5 font-ui text-xs leading-6 text-[var(--color-text-soft)]">
            Admin is disabled on this instance.
          </div>
        )}
      </div>
    </AppShell>
  );
}
