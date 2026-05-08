'use client';

import { Code2, Heading2, Heading3, Image as ImageIcon, Link2, List, ListOrdered, Minus, Quote, SquareCheck, Undo2, Redo2, AlignLeft, BellRing } from 'lucide-react';
import type { FormatType } from './editorCommands';

export type { FormatType };

type MarkdownToolbarProps = {
  onFormat: (type: FormatType) => void;
  wordCount: number;
};

export function MarkdownToolbar({ onFormat, wordCount }: MarkdownToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0 border-b border-[var(--color-border)] bg-transparent px-8 py-3">
      <button type="button" className="toolbar-btn" title="Heading 2" onClick={() => onFormat('h2')}>
        <Heading2 size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Heading 3" onClick={() => onFormat('h3')}>
        <Heading3 size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Bold" onClick={() => onFormat('bold')}>
        <b className="text-xs">B</b>
      </button>
      <button type="button" className="toolbar-btn" title="Italic" onClick={() => onFormat('italic')}>
        <i className="text-xs">I</i>
      </button>
      <button type="button" className="toolbar-btn" title="Inline code" onClick={() => onFormat('code')}>
        <Code2 size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Quote" onClick={() => onFormat('blockquote')}>
        <Quote size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Link" onClick={() => onFormat('link')}>
        <Link2 size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Image" onClick={() => onFormat('image')}>
        <ImageIcon size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="List" onClick={() => onFormat('ul')}>
        <List size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Numbered list" onClick={() => onFormat('ol')}>
        <ListOrdered size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Task list" onClick={() => onFormat('task')}>
        <SquareCheck size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Code block" onClick={() => onFormat('codeblock')}>
        <Code2 size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Horizontal rule" onClick={() => onFormat('hr')}>
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Table of contents [[toc]]" onClick={() => onFormat('toc')}>
        <AlignLeft size={14} strokeWidth={1.5} />
      </button>
      <button type="button" className="toolbar-btn" title="Alert / callout" onClick={() => onFormat('alert')}>
        <BellRing size={14} strokeWidth={1.5} />
      </button>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" className="toolbar-btn" title="Undo" onClick={() => onFormat('undo')}>
          <Undo2 size={14} strokeWidth={1.5} />
        </button>
        <button type="button" className="toolbar-btn" title="Redo" onClick={() => onFormat('redo')}>
          <Redo2 size={14} strokeWidth={1.5} />
        </button>
        <span className="font-ui text-[11px] text-[var(--color-text-faint)] ml-4">{wordCount}</span>
      </div>
    </div>
  );
}
