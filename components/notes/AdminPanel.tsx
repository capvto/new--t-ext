'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import type { AdminNote } from '@/types/note';

type ExportJson = {
  ok: boolean;
  error?: string;
  stats?: {
    notes: number;
    views: number;
    events: number;
  };
  notes?: AdminNote[];
};

function authHeader(password: string) {
  return `Basic ${btoa(`admin:${password}`)}`;
}

export function AdminPanel() {
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [stats, setStats] = useState<ExportJson['stats'] | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);

  const filteredNotes = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter((note) => `${note.slug} ${note.title || ''}`.toLowerCase().includes(q));
  }, [notes, search]);

  async function load(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setToast(null);

    try {
      const response = await fetch('/api/export?format=json', {
        headers: { Authorization: authHeader(password) }
      });
      const data = (await response.json()) as ExportJson;
      if (!response.ok || !data.ok) {
        setToast({ message: data.error || 'Unauthorized.', tone: 'error' });
        return;
      }
      setStats(data.stats || null);
      setNotes(data.notes || []);
      setToast({ message: 'Admin data loaded.', tone: 'success' });
    } catch {
      setToast({ message: 'Could not load admin data.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function exportDb() {
    setBusy(true);
    setToast(null);

    try {
      const response = await fetch('/api/export', {
        headers: { Authorization: authHeader(password) }
      });
      if (!response.ok) {
        setToast({ message: 'Could not export database.', tone: 'error' });
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'text.db';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setToast({ message: 'Could not export database.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function deleteNote(slug: string) {
    if (!window.confirm(`Delete /${slug} permanently?`)) return;
    setBusy(true);

    try {
      const response = await fetch(`/api/notes/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: authHeader(password) }
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setToast({ message: data.error || 'Could not delete note.', tone: 'error' });
        return;
      }
      setNotes((current) => current.filter((note) => note.slug !== slug));
      setToast({ message: `Deleted /${slug}.`, tone: 'success' });
    } catch {
      setToast({ message: 'Could not delete note.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={load} className="grid gap-3 border border-[var(--color-border)] bg-[var(--color-surface-lowest)] p-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="Admin password"
          required
        />
        <Button variant="primary" type="submit" disabled={busy}>
          <Search size={14} />
          Load
        </Button>
      </form>

      {stats ? (
        <div className="grid gap-3 md:grid-cols-4">
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] p-4">
            <div className="mono-label">Notes</div>
            <div className="mt-2 font-content text-3xl">{stats.notes}</div>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] p-4">
            <div className="mono-label">Views</div>
            <div className="mt-2 font-content text-3xl">{stats.views}</div>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] p-4">
            <div className="mono-label">Events</div>
            <div className="mt-2 font-content text-3xl">{stats.events}</div>
          </div>
          <Button variant="ghost" className="min-h-24" onClick={exportDb} disabled={busy}>
            <Download size={15} />
            Export DB
          </Button>
        </div>
      ) : null}

      {notes.length ? (
        <div className="flex items-center gap-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search loaded notes" />
        </div>
      ) : null}

      <div className="border-t border-[var(--color-border)]">
        {filteredNotes.map((note) => (
          <article key={note.id} className="grid gap-4 border-b border-[var(--color-border)] px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2 className="font-content text-xl font-normal">{note.title || note.slug}</h2>
              <div className="mt-2 font-ui text-[11px] leading-5 text-[var(--color-text-soft)]">
                /{note.slug} · {note.views} views · {note.contentLength.toLocaleString()} chars · edited{' '}
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <Button variant="danger" onClick={() => deleteNote(note.slug)} disabled={busy}>
              <Trash2 size={14} />
              Delete
            </Button>
          </article>
        ))}
      </div>

      <Toast message={toast?.message || null} tone={toast?.tone} />
    </div>
  );
}
