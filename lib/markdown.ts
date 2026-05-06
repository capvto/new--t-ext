import { defaultSchema } from 'rehype-sanitize';

export const MAX_CONTENT_LENGTH = 200_000;
export const MAX_TITLE_LENGTH = 120;

export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className', /^language-[a-zA-Z0-9_-]+$/]
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['className', 'math-inline', 'math-display', 'math']
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ['className', 'math-inline', 'math-display', 'math']
    ],
    input: [
      ...(defaultSchema.attributes?.input || []),
      ['type', 'checkbox'],
      'checked',
      'disabled'
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      'href',
      'title',
      'target',
      'rel'
    ]
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'input',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'u'
  ]
};

export function isSafeUrl(value: unknown) {
  if (typeof value !== 'string') return false;
  const href = value.trim();
  if (!href) return false;
  if (href.startsWith('#') || href.startsWith('/')) return true;

  try {
    const url = new URL(href);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function extractTitle(markdown: string) {
  const firstHeading = markdown
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /^#\s+/.test(line));

  const candidate =
    firstHeading?.replace(/^#\s+/, '') ||
    markdown
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ||
    null;

  if (!candidate) return null;
  return stripMarkdownInline(candidate).slice(0, MAX_TITLE_LENGTH);
}

export function stripMarkdownInline(value: string) {
  return value
    .replace(/[`*_~>#\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(value: string) {
  const matches = value.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}
