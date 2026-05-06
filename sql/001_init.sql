CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  content_markdown TEXT NOT NULL,
  edit_code_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS notes_slug_idx ON notes(slug);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at);

CREATE TABLE IF NOT EXISTS note_events (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ip_hash TEXT,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS note_events_note_id_idx ON note_events(note_id);
CREATE INDEX IF NOT EXISTS note_events_created_at_idx ON note_events(created_at);
