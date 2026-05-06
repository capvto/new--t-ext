'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@/components/ui/Dialog';

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="mt-4 mb-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-ui text-[11px] sm:text-[12px] text-[var(--color-text-soft)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hover:text-[var(--color-text)] transition-colors"
        >
          v 2.0.0
        </button>
        <span className="opacity-50">•</span>
        <Link href="/cookies" className="hover:text-[var(--color-text)] transition-colors">
          Cookies
        </Link>
        <span className="opacity-50 hidden sm:inline">•</span>
        <div>
          Developed by{' '}
          <a
            href="https://matteocaputo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-text)] transition-colors font-medium"
          >
            Matteo Caputo
          </a>
        </div>
      </footer>
      
      <Dialog open={open} onClose={() => setOpen(false)} title="Changelog (v 2.0.0)">
        <div className="space-y-4 text-[14px] text-[var(--color-text)] font-ui leading-relaxed">
          <p>Welcome to <strong>(t)ext 2.0.0</strong>!</p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-soft)]">
            <li><strong>Complete Redesign:</strong> New minimal interface with centered editor panes and fluid spacing.</li>
            <li><strong>Fluid Animations:</strong> Smooth Framer Motion transitions in the navigation bar.</li>
            <li><strong>Autosave Capabilities:</strong> Local storage drafts for new notes and debounced server autosave for existing notes.</li>
            <li><strong>Import/Export:</strong> Quickly load from or save to .md files directly from the toolbar.</li>
            <li><strong>Theming:</strong> Refined dark and light themes for an elevated writing experience.</li>
          </ul>
        </div>
      </Dialog>
    </>
  );
}
