import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="text-shell">
      <Header />
      <main className="text-main">{children}</main>
    </div>
  );
}
