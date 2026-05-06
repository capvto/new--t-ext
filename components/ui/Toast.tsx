type ToastProps = {
  message: string | null;
  tone?: 'success' | 'error' | 'info';
};

export function Toast({ message, tone = 'info' }: ToastProps) {
  if (!message) return null;

  const colors = {
    success: 'border-[var(--color-success-border)] text-[var(--color-success)]',
    error: 'border-[var(--color-danger-border)] text-[var(--color-danger)]',
    info: 'border-[var(--color-border)] text-[var(--color-text-muted)]'
  };

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100vw-24px)] max-w-sm -translate-x-1/2 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 font-ui text-sm ${colors[tone]}`}
    >
      {message}
    </div>
  );
}
