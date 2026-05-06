'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { 
  Pencil, Trash2, FileText, FolderPlus, Folder, ChevronRight, FolderOpen, 
  Settings, Book, Code, Star, Heart, Zap, Coffee, Tag 
} from 'lucide-react';
import { 
  readLocalArchive, removeLocalArchive, readLocalFolders, addLocalFolder, 
  removeLocalFolder, moveNoteToFolder, updateLocalFolder 
} from '@/lib/localArchive';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { LocalArchiveItem, LocalFolder } from '@/types/note';

const FOLDER_ICONS = {
  folder: Folder,
  book: Book,
  code: Code,
  star: Star,
  heart: Heart,
  zap: Zap,
  coffee: Coffee,
  tag: Tag
};

const FOLDER_COLORS = [
  { name: 'Default', value: 'var(--color-primary-c)' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
];

type LocalArchiveWithContent = LocalArchiveItem & {
  contentPreview?: string;
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB');
}

export function LocalArchiveView() {
  const [items, setItems] = useState<LocalArchiveWithContent[]>([]);
  const [folders, setFolders] = useState<LocalFolder[]>([]);
  const [toBeDeleted, setToBeDeleted] = useState<{ type: 'note' | 'folder', id: string } | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // To view inside a folder
  const [customizingFolder, setCustomizingFolder] = useState<LocalFolder | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const archive = readLocalArchive();
      const enriched: LocalArchiveWithContent[] = archive.map((item) => {
        try {
          const raw = window.localStorage.getItem(`text_local_content:${item.slug}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            return { ...item, contentPreview: parsed.contentMarkdown?.slice(0, 200) || '' };
          }
        } catch { /* ignore */ }
        return item;
      });
      setItems(enriched);
      setFolders(readLocalFolders());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function remove(slug: string) {
    removeLocalArchive(slug);
    window.localStorage.removeItem(`text_local_content:${slug}`);
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }

  function handleAddFolder() {
    if (!newFolderName.trim()) return;
    const folder = addLocalFolder(newFolderName);
    setFolders(prev => [folder, ...prev]);
    setNewFolderName('');
    setIsAddingFolder(false);
  }

  function handleDeleteFolder(id: string) {
    removeLocalFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));
    // Notes are unassigned by the lib, so we need to refresh items
    setItems(prev => prev.map(n => n.folderId === id ? { ...n, folderId: undefined } : n));
  }

  function handleUpdateFolder(id: string, updates: Partial<LocalFolder>) {
    updateLocalFolder(id, updates);
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    if (customizingFolder?.id === id) {
      setCustomizingFolder(prev => prev ? { ...prev, ...updates } : null);
    }
  }

  const filteredNotes = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted.filter(n => n.folderId === (activeFolderId || undefined));
  }, [items, activeFolderId]);

  const activeFolderName = useMemo(() => {
    if (!activeFolderId) return null;
    return folders.find(f => f.id === activeFolderId)?.name;
  }, [folders, activeFolderId]);

  if (items.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-8 md:flex-row md:items-end md:justify-between md:px-8 max-w-[1400px] mx-auto w-full">
          <div>
            <h1 className="font-content text-4xl font-normal text-[var(--color-text)]">Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsAddingFolder(true)} className="h-10">
              <FolderPlus size={18} className="mr-2" />
              <span className="font-ui font-medium">New Folder</span>
            </Button>
            <Link href="/">
              <Button variant="primary" className="h-10">New note</Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="font-content text-2xl font-normal text-[var(--color-text-muted)]">No local notes</h2>
        </div>
        
        <Dialog open={isAddingFolder} title="Create folder" onClose={() => setIsAddingFolder(false)}>
          <div className="flex flex-col gap-4">
            <Input 
              value={newFolderName} 
              onChange={e => setNewFolderName(e.target.value)} 
              placeholder="Folder name"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddingFolder(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddFolder}>Create</Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-8 md:flex-row md:items-end md:justify-between md:px-8 max-w-[1400px] mx-auto w-full">
        <div>
          <h1 className="font-content text-4xl font-normal text-[var(--color-text)]">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setIsAddingFolder(true)} className="h-10">
            <FolderPlus size={18} className="mr-2" />
            <span className="font-ui font-medium">New Folder</span>
          </Button>
          <Link href="/">
            <Button variant="primary" className="h-10">New note</Button>
          </Link>
        </div>
      </header>

      <div className="px-5 py-6 md:px-8 max-w-[1400px] mx-auto w-full">
        {/* Breadcrumbs / Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveFolderId(null)}
              onDragOver={(e) => {
                if (activeFolderId) {
                  e.preventDefault();
                  e.currentTarget.style.color = 'var(--color-primary-c)';
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
              onDrop={(e) => {
                if (activeFolderId && draggedNote) {
                  e.preventDefault();
                  e.currentTarget.style.color = '';
                  moveNoteToFolder(draggedNote, undefined);
                  setItems(prev => prev.map(n => n.slug === draggedNote ? { ...n, folderId: undefined } : n));
                  setDraggedNote(null);
                }
              }}
              className={`flex items-center gap-2 font-ui text-sm font-medium transition-all ${
                !activeFolderId 
                  ? 'text-[var(--color-text)] cursor-default' 
                  : 'text-[var(--color-text-faint)] hover:text-[var(--color-primary)] cursor-pointer'
              }`}
            >
              {activeFolderId && <Folder size={16} strokeWidth={1.5} />}
              All Notes
            </button>
            {activeFolderId && (
              <div className="flex items-center gap-3">
                <ChevronRight size={14} className="text-[var(--color-text-faint)]" />
                <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm" style={{ borderRadius: 'var(--radius-base)' }}>
                  <FolderOpen size={14} className="text-[var(--color-primary-c)]" />
                  <span className="font-ui text-sm font-semibold text-[var(--color-text)]">
                    {activeFolderName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Folders (only show on root level) */}
        {!activeFolderId && folders.map((folder) => (
          <div
            key={folder.id}
            onDragOver={(e) => {
              e.preventDefault();
              const color = folder.color || 'var(--color-primary-c)';
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-lowest)';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-lowest)';
              if (draggedNote) {
                moveNoteToFolder(draggedNote, folder.id);
                setItems(prev => prev.map(n => n.slug === draggedNote ? { ...n, folderId: folder.id } : n));
                setDraggedNote(null);
              }
            }}
            className="group relative flex flex-col border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden transition-all hover:border-[var(--color-border-strong)] hover:shadow-md cursor-pointer"
            style={{ borderRadius: 'var(--radius-base)' }}
            onClick={() => setActiveFolderId(folder.id)}
          >
            <div className="flex flex-col h-full min-h-[130px]">
              <div className="flex items-start justify-between p-4 pb-0">
                <div 
                  className="flex h-10 w-10 items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm" 
                  style={{ 
                    borderRadius: 'calc(var(--radius-base) * 0.8)',
                    color: folder.color || 'var(--color-primary-c)' 
                  }}
                >
                  {(() => {
                    const Icon = FOLDER_ICONS[folder.icon as keyof typeof FOLDER_ICONS] || Folder;
                    return <Icon size={20} strokeWidth={1.5} />;
                  })()}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCustomizingFolder(folder);
                    }}
                    className="relative z-20 text-[var(--color-text-faint)] hover:text-[var(--color-text)] p-1.5 bg-transparent border-0 cursor-pointer"
                    title="Personalize"
                  >
                    <Settings size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setToBeDeleted({ type: 'folder', id: folder.id });
                    }}
                    className="relative z-20 text-[var(--color-text-faint)] hover:text-[var(--color-danger)] p-1.5 bg-transparent border-0 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-end">
                <span className="font-ui text-sm font-semibold text-[var(--color-text)] mb-1">
                  {folder.name}
                </span>
                <span className="font-ui text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider font-bold">
                  {items.filter(n => n.folderId === folder.id).length} notes
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Notes */}
        {filteredNotes.map((item) => (
          <article
            key={item.slug}
            draggable
            onDragStart={() => setDraggedNote(item.slug)}
            onDragEnd={() => setDraggedNote(null)}
            className="group relative flex flex-col border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden transition-all hover:border-[var(--color-border-strong)] hover:shadow-md"
            style={{ borderRadius: 'var(--radius-base)' }}
          >
            {/* Invisible link covering the whole card - opens in Write mode as draft */}
            <Link 
              href={`/?draft=${item.slug}`} 
              className="absolute inset-0 z-10"
              aria-label={`Open ${item.title || item.slug} in editor`}
            />

            {/* Card content */}
            <div className="relative flex flex-col h-full">
              {/* Card header with icon and actions */}
              <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--color-primary-c)] text-[var(--color-on-accent)]" style={{ borderRadius: 'calc(var(--radius-base) * 0.6)' }}>
                    <FileText size={13} strokeWidth={2} />
                  </div>
                  <h2 className="font-ui text-sm font-semibold text-[var(--color-text)] truncate">
                    {item.title || item.slug}
                  </h2>
                </div>
              </div>

              {/* Content preview */}
              <div className="flex-1 px-4 pb-3">
                {item.contentPreview ? (
                  <p className="font-ui text-[12px] leading-[1.6] text-[var(--color-text-soft)] line-clamp-4 break-words">
                    {item.contentPreview}
                  </p>
                ) : (
                  <p className="font-ui text-[12px] leading-[1.6] text-[var(--color-text-faint)] italic">
                    No preview available
                  </p>
                )}
              </div>

              {/* Footer with date and actions */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-2.5 bg-[var(--color-surface)]">
                <span className="font-ui text-[10px] text-[var(--color-text-faint)]">
                  {timeAgo(item.updatedAt)}
                </span>
                <div className="relative z-20 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setToBeDeleted({ type: 'note', id: item.slug });
                    }}
                    className="font-ui text-[10px] font-medium text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition-colors px-1.5 py-0.5 cursor-pointer"
                  >
                    <Trash2 size={11} strokeWidth={1.5} className="inline mr-1" style={{ verticalAlign: '-1.5px' }} />
                    Remove
                  </button>
                  <Link
                    href={`/?draft=${item.slug}`}
                    className="font-ui text-[10px] font-medium text-[var(--color-text-soft)] hover:text-[var(--color-primary)] transition-colors px-1.5 py-0.5"
                  >
                    <Pencil size={11} strokeWidth={1.5} className="inline mr-1" style={{ verticalAlign: '-1.5px' }} />
                    Resume
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog 
        open={!!toBeDeleted} 
        title={toBeDeleted?.type === 'folder' ? 'Delete Folder' : 'Delete Local Note'} 
        onClose={() => setToBeDeleted(null)}
      >
        <div className="flex flex-col gap-4">
          <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
            {toBeDeleted?.type === 'folder' 
              ? <>Are you sure you want to remove this folder? The notes inside will be moved to "All Notes".</>
              : <>Are you sure you want to remove <strong>/{toBeDeleted?.id}</strong>? This will delete the content from your browser storage.</>
            }
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setToBeDeleted(null)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                if (toBeDeleted) {
                  if (toBeDeleted.type === 'note') remove(toBeDeleted.id);
                  else handleDeleteFolder(toBeDeleted.id);
                  setToBeDeleted(null);
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={isAddingFolder} title="Create folder" onClose={() => setIsAddingFolder(false)}>
        <div className="flex flex-col gap-4">
          <Input 
            value={newFolderName} 
            onChange={e => setNewFolderName(e.target.value)} 
            placeholder="Folder name"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAddingFolder(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddFolder}>Create</Button>
          </div>
        </div>
      </Dialog>

      <Dialog 
        open={!!customizingFolder} 
        title={`Personalize "${customizingFolder?.name}"`} 
        onClose={() => setCustomizingFolder(null)}
      >
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-faint)] mb-3">Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => customizingFolder && handleUpdateFolder(customizingFolder.id, { color: color.value })}
                  className={`flex h-10 items-center justify-center rounded-md border-2 transition-all ${
                    customizingFolder?.color === color.value || (!customizingFolder?.color && color.name === 'Default')
                      ? 'border-[var(--color-text)] scale-105' 
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-ui text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-faint)] mb-3">Icon</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(FOLDER_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => customizingFolder && handleUpdateFolder(customizingFolder.id, { icon: key })}
                  className={`flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] transition-all ${
                    (customizingFolder?.icon === key) || (!customizingFolder?.icon && key === 'folder')
                      ? 'text-[var(--color-primary-c)] border-[var(--color-primary-c)] bg-[var(--color-surface-lowest)] ring-2 ring-[var(--color-primary-c)]/10' 
                      : 'text-[var(--color-text-soft)] hover:bg-[var(--color-surface-lowest)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setCustomizingFolder(null)}>Done</Button>
          </div>
        </div>
      </Dialog>
    </div>
  </div>
  );
}
