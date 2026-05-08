export type TocItem = {
  depth: 2 | 3 | 4;
  id: string;
  text: string;
  children?: TocItem[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractCustomId(text: string): { text: string; id: string | null } {
  const match = / \{#([a-zA-Z][a-zA-Z0-9_-]*)\}$/.exec(text);
  if (match) {
    return { text: text.slice(0, match.index), id: match[1] };
  }
  return { text, id: null };
}

export function getMarkdownToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const slugCounter = new Map<string, number>();
  const items: TocItem[] = [];

  for (const line of lines) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const depth = match[1].length as 2 | 3 | 4;
    const rawText = match[2].trim();
    const { text, id: customId } = extractCustomId(rawText);
    const cleanText = text.trim();

    const baseSlug = customId || slugify(cleanText);
    const count = slugCounter.get(baseSlug) || 0;
    slugCounter.set(baseSlug, count + 1);
    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    items.push({ depth, id, text: cleanText });
  }

  return buildTocTree(items);
}

function buildTocTree(flat: TocItem[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const item of flat) {
    const entry: TocItem = { ...item, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(entry);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(entry);
    }

    stack.push(entry);
  }

  return root;
}
