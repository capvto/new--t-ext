'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { normalizeMarkdownUrl, markdownSanitizeSchema, getMarkdownToc } from '@/lib/markdown';
import { remarkEmojiShortcodes } from '@/lib/markdown/plugins/remarkEmojiShortcodes';
import { remarkAlerts } from '@/lib/markdown/plugins/remarkAlerts';
import { remarkCustomHeadingIds } from '@/lib/markdown/plugins/remarkCustomHeadingIds';
import { remarkTocPlaceholder } from '@/lib/markdown/plugins/remarkTocPlaceholder';
import { MarkdownImage } from './MarkdownImage';
import { CodeBlock, InlineCode } from './CodeBlock';
import { TableOfContents } from './TableOfContents';
import type { Components } from 'react-markdown';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

function HeadingWithAnchor({ level, id, children, ...props }: { level: 1 | 2 | 3 | 4; id?: string; children?: React.ReactNode; [key: string]: unknown }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <Tag id={id} {...props}>
      {children}
      {id && (
        <a className="heading-anchor" href={`#${id}`} aria-label="Link to section">#</a>
      )}
    </Tag>
  );
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const toc = getMarkdownToc(content);

  const components: Components = {
    a({ href, children, ...props }) {
      const normalized = normalizeMarkdownUrl(href);
      if (!normalized) return <span>{children}</span>;
      const external = /^https?:\/\//i.test(normalized);
      return (
        <a
          href={normalized}
          rel={external ? 'noreferrer noopener' : undefined}
          target={external ? '_blank' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },

    img({ src, alt, title }) {
      return <MarkdownImage src={typeof src === 'string' ? src : undefined} alt={alt} title={title} />;
    },

    // @ts-expect-error: react-markdown passes node with meta for code fences
    code({ className: cls, children, node, inline, ...props }) {
      const value = String(children || '').replace(/\n$/, '');
      const langMatch = /language-([a-zA-Z0-9_-]+)/.exec(cls || '');
      const lang = langMatch ? langMatch[1] : null;
      const meta = node?.data?.meta as string | undefined ?? (node?.properties?.dataMeta as string | undefined);

      if (!inline && (lang || value.includes('\n'))) {
        return <CodeBlock lang={lang} meta={meta} value={value} />;
      }
      return <InlineCode {...props}>{children}</InlineCode>;
    },

    pre({ children }) {
      return <>{children}</>;
    },

    h1({ id, children, ...props }) {
      return <HeadingWithAnchor level={1} id={id as string | undefined} {...props}>{children}</HeadingWithAnchor>;
    },
    h2({ id, children, ...props }) {
      return <HeadingWithAnchor level={2} id={id as string | undefined} {...props}>{children}</HeadingWithAnchor>;
    },
    h3({ id, children, ...props }) {
      return <HeadingWithAnchor level={3} id={id as string | undefined} {...props}>{children}</HeadingWithAnchor>;
    },
    h4({ id, children, ...props }) {
      return <HeadingWithAnchor level={4} id={id as string | undefined} {...props}>{children}</HeadingWithAnchor>;
    },

    // Intercetta il placeholder [[toc]] (renderizzato come div.toc-placeholder)
    div({ className: cls, children, ...props }) {
      if (cls === 'toc-placeholder') {
        return <TableOfContents items={toc} />;
      }
      return <div className={cls} {...props}>{children}</div>;
    }
  };

  return (
    <div className={`prose-content ${className}`}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkAlerts,
          remarkEmojiShortcodes,
          remarkCustomHeadingIds,
          remarkTocPlaceholder
        ]}
        rehypePlugins={[
          [rehypeSanitize, markdownSanitizeSchema],
          rehypeKatex
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
