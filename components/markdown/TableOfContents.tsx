'use client';

import type { TocItem } from '@/lib/markdown';

type TableOfContentsProps = {
  items: TocItem[];
};

function TocItemList({ items }: { items: TocItem[] }) {
  return (
    <ol>
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>{item.text}</a>
          {item.children && item.children.length > 0 && (
            <TocItemList items={item.children} />
          )}
        </li>
      ))}
    </ol>
  );
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length < 2) return null;

  return (
    <nav className="markdown-toc" aria-label="Table of contents">
      <div className="markdown-toc-title">Contents</div>
      <TocItemList items={items} />
    </nav>
  );
}
