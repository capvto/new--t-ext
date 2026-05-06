'use client';

import type { LocalArchiveItem, LocalFolder } from '@/types/note';

const KEY = 'text_local_archive';
const KEY_FOLDERS = 'text_local_folders';

export function readLocalArchive(): LocalArchiveItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalArchiveItem[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalArchive(items: LocalArchiveItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsertLocalArchive(item: LocalArchiveItem) {
  const current = readLocalArchive();
  const next = [item, ...current.filter((entry) => entry.slug !== item.slug)].slice(0, 200);
  writeLocalArchive(next);
}

export function removeLocalArchive(slug: string) {
   writeLocalArchive(readLocalArchive().filter((entry) => entry.slug !== slug));
 }

export function readLocalFolders(): LocalFolder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY_FOLDERS);
    return raw ? (JSON.parse(raw) as LocalFolder[]) : [];
  } catch {
    return [];
  }
}

export function writeLocalFolders(folders: LocalFolder[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY_FOLDERS, JSON.stringify(folders));
}

export function addLocalFolder(name: string) {
  const folders = readLocalFolders();
  const now = new Date().toISOString();
  const newFolder: LocalFolder = {
    id: Math.random().toString(36).substring(2, 11), // Simple ID generator
    name,
    createdAt: now,
    updatedAt: now,
  };
  writeLocalFolders([newFolder, ...folders]);
  return newFolder;
}

export function removeLocalFolder(id: string) {
  const folders = readLocalFolders().filter(f => f.id !== id);
  writeLocalFolders(folders);
  
  // Also unassign notes from this folder
  const notes = readLocalArchive().map(n => n.folderId === id ? { ...n, folderId: undefined } : n);
  writeLocalArchive(notes);
}

export function updateLocalFolder(id: string, updates: Partial<LocalFolder>) {
  const folders = readLocalFolders().map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f);
  writeLocalFolders(folders);
}

export function moveNoteToFolder(slug: string, folderId?: string) {
  const notes = readLocalArchive().map(n => n.slug === slug ? { ...n, folderId } : n);
  writeLocalArchive(notes);
}
