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
          v 2.0.2
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

      <Dialog open={open} onClose={() => setOpen(false)} title="Changelog">
        <div className="space-y-5 text-[13px] leading-relaxed" style={{ fontFamily: 'var(--font-family-ui)' }}>

          <div>
            <div className="mono-label mb-2.5">v 2.0.2</div>
            <ul className="space-y-2 text-[var(--color-text-soft)]">
              <li><span className="text-[var(--color-text)] font-medium">Automatic Table of Contents.</span> A sidebar TOC appears automatically in the preview and on published notes whenever a document contains 2 or more headings.</li>
            </ul>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <div className="mono-label mb-2.5">v 2.0.1</div>
            <ul className="space-y-2 text-[var(--color-text-soft)]">
              <li><span className="text-[var(--color-text)] font-medium">Advanced Markdown.</span> Emoji shortcodes, callout blocks, custom heading IDs, inline table of contents.</li>
              <li><span className="text-[var(--color-text)] font-medium">CodeMirror Editor.</span> Native Markdown syntax highlighting, full undo/redo history, line wrapping.</li>
              <li><span className="text-[var(--color-text)] font-medium">Toolbar.</span> Image and Alert buttons. Clean insertion without placeholder text.</li>
              <li><span className="text-[var(--color-text)] font-medium">Advanced Code Blocks.</span> Filename, language badge, line numbers, line highlighting, colour variants, diff styling.</li>
              <li><span className="text-[var(--color-text)] font-medium">Safe Links & Images.</span> Protocol-less URLs normalised to https://. Dangerous protocols blocked.</li>
              <li><span className="text-[var(--color-text)] font-medium">HTML Stripped.</span> Raw HTML in Markdown fully ignored — no XSS vectors.</li>
              <li><span className="text-[var(--color-text)] font-medium">Change Edit Code.</span> Rotate the edit code from the edit view without losing access.</li>
            </ul>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <div className="mono-label mb-2.5">v 2.0.0</div>
            <ul className="space-y-2 text-[var(--color-text-soft)]">
              <li><span className="text-[var(--color-text)] font-medium">Complete Redesign.</span> Minimal interface with centered editor panes and fluid spacing.</li>
              <li><span className="text-[var(--color-text)] font-medium">Animations.</span> Smooth Framer Motion transitions throughout the UI.</li>
              <li><span className="text-[var(--color-text)] font-medium">Autosave.</span> Local drafts and debounced server autosave for published notes.</li>
              <li><span className="text-[var(--color-text)] font-medium">Import / Export.</span> Load from or save to .md files directly from the toolbar.</li>
              <li><span className="text-[var(--color-text)] font-medium">Theming.</span> Refined dark and light themes.</li>
            </ul>
          </div>

        </div>
      </Dialog>
    </>
  );
}
