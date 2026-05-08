'use client';

import { normalizeMarkdownUrl } from '@/lib/markdown';

type MarkdownImageProps = {
  src?: string;
  alt?: string;
  title?: string;
};

export function MarkdownImage({ src, alt, title }: MarkdownImageProps) {
  const normalizedSrc = normalizeMarkdownUrl(src);
  if (!normalizedSrc) {
    return <span className="broken-image">[invalid image]</span>;
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt || ''}
      title={title}
      loading="lazy"
      decoding="async"
    />
  );
}
