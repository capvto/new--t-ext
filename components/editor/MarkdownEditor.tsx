'use client';

import { useRef, useState, useEffect } from 'react';
import { MarkdownToolbar, type FormatType } from '@/components/editor/MarkdownToolbar';
import { wordCount } from '@/lib/markdown';
import { readSettings } from '@/lib/appearance';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeightClass?: string;
};

export function MarkdownEditor({ value, onChange, minHeightClass = 'min-h-[520px]' }: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    setShowToolbar(readSettings().showToolbar);
    
    function handleSettingsChange(e: Event) {
      const customEvent = e as CustomEvent;
      setShowToolbar(customEvent.detail.showToolbar);
    }
    
    window.addEventListener('text_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('text_settings_changed', handleSettingsChange);
  }, []);

  function insertFormat(type: FormatType) {
    const textarea = ref.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const before = value.slice(0, start);
    const after = value.slice(end);
    let insert = '';
    let cursorOffset = 0;

    if (type === 'undo') {
      textarea.focus();
      document.execCommand('undo');
      return;
    }

    if (type === 'redo') {
      textarea.focus();
      document.execCommand('redo');
      return;
    }

    switch (type) {
      case 'h2':
        insert = selected ? `## ${selected}` : `## `;
        cursorOffset = insert.length;
        break;
      case 'h3':
        insert = selected ? `### ${selected}` : `### `;
        cursorOffset = insert.length;
        break;
      case 'bold':
        insert = selected ? `**${selected}**` : `****`;
        cursorOffset = selected ? insert.length : 2;
        break;
      case 'italic':
        insert = selected ? `*${selected}*` : `**`;
        cursorOffset = selected ? insert.length : 1;
        break;
      case 'underline':
        insert = selected ? `<u>${selected}</u>` : `<u></u>`;
        cursorOffset = selected ? insert.length : 3;
        break;
      case 'code':
        insert = selected ? `\`${selected}\`` : `\`\``;
        cursorOffset = selected ? insert.length : 1;
        break;
      case 'blockquote':
        insert = selected ? selected.split('\n').map((line) => `> ${line}`).join('\n') : `> `;
        cursorOffset = insert.length;
        break;
      case 'link':
        insert = selected ? `[${selected}](https://)` : `[](https://)`;
        cursorOffset = selected ? insert.length - 1 : 1;
        break;
      case 'ul':
        insert = selected ? selected.split('\n').map((line) => `- ${line}`).join('\n') : `- `;
        cursorOffset = insert.length;
        break;
      case 'ol':
        insert = selected
          ? selected.split('\n').map((line, index) => `${index + 1}. ${line}`).join('\n')
          : `1. `;
        cursorOffset = insert.length;
        break;
      case 'task':
        insert = selected ? selected.split('\n').map((line) => `- [ ] ${line}`).join('\n') : `- [ ] `;
        cursorOffset = insert.length;
        break;
      case 'codeblock':
        insert = selected ? `\n\`\`\`\n${selected}\n\`\`\`\n` : `\n\`\`\`\n\n\`\`\`\n`;
        cursorOffset = selected ? insert.length : 5;
        break;
      case 'hr':
        insert = '\n---\n';
        cursorOffset = insert.length;
        break;
    }

    const next = before + insert + after;
    
    textarea.focus();
    textarea.setSelectionRange(start, end);
    document.execCommand('insertText', false, insert);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + cursorOffset;
      textarea.setSelectionRange(pos, pos);
    });
  }

  const adjustHeight = () => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, showToolbar]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.metaKey || e.ctrlKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        insertFormat('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        insertFormat('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        insertFormat('underline');
      }
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {showToolbar && (
        <MarkdownToolbar onFormat={insertFormat} wordCount={wordCount(value)} />
      )}
      <textarea
        ref={ref}
        value={value}
        spellCheck
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start writing..."
        className={`w-full resize-none border-0 bg-transparent p-0 ${showToolbar ? 'mt-4' : ''} md:px-8 md:pb-8 font-ui text-[15px] leading-relaxed outline-none focus:ring-0 ${minHeightClass} overflow-hidden`}
      />
    </div>
  );
}
