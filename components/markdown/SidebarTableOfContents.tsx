'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/markdown';

type Props = { items: TocItem[] };

// After mount, read the actual heading IDs from the rendered DOM so that
// TOC links always point to the right anchors regardless of slug differences
// between toc.ts and remarkCustomHeadingIds.
function resolveIdsFromDom(items: TocItem[]): TocItem[] {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>('.prose-content h2, .prose-content h3, .prose-content h4')
  ).filter(h => h.id);

  let i = 0;
  function resolve(nodes: TocItem[]): TocItem[] {
    return nodes.map(item => ({
      ...item,
      id: headings[i++]?.id ?? item.id,
      children: item.children?.length ? resolve(item.children) : item.children,
    }));
  }
  return resolve(items);
}

function TocList({ items, activeId }: { items: TocItem[]; activeId: string | null }) {
  return (
    <ol>
      {items.map(item => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={item.id === activeId ? 'sidebar-toc-active' : undefined}
          >
            {item.text}
          </a>
          {item.children && item.children.length > 0 && (
            <TocList items={item.children} activeId={activeId} />
          )}
        </li>
      ))}
    </ol>
  );
}

export function SidebarTableOfContents({ items }: Props) {
  const [resolved, setResolved] = useState<TocItem[]>(items);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Resolve real DOM heading IDs after hydration.
  useEffect(() => {
    setResolved(resolveIdsFromDom(items));
  }, [items]);

  // Track which heading is in view, relative to the nearest scroll ancestor.
  useEffect(() => {
    const flat = resolved.flatMap(function collect(item): TocItem[] {
      return [item, ...(item.children ?? []).flatMap(collect)];
    });
    const ids = flat.map(item => item.id);

    // Support both page-level scroll (published) and panel scroll (editor preview).
    const panel = document.querySelector<HTMLElement>('.preview-panel');
    const scrollEl: EventTarget = panel ?? window;
    const getTop = (el: HTMLElement) =>
      panel
        ? el.getBoundingClientRect().top - panel.getBoundingClientRect().top
        : el.getBoundingClientRect().top;

    function update() {
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (getTop(el) <= 120) current = id;
      }
      setActiveId(current);
    }

    scrollEl.addEventListener('scroll', update, { passive: true });
    update();
    return () => scrollEl.removeEventListener('scroll', update);
  }, [resolved]);

  return (
    <nav className="sidebar-toc" aria-label="Table of contents">
      <div className="sidebar-toc-title">Contents</div>
      <TocList items={resolved} activeId={activeId} />
    </nav>
  );
}
