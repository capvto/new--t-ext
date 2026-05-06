import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';

export const metadata: Metadata = {
  title: 'Settings'
};

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl min-h-screen px-5 py-12 md:px-8">
        <header className="mb-8 border-b border-[var(--color-border)] pb-6">
          <h1 className="font-content text-4xl font-normal text-[var(--color-text)]">Settings</h1>
        </header>
        <AppearanceSettings />
      </div>
    </AppShell>
  );
}
