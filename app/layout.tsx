import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppearanceBoot } from '@/components/settings/AppearanceSettings';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export const metadata: Metadata = {
  title: {
    default: '(t)ext',
    template: '%s | (t)ext'
  },
  description: 'A minimal self-hosted Markdown publishing app.',
  icons: {
    icon: '/favicon.svg'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#131313'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ScrollToTop />
        <AppearanceBoot />
        {children}
      </body>
    </html>
  );
}
