export function markdownExcerpt(markdown: string, maxLength = 160): string {
  const text = markdown
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]{1,3}([^*_~\n]+)[*_~]{1,3}/g, '$1')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();

  const firstLine = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 20) ?? text.slice(0, maxLength);

  return firstLine.length > maxLength ? firstLine.slice(0, maxLength - 1) + '…' : firstLine;
}
