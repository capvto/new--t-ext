import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-8 text-center">
      <div className="flex flex-col items-center justify-center max-w-md gap-6 animate-dialog-content">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[var(--color-surface-high)] border border-[var(--color-border)] shadow-sm">
          <FileQuestion size={40} className="text-[var(--color-primary-c)]" strokeWidth={1.5} />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl md:text-5xl font-content text-[var(--color-text)] leading-tight tracking-tight">
            Note not found
          </h1>
          <p className="font-ui text-[14px] text-[var(--color-text-soft)] leading-relaxed">
            The note you are looking for seems to have vanished into the digital void. It might have been deleted, or the URL might be incorrect.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary-c)] text-[var(--color-on-accent)] hover:opacity-85 transition-opacity px-6 py-2.5 font-ui text-[14px] font-medium shadow-sm"
            style={{ borderRadius: 'var(--radius-base)' }}
          >
            <Home size={16} strokeWidth={2} />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
