export const RESERVED_SLUGS = new Set([
  'new',
  'edit',
  'api',
  'admin',
  'login',
  'settings',
  'archive',
  'about',
  'privacy',
  'health',
  'assets',
  'static',
  '_admin',
  '_next',
  'favicon.svg'
]);

export function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(normalizeSlug(slug));
}

export function slugError(value: string) {
  const slug = normalizeSlug(value);

  if (slug.length < 3) return 'Slug must be at least 3 characters.';
  if (slug.length > 64) return 'Slug must be 64 characters or fewer.';
  if (!/^[a-z0-9_-]+$/.test(slug)) {
    return 'Slug can only contain lowercase letters, numbers, hyphens and underscores.';
  }
  if (isReservedSlug(slug)) return 'This slug is reserved.';

  return null;
}

export function isValidSlug(value: string) {
  return slugError(value) === null;
}
