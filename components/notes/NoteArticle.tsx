'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { SidebarTableOfContents } from '@/components/markdown/SidebarTableOfContents';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { getMarkdownToc } from '@/lib/markdown';
import type { PublicNote } from '@/types/note';

type NoteArticleProps = {
  note: PublicNote;
};

export function NoteArticle({ note }: NoteArticleProps) {
  const router = useRouter();
  const toc = getMarkdownToc(note.contentMarkdown);
  const hasToc = toc.length >= 2;
  const [publishedFlash, setPublishedFlash] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `text_published:${note.slug}`;
    if (window.sessionStorage.getItem(key)) {
      window.sessionStorage.removeItem(key);
      const show = window.setTimeout(() => setPublishedFlash(true), 0);
      const hide = window.setTimeout(() => setPublishedFlash(false), 5000);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
      };
    }
    return undefined;
  }, [note.slug]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${note.slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editCode })
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || 'Invalid edit code.');
        return;
      }

      // Store verified code so the edit page auto-unlocks
      window.sessionStorage.setItem(`text_editcode:${note.slug}`, editCode);
      router.push(`/${note.slug}/edit`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-lowest)] px-5 py-5">
        <div className="mx-auto flex max-w-article items-center justify-between gap-4">
          <Link href="/" className="font-ui text-sm font-bold text-[var(--color-text)]">
            (t)ext
          </Link>
          <button
            type="button"
            onClick={() => { setEditModalOpen(true); setEditCode(''); setError(null); }}
            className="font-ui text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-soft)] hover:text-[var(--color-primary)] bg-transparent border-0 cursor-pointer transition-colors"
          >
            edit
          </button>
        </div>
      </header>

      <div className={`mx-auto px-5 py-12 md:py-16 ${hasToc ? 'article-layout-toc' : 'max-w-article'}`}>
        <article>
          {note.title ? <h1 className="article-title mb-8">{note.title}</h1> : null}
          <MarkdownPreview content={note.contentMarkdown} />
        </article>
        {hasToc && (
          <aside className="article-toc-sidebar">
            <SidebarTableOfContents items={toc} />
          </aside>
        )}
      </div>

      <footer className="border-t border-[var(--color-border)] px-5 py-5">
        <div className="mx-auto flex max-w-article flex-col gap-2 font-ui text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-faint)] sm:flex-row sm:items-center sm:justify-between">
          <span>Last edited {new Date(note.updatedAt).toLocaleDateString('en-GB')}</span>
          <a 
            href="https://matteocaputo.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[var(--color-primary)]"
          >
            Developed by Matteo Caputo
          </a>
        </div>
      </footer>

      <Dialog open={editModalOpen} title="Unlock editor" onClose={() => setEditModalOpen(false)}>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--color-border)] text-[var(--color-primary-c)]" style={{ borderRadius: 'var(--radius-base)' }}>
              <LockKeyhole size={16} strokeWidth={1.5} />
            </div>
            <p className="font-ui text-sm leading-5 text-[var(--color-text-soft)]">
              Enter the edit code for <strong className="text-[var(--color-text)]">/{note.slug}</strong>
            </p>
          </div>

          <label>
            <span className="mono-label">Edit code</span>
            <Input
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              autoFocus
              className="mt-2"
            />
          </label>

          {error && (
            <p className="font-ui text-xs text-[var(--color-danger)]">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? 'Verifying...' : 'Unlock editor'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Toast
        message={publishedFlash ? 'Published. Save your edit code. It cannot be recovered.' : null}
        tone="success"
      />
    </main>
  );
}
