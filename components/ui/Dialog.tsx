'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Dialog({ open, title, children, onClose }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-dialog-overlay">
      <div className="w-full max-w-md border border-[var(--color-border)] bg-[var(--color-surface)] animate-dialog-content overflow-hidden" style={{ borderRadius: 'var(--radius-base)' }}>
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-ui text-sm font-500 text-[var(--color-text)]">{title}</h2>
          <Button variant="ghost" className="h-8 w-8 px-0" onClick={onClose} aria-label="Close dialog">
            <X size={16} strokeWidth={1.5} />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
