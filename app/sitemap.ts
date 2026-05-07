import type { MetadataRoute } from 'next';
import { listPublicSlugs } from '@/lib/db';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notes = await listPublicSlugs();
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/archive`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    ...notes.map((note) => ({
      url: `${siteUrl}/${note.slug}`,
      lastModified: new Date(note.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  ];
}
