'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, PenLine, Send, Save, FilePlus, Download, Upload } from 'lucide-react';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { MarkdownPreview } from '@/components/editor/MarkdownPreview';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { upsertLocalArchive } from '@/lib/localArchive';
import { Footer } from '@/components/layout/Footer';
import { MAX_CONTENT_LENGTH, wordCount } from '@/lib/markdown';

const STARTER = '';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

type ApiCreateResponse = {
  ok: boolean;
  error?: string;
  note?: {
    slug: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export function PublishForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState(STARTER);
  const [editCode, setEditCode] = useState('');
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [showPublishOptions, setShowPublishOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const searchParams = useSearchParams();
  const draftSlug = searchParams.get('draft');

  const contentLength = content.length;
  const overLimit = contentLength > MAX_CONTENT_LENGTH;
  const displayTitle = useMemo(() => title.trim() || 'Untitled note', [title]);

  useEffect(() => {
    // Priority 1: Load from draft query param (from Archive)
    if (draftSlug) {
      const localContentRaw = window.localStorage.getItem(`text_local_content:${draftSlug}`);
      if (localContentRaw) {
        try {
          const parsed = JSON.parse(localContentRaw);
          setTitle(parsed.title || '');
          setContent(parsed.contentMarkdown || '');
          setSlug(draftSlug);
          // Update global draft storage immediately
          localStorage.setItem('text_draft_title', parsed.title || '');
          localStorage.setItem('text_draft_content', parsed.contentMarkdown || '');
          localStorage.setItem('text_draft_slug', draftSlug);
          
          router.replace('/');
          return;
        } catch { /* ignore */ }
      }
    }

    // Priority 2: Load from global draft storage
    const draftTitle = localStorage.getItem('text_draft_title');
    const draftContent = localStorage.getItem('text_draft_content');
    const savedSlug = localStorage.getItem('text_draft_slug');
    if (draftTitle !== null) setTitle(draftTitle);
    if (draftContent !== null) setContent(draftContent);
    if (savedSlug !== null) setSlug(savedSlug);
  }, [draftSlug, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('text_draft_title', title);
      localStorage.setItem('text_draft_content', content);
      localStorage.setItem('text_draft_slug', slug);
    }, 500);
    return () => clearTimeout(timeout);
  }, [title, content, slug]);

  function handleNewNote() {
    if (content !== '' || title !== '') {
      setShowClearConfirm(true);
      return;
    }
    confirmClear();
  }

  function confirmClear() {
    setTitle('');
    setSlug('');
    setContent('');
    localStorage.removeItem('text_draft_title');
    localStorage.removeItem('text_draft_content');
    localStorage.removeItem('text_draft_slug');
    setShowClearConfirm(false);
  }

  function handleExport() {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'untitled-note'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,text/markdown';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        const name = file.name.replace(/\.md$/i, '');
        setTitle(name);
        setSlug(slugify(name));
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!showPublishOptions) {
      setShowPublishOptions(true);
      if (!slug) setSlug(slugify(title || 'untitled-note'));
      return;
    }

    setSubmitting(true);
    setToast(null);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          contentMarkdown: content,
          editCode
        })
      });

      const data = (await response.json()) as ApiCreateResponse;
      if (!response.ok || !data.ok || !data.note) {
        setToast({ message: data.error || 'Could not publish note.', tone: 'error' });
        return;
      }

      upsertLocalArchive({
        slug: data.note.slug,
        title: data.note.title,
        createdAt: data.note.createdAt,
        updatedAt: data.note.updatedAt
      });

      window.sessionStorage.setItem(`text_published:${data.note.slug}`, '1');
      localStorage.removeItem('text_draft_title');
      localStorage.removeItem('text_draft_content');
      setToast({ message: 'Published. Save your edit code. It cannot be recovered.', tone: 'success' });
      window.setTimeout(() => router.push(`/${data.note?.slug}`), 850);
    } catch {
      setToast({ message: 'Network error while publishing.', tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  function saveLocal() {
    const now = new Date().toISOString();
    const localSlug = slug || slugify(title || 'untitled-note');
    
    upsertLocalArchive({
      slug: localSlug,
      title: title || null,
      createdAt: now,
      updatedAt: now
    });

    // Also store the content separately so it can be recovered
    window.localStorage.setItem(`text_local_content:${localSlug}`, JSON.stringify({
      title,
      contentMarkdown: content
    }));

    setToast({ message: `Saved locally as /${localSlug}`, tone: 'success' });
  }

  function handleTitle(value: string) {
    setTitle(value);
    if (!slug) setSlug(slugify(value));
  }

  return (
    <form onSubmit={publish} className="flex min-h-[calc(100vh-56px)] flex-col p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
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
                    className="absolute inset-0 bg-[var(--color-primary-c)] shadow-sm"
                    style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
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
                    className="absolute inset-0 bg-[var(--color-primary-c)] shadow-sm"
                    style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            </div>
            
            <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />
            <Button variant="ghost" type="button" onClick={handleNewNote} title="New note">
              <FilePlus size={16} strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" type="button" onClick={handleImport} title="Import from .md">
              <Upload size={16} strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" type="button" onClick={handleExport} title="Export to .md" disabled={!content}>
              <Download size={16} strokeWidth={1.5} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={saveLocal} disabled={!content}>
              <Save size={16} strokeWidth={1.5} />
              Save
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || overLimit}>
              <Send size={16} strokeWidth={1.5} />
              Publish
            </Button>
          </div>
        </div>

        <div className="md:px-8 mb-6">
          <input
            value={title}
            onChange={(event) => handleTitle(event.target.value)}
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
        <div className="font-ui text-[12px] leading-5 text-[var(--color-text-soft)]">
          <span>{wordCount(content)} words</span>
          <span className={`ml-2 ${overLimit ? 'text-[var(--color-danger)]' : ''}`}>
            {(contentLength / 1000).toFixed(0)}K / 200K chars
          </span>
        </div>
        <Footer />
      </div>

      <Dialog open={showPublishOptions} title="Publish Note" onClose={() => setShowPublishOptions(false)}>
        <div className="flex flex-col gap-5">
          <label>
            <span className="mono-label mb-2 block flex items-center justify-between">
              URL
              <span className="text-[10px] lowercase text-[var(--color-text-faint)] font-normal tracking-normal">required</span>
            </span>
            <Input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="my-note"
              minLength={3}
              maxLength={64}
              required
            />
          </label>
          <label>
            <span className="mono-label mb-2 flex items-center justify-between">
              Code
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const arr = new Uint8Array(8);
                    crypto.getRandomValues(arr);
                    setEditCode(Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''));
                  }}
                  className="text-[10px] text-[var(--color-primary-c)] hover:text-[var(--color-primary)] hover:underline focus:outline-none uppercase tracking-widest font-bold transition-colors"
                >
                  Generate
                </button>
                <span className="text-[10px] lowercase text-[var(--color-text-faint)] font-normal tracking-normal">required</span>
              </div>
            </span>
            <Input
              value={editCode}
              onChange={(event) => setEditCode(event.target.value)}
              type="text"
              autoComplete="off"
              placeholder="8+ chars"
              minLength={8}
              required
            />
            <p className="mt-2 font-ui text-[12px] leading-5 text-[var(--color-text-soft)]">
              Anyone with the link can read. Anyone with the code can edit.
            </p>
          </label>
          
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setShowPublishOptions(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Confirm Publish'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog 
        open={showClearConfirm} 
        title="Clear current note?" 
        onClose={() => setShowClearConfirm(false)}
      >
        <div className="flex flex-col gap-4">
          <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
            Are you sure you want to clear the current note? This will delete all unsaved changes and start a new blank page.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmClear}
            >
              Clear note
            </Button>
          </div>
        </div>
      </Dialog>

      <Toast message={toast?.message || null} tone={toast?.tone} />
    </form>
  );
}
