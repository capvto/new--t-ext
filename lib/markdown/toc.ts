import GithubSlugger from 'github-slugger';

export type TocItem = {
  depth: 2 | 3 | 4;
  id: string;
  text: string;
  children?: TocItem[];
};

// Mirrors remarkCustomHeadingIds: only outer text nodes count toward the slug.
// Bold/italic/code/image nodes are filtered out by the remark AST visitor,
// so we strip their content here; links become their anchor text.
function plainTextForSlug(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // images → gone
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '')     // links → gone (link node, not text node)
    .replace(/`[^`]*`/g, '')                   // inline code → gone
    .replace(/\*\*([^*]*)\*\*/g, '')           // bold → gone
    .replace(/__([^_]*)__/g, '')
    .replace(/\*([^*]*)\*/g, '')               // italic → gone
    .replace(/_([^_]*)_/g, '')
    .replace(/~~([^~]*)~~/g, '')               // strikethrough → gone
    .trim();
}

// Strip markdown syntax for display (keep the inner text).
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/__([^_]*)__/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/_([^_]*)_/g, '$1')
    .replace(/~~([^~]*)~~/g, '$1')
    .trim();
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
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  for (const line of lines) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const depth = match[1].length as 2 | 3 | 4;
    const rawText = match[2].trim();
    const { text, id: customId } = extractCustomId(rawText);
    const displayText = stripInlineMarkdown(text);

    // Custom IDs bypass the slugger (matching remarkCustomHeadingIds behavior).
    const id = customId ?? slugger.slug(plainTextForSlug(text));

    items.push({ depth, id, text: displayText });
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
