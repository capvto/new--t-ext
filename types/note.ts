export type NoteRecord = {
  id: string;
  slug: string;
  title: string | null;
  content_markdown: string;
  edit_code_hash: string;
  created_at: string;
  updated_at: string;
  views: number;
  deleted_at: string | null;
};

export type PublicNote = {
  slug: string;
  title: string | null;
  contentMarkdown: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
};

export type LocalFolder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  icon?: string;
};

export type LocalArchiveItem = {
  slug: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
};

export type AdminNote = {
  id: string;
  slug: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  contentLength: number;
};
