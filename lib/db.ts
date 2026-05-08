import fs from 'node:fs';
import path from 'node:path';
import { createClient, type Client, type Row } from '@libsql/client';
import { runMigrations } from '@/lib/migrations';
import type { AdminNote, NoteRecord, PublicNote } from '@/types/note';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, 'text.db');

type GlobalDb = typeof globalThis & {
  __textDb?: Client;
  __textDbMigrated?: Promise<void>;
};

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getDb() {
  const globalDb = globalThis as GlobalDb;
  if (globalDb.__textDb) return globalDb.__textDb;

  ensureDataDir();
  const db = createClient({ url: `file:${DB_PATH}` });
  globalDb.__textDb = db;
  return db;
}

async function ensureMigrated() {
  const globalDb = globalThis as GlobalDb;
  if (!globalDb.__textDbMigrated) {
    globalDb.__textDbMigrated = runMigrations(getDb());
  }
  await globalDb.__textDbMigrated;
}

export function getDatabasePath() {
  return DB_PATH;
}

function noteFromRow(row: Row): NoteRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: row.title === null ? null : String(row.title),
    content_markdown: String(row.content_markdown),
    edit_code_hash: String(row.edit_code_hash),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    views: Number(row.views || 0),
    deleted_at: row.deleted_at === null ? null : String(row.deleted_at)
  };
}

export async function findNoteBySlug(slug: string) {
  await ensureMigrated();
  const result = await getDb().execute({
    sql: `SELECT id, slug, title, content_markdown, edit_code_hash, created_at, updated_at, views, deleted_at
          FROM notes
          WHERE slug = ? AND deleted_at IS NULL`,
    args: [slug]
  });
  const row = result.rows[0];
  return row ? noteFromRow(row) : undefined;
}

export function noteToPublic(note: NoteRecord): PublicNote {
  return {
    slug: note.slug,
    title: note.title,
    contentMarkdown: note.content_markdown,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    views: note.views
  };
}

export async function incrementViews(slug: string) {
  await ensureMigrated();
  await getDb().execute({
    sql: 'UPDATE notes SET views = COALESCE(views, 0) + 1 WHERE slug = ? AND deleted_at IS NULL',
    args: [slug]
  });
}

export async function recordNoteEvent(noteId: string, eventType: string, ipHash?: string | null) {
  await ensureMigrated();
  await getDb().execute({
    sql: `INSERT INTO note_events (id, note_id, event_type, created_at, ip_hash)
          VALUES (?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), noteId, eventType, new Date().toISOString(), ipHash || null]
  });
}

export async function listAdminNotes(search = '') {
  await ensureMigrated();
  const query = `%${search.trim()}%`;
  const result = await getDb().execute({
    sql: `SELECT id, slug, title, created_at as createdAt, updated_at as updatedAt, views,
                 length(content_markdown) as contentLength
          FROM notes
          WHERE deleted_at IS NULL
            AND (? = '%%' OR slug LIKE ? OR title LIKE ? OR content_markdown LIKE ?)
          ORDER BY updated_at DESC
          LIMIT 250`,
    args: [query, query, query, query]
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: row.title === null ? null : String(row.title),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    views: Number(row.views || 0),
    contentLength: Number(row.contentLength || 0)
  })) satisfies AdminNote[];
}

export async function getAdminStats() {
  await ensureMigrated();
  const db = getDb();
  const notes = await db.execute('SELECT COUNT(*) as count FROM notes WHERE deleted_at IS NULL');
  const views = await db.execute('SELECT COALESCE(SUM(views), 0) as count FROM notes WHERE deleted_at IS NULL');
  const events = await db.execute('SELECT COUNT(*) as count FROM note_events');
  return {
    notes: Number(notes.rows[0]?.count || 0),
    views: Number(views.rows[0]?.count || 0),
    events: Number(events.rows[0]?.count || 0)
  };
}

export async function insertNote(input: {
  id: string;
  slug: string;
  title: string | null;
  contentMarkdown: string;
  editCodeHash: string;
  createdAt: string;
  updatedAt: string;
}) {
  await ensureMigrated();
  await getDb().execute({
    sql: `INSERT INTO notes (id, slug, title, content_markdown, edit_code_hash, created_at, updated_at, views)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    args: [
      input.id,
      input.slug,
      input.title,
      input.contentMarkdown,
      input.editCodeHash,
      input.createdAt,
      input.updatedAt
    ]
  });
}

export async function updateNoteContent(input: {
  id: string;
  title: string | null;
  contentMarkdown: string;
  updatedAt: string;
}) {
  await ensureMigrated();
  await getDb().execute({
    sql: 'UPDATE notes SET title = ?, content_markdown = ?, updated_at = ? WHERE id = ?',
    args: [input.title, input.contentMarkdown, input.updatedAt, input.id]
  });
}

export async function listPublicSlugs() {
  await ensureMigrated();
  const result = await getDb().execute(
    'SELECT slug, updated_at as updatedAt FROM notes WHERE deleted_at IS NULL ORDER BY updated_at DESC'
  );
  return result.rows.map((row) => ({
    slug: String(row.slug),
    updatedAt: String(row.updatedAt)
  }));
}

export async function deleteNoteById(id: string) {
  await ensureMigrated();
  await getDb().execute({
    sql: 'DELETE FROM notes WHERE id = ?',
    args: [id]
  });
}

export async function updateNoteEditCodeHash(input: {
  id: string;
  editCodeHash: string;
  updatedAt: string;
}) {
  await ensureMigrated();
  await getDb().execute({
    sql: 'UPDATE notes SET edit_code_hash = ?, updated_at = ? WHERE id = ?',
    args: [input.editCodeHash, input.updatedAt, input.id]
  });
}
