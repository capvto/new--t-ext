'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';
import { parseCodeBlockMeta } from '@/lib/markdown';
import type { CodeCardColor } from '@/lib/markdown';

type CodeBlockProps = {
  lang?: string | null;
  meta?: string | null;
  value: string;
};

const COLOR_CLASSES: Record<CodeCardColor, string> = {
  neutral: 'code-card-neutral',
  blue: 'code-card-blue',
  purple: 'code-card-purple',
  green: 'code-card-green',
  yellow: 'code-card-yellow',
  red: 'code-card-red',
  pink: 'code-card-pink'
};

export function CodeBlock({ lang, meta, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const blockMeta = parseCodeBlockMeta(meta);

  const highlighted = lang && hljs.getLanguage(lang)
    ? hljs.highlight(value, { language: lang }).value
    : value.includes('\n')
      ? hljs.highlightAuto(value).value
      : null;

  const lines = (highlighted ?? value).split('\n');
  if (lines[lines.length - 1] === '') lines.pop();

  const showHeader = !!(lang || blockMeta.title);
  const colorClass = COLOR_CLASSES[blockMeta.color];

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`code-card ${colorClass}`}>
      {showHeader && (
        <div className="code-card-header">
          <div className="flex items-center gap-2 min-w-0">
            {blockMeta.title && (
              <span className="code-card-title">{blockMeta.title}</span>
            )}
            {lang && (
              <span className="code-card-lang">{lang}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="code-card-copy"
            title="Copy code"
          >
            {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
          </button>
        </div>
      )}
      <div className="relative group">
        {!showHeader && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-soft)] hover:text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Copy code"
          >
            {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
          </button>
        )}
        <pre className={showHeader ? 'code-card-pre' : ''}>
          <code className={`hljs${lang ? ` language-${lang}` : ''}`}>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = blockMeta.highlightedLines.has(lineNum);
              const isDiff = blockMeta.diff && (line.startsWith('+') || line.startsWith('-'));

              return (
                <span
                  key={i}
                  className={[
                    'code-line',
                    isHighlighted ? 'is-highlighted' : '',
                    isDiff && line.startsWith('+') ? 'diff-add' : '',
                    isDiff && line.startsWith('-') ? 'diff-del' : ''
                  ].filter(Boolean).join(' ')}
                  data-line={blockMeta.showLineNumbers ? String(lineNum) : undefined}
                  dangerouslySetInnerHTML={{ __html: line || '&#8203;' }}
                />
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code (non-block)
export function InlineCode({ children }: { children?: React.ReactNode }) {
  return <code>{children}</code>;
}
