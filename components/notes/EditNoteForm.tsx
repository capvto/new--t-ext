'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, LockKeyhole, PenLine, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { removeLocalArchive, upsertLocalArchive } from '@/lib/localArchive';
import { Footer } from '@/components/layout/Footer';

type EditNoteFormProps = {
  slug: string;
};

type NotePayload = {
  slug: string;
  title: string | null;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
  note?: NotePayload;
};

export function EditNoteForm({ slug }: EditNoteFormProps) {
  const router = useRouter();
  const [editCode, setEditCode] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const initialMount = useRef(true);

  // Auto-unlock if a verified code was stored from the public note page
  useEffect(() => {
    // 1. Check if we have the content locally (draft or saved locally)
    const localContentRaw = window.localStorage.getItem(`text_local_content:${slug}`);
    if (localContentRaw) {
      try {
        const parsed = JSON.parse(localContentRaw);
        setTitle(parsed.title || '');
        setContent(parsed.contentMarkdown || '');
        setUnlocked(true);
        return; // Found locally, no need for other checks
      } catch { /* ignore */ }
    }

    // 2. Check if a verified code was stored in sessionStorage (from NoteArticle popup)
    const storedCode = window.sessionStorage.getItem(`text_editcode:${slug}`);
    if (storedCode && !unlocked) {
      setEditCode(storedCode);
      window.sessionStorage.removeItem(`text_editcode:${slug}`);
      
      (async () => {
        setBusy(true);
        try {
          const response = await fetch(`/api/notes/${slug}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ editCode: storedCode })
          });
          const data = (await response.json()) as ApiResponse;
          if (response.ok && data.ok && data.note) {
            setTitle(data.note.title || '');
            setContent(data.note.contentMarkdown);
            setUnlocked(true);
          }
        } catch {
          // Fallback to manual unlock
        } finally {
          setBusy(false);
        }
      })();
    }
  }, [slug, unlocked]);

  // Check if note is published on the server
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/notes/${slug}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editCode: 'checking' }) // dummy code to see if it exists
        });
        const data = await response.json();
        // If it's 404, it's not published. If it's 401/400 but exists, it's published.
        if (response.status !== 404) {
          setIsPublished(true);
        }
      } catch {
        // Assume not published if error
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!unlocked) return;
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setAutoSaveStatus('idle');

    const timeout = setTimeout(async () => {
      // ALWAYS save locally first
      const now = new Date().toISOString();
      upsertLocalArchive({ slug, title, createdAt: now, updatedAt: now });
      window.localStorage.setItem(`text_local_content:${slug}`, JSON.stringify({ title, contentMarkdown: content }));

      // Only sync to server if it's published AND we have a code
      if (!isPublished || editCode.length < 8) {
        return;
      }

      setAutoSaveStatus('saving');
      try {
        const response = await fetch(`/api/notes/${slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, contentMarkdown: content, editCode })
        });
        const data = (await response.json()) as ApiResponse;

        if (response.ok && data.ok && data.note) {
          upsertLocalArchive({
            slug: data.note.slug,
            title: data.note.title,
            createdAt: data.note.createdAt,
            updatedAt: data.note.updatedAt
          });
          
          // Also update local content for auto-unlock and archive preview
          window.localStorage.setItem(`text_local_content:${data.note.slug}`, JSON.stringify({
            title: data.note.title,
            contentMarkdown: data.note.contentMarkdown
          }));

          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } else {
          setAutoSaveStatus('idle');
        }
      } catch {
        setAutoSaveStatus('idle');
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [title, content, unlocked, slug, editCode]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setToast(null);

    try {
      const response = await fetch(`/api/notes/${slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editCode })
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.note) {
        setToast({ message: data.error || 'Invalid edit code.', tone: 'error' });
        return;
      }

      setTitle(data.note.title || '');
      setContent(data.note.contentMarkdown);
      setUnlocked(true);
      setToast({ message: 'Edit code verified.', tone: 'success' });
    } catch {
      setToast({ message: 'Network error while verifying.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setToast(null);

    // ALWAYS save locally
    const now = new Date().toISOString();
    upsertLocalArchive({ slug, title, createdAt: now, updatedAt: now });
    window.localStorage.setItem(`text_local_content:${slug}`, JSON.stringify({ title, contentMarkdown: content }));

    // If not published or no code, we're done (saved locally)
    if (!isPublished || editCode.length < 8) {
      setToast({ message: 'Saved locally.', tone: 'success' });
      setBusy(false);
      return;
    }

    try {
      const response = await fetch(`/api/notes/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, contentMarkdown: content, editCode })
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.note) {
        setToast({ message: data.error || 'Could not save changes.', tone: 'error' });
        return;
      }

      upsertLocalArchive({
        slug: data.note.slug,
        title: data.note.title,
        createdAt: data.note.createdAt,
        updatedAt: data.note.updatedAt
      });

      // Also update local content
      window.localStorage.setItem(`text_local_content:${data.note.slug}`, JSON.stringify({
        title: data.note.title,
        contentMarkdown: data.note.contentMarkdown
      }));

      setToast({ message: 'Changes saved.', tone: 'success' });
      router.refresh();
    } catch {
      setToast({ message: 'Network error while saving.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function deleteNote() {
    setBusy(true);
    setToast(null);

    if (!isPublished) {
      removeLocalArchive(slug);
      window.localStorage.removeItem(`text_local_content:${slug}`);
      setToast({ message: 'Local note deleted.', tone: 'success' });
      window.setTimeout(() => router.push('/archive'), 650);
      return;
    }

    try {
      const response = await fetch(`/api/notes/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editCode })
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        setToast({ message: data.error || 'Could not delete note.', tone: 'error' });
        return;
      }

      removeLocalArchive(slug);
      setToast({ message: 'Note deleted.', tone: 'success' });
      window.setTimeout(() => router.push('/archive'), 650);
    } catch {
      setToast({ message: 'Network error while deleting.', tone: 'error' });
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="border-b border-[var(--color-border)] px-6 py-6">
          <div className="mono-label">Edit</div>
          <h1 className="mt-2 font-content text-3xl font-normal text-[var(--color-text)]">/{slug}</h1>
        </div>
        <form onSubmit={verify} className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-12">
          <div className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-primary-c)]">
            <LockKeyhole size={16} strokeWidth={1.5} />
          </div>
          <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
            Enter the edit code for this note.
          </p>
          <label>
            <span className="mono-label">Edit code</span>
            <Input
              value={editCode}
              onChange={(event) => setEditCode(event.target.value)}
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
              className="mt-2"
            />
          </label>
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? 'Verifying...' : 'Unlock editor'}
          </Button>
        </form>
        <Toast message={toast?.message || null} tone={toast?.tone} />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="flex min-h-[calc(100vh-56px)] flex-col p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="mono-label text-[var(--color-text-soft)]">Editing /{slug}</div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[var(--color-surface-lowest)] p-1 border border-[var(--color-border)] shadow-sm" style={{ borderRadius: 'calc(var(--radius-base) + 4px)' }}>
              <button
                type="button"
                onClick={() => setMobilePane('editor')}
                className={`relative px-3 py-1.5 text-sm z-10 transition-colors rounded-md ${
                  mobilePane === 'editor' ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-text-soft)] hover:text-[var(--color-text)]'
                }`}
                title="Edit"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <PenLine size={15} strokeWidth={1.5} />
                  <span className="hidden sm:inline font-ui font-medium">Edit</span>
                </span>
                {mobilePane === 'editor' && (
                  <motion.div
                    layoutId="active-pane"
                    className="absolute inset-0 bg-[var(--color-primary-c)] rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setMobilePane('preview')}
                className={`relative px-3 py-1.5 text-sm z-10 transition-colors rounded-md ${
                  mobilePane === 'preview' ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-text-soft)] hover:text-[var(--color-text)]'
                }`}
                title="Preview"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Eye size={15} strokeWidth={1.5} />
                  <span className="hidden sm:inline font-ui font-medium">Preview</span>
                </span>
                {mobilePane === 'preview' && (
                  <motion.div
                    layoutId="active-pane"
                    className="absolute inset-0 bg-[var(--color-primary-c)] rounded-md shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            </div>
            
            <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />
            <Button variant="danger" type="button" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={16} strokeWidth={1.5} />
            </Button>
            <Button variant="primary" type="submit" disabled={busy || autoSaveStatus === 'saving'}>
              {autoSaveStatus === 'saved' && !busy ? (
                <CheckCircle2 size={16} strokeWidth={1.5} />
              ) : (
                <Save size={16} strokeWidth={1.5} />
              )}
              {busy || autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="md:px-8 mb-6">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Untitled note"
            className="w-full border-0 bg-transparent px-0 font-content text-4xl sm:text-5xl font-bold text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:ring-0 focus:outline-none"
          />
        </div>

        <div className="editor-grid flex-1" data-mobile-pane={mobilePane}>
          <section className="editor-panel min-h-0">
            <MarkdownEditor value={content} onChange={setContent} minHeightClass="min-h-[200px]" />
          </section>
          <section className="preview-panel overflow-auto px-0 md:px-8 py-0">
            <MarkdownPreview content={content} />
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3">
        <Footer />
      </div>

      <Dialog open={deleteOpen} title="Delete note" onClose={() => setDeleteOpen(false)}>
        <div className="flex flex-col gap-4">
          <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
            {isPublished 
              ? <>This will permanently remove the note <strong>/{slug}</strong> from the database. This action cannot be undone.</>
              : <>This will remove the draft <strong>/{slug}</strong> from your local archive. You will lose the content of this note.</>
            }
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" type="button" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="button" onClick={deleteNote} disabled={busy}>
              Delete permanently
            </Button>
          </div>
        </div>
      </Dialog>

      <Toast message={toast?.message || null} tone={toast?.tone} />
    </form>
  );
}
