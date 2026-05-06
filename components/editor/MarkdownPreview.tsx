'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import { Check, Copy } from 'lucide-react';
import { isSafeUrl, markdownSanitizeSchema } from '@/lib/markdown';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <div className={`prose-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema], rehypeKatex]}
        components={{
          a({ href, children, ...props }) {
            if (!isSafeUrl(href)) return <span>{children}</span>;
            const external = typeof href === 'string' && /^https?:\/\//.test(href);
            return (
              <a href={href} rel={external ? 'noreferrer noopener' : undefined} target={external ? '_blank' : undefined} {...props}>
                {children}
              </a>
            );
          },
          pre: function PreBlock({ children, className, ...props }: any) {
            const [copied, setCopied] = useState(false);
            // Since we're rendering on the client, we can use a ref to grab the text,
            // but during SSR it's safer to extract text from children for the clipboard if we needed it immediately.
            // However, copy only happens on the client on click.

            function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
              const pre = e.currentTarget.parentElement?.querySelector('pre');
              if (pre) {
                navigator.clipboard.writeText(pre.innerText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }

            return (
              <div className="relative group">
                <pre className={className} {...props}>
                  {children}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-soft)] hover:text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy code"
                >
                  {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.5} />}
                </button>
              </div>
            );
          },
          code: function CodeBlock({ className, children, ...props }: CodeProps) {
            const value = String(children || '').replace(/\n$/, '');
            const langMatch = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
            const lang = langMatch ? langMatch[1] : null;

            // Apply syntax highlighting if a language is specified or if it's a multiline block
            if (lang || value.includes('\n')) {
              const highlighted = lang && hljs.getLanguage(lang)
                ? hljs.highlight(value, { language: lang }).value
                : hljs.highlightAuto(value).value;

              return (
                <code
                  className={['hljs', className].filter(Boolean).join(' ')}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                  {...props}
                />
              );
            }

            // Plain inline code
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
