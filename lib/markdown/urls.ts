const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

export function normalizeMarkdownUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (!href) return null;

  const lower = href.toLowerCase();
  if (DANGEROUS_PROTOCOLS.some((p) => lower.startsWith(p))) return null;

  if (
    href.startsWith('#') ||
    href.startsWith('/') ||
    href.startsWith('./') ||
    href.startsWith('../') ||
    href.startsWith('mailto:')
  ) {
    return href;
  }

  if (/^https?:\/\//i.test(href)) return href;

  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(href)) {
    return `https://${href}`;
  }

  return null;
}

export function isSafeUrl(value: unknown) {
  return normalizeMarkdownUrl(value) !== null;
}
