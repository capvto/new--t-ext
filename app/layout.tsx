import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppearanceBoot } from '@/components/settings/AppearanceSettings';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '(t)ext',
    template: '%s | (t)ext'
  },
  description: 'A minimal self-hosted Markdown publishing app.',
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    siteName: '(t)ext',
    type: 'website',
    locale: 'en_US'
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
