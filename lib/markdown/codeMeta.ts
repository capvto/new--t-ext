const ALLOWED_COLORS = ['neutral', 'blue', 'purple', 'green', 'yellow', 'red', 'pink'] as const;
export type CodeCardColor = (typeof ALLOWED_COLORS)[number];

export type CodeBlockMeta = {
  title?: string;
  highlightedLines: Set<number>;
  showLineNumbers: boolean;
  color: CodeCardColor;
  diff: boolean;
};

function parseLineRanges(raw: string): Set<number> {
  const result = new Set<number>();
  const parts = raw.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      if (n > 0 && n <= 10000) result.add(n);
    } else {
      const rangeMatch = /^(\d+)-(\d+)$/.exec(trimmed);
      if (rangeMatch) {
        const from = parseInt(rangeMatch[1], 10);
        const to = parseInt(rangeMatch[2], 10);
        if (from > 0 && to >= from && to <= 10000) {
          for (let i = from; i <= to; i++) result.add(i);
        }
      }
    }
  }
  return result;
}

export function parseCodeBlockMeta(metaString: string | null | undefined): CodeBlockMeta {
  const result: CodeBlockMeta = {
    highlightedLines: new Set(),
    showLineNumbers: false,
    color: 'neutral',
    diff: false
  };

  if (!metaString) return result;

  // title="..."
  const titleMatch = /title="([^"]{0,120})"/.exec(metaString);
  if (titleMatch) result.title = titleMatch[1];

  // {1,3-5}
  const lineHighlightMatch = /\{([0-9,\s-]+)\}/.exec(metaString);
  if (lineHighlightMatch) result.highlightedLines = parseLineRanges(lineHighlightMatch[1]);

  // lineNumbers
  if (/\blineNumbers\b/.test(metaString)) result.showLineNumbers = true;

  // color="purple"
  const colorMatch = /color="([a-z]+)"/.exec(metaString);
  if (colorMatch && (ALLOWED_COLORS as readonly string[]).includes(colorMatch[1])) {
    result.color = colorMatch[1] as CodeCardColor;
  }

  // diff
  if (/\bdiff\b/.test(metaString)) result.diff = true;

  return result;
}
