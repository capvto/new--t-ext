'use client';

import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return <MarkdownRenderer content={content} className={className} />;
}
