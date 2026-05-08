// Barrel file — mantiene compatibilità con import esistenti
export * from './markdown/constants';
export * from './markdown/urls';
export * from './markdown/sanitize';
export * from './markdown/emoji';
export * from './markdown/toc';
export * from './markdown/codeMeta';

export function extractTitle(markdown: string) {
  const MAX_TITLE_LENGTH = 120;
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
