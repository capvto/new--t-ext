import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'ghost', type = 'button', ...props },
  ref
) {
  const variants = {
    primary:
      'bg-[var(--color-primary-c)] text-[var(--color-on-accent)] hover:opacity-85 disabled:opacity-50 transition-opacity',
    ghost:
      'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-50 transition-colors',
    danger:
      'bg-transparent text-[var(--color-danger)] hover:text-[var(--color-danger)] disabled:opacity-50 transition-colors'
  };

  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-2 border-0 px-3 py-2 font-ui text-sm font-500 ${variants[variant]} ${className}`}
      style={{ borderRadius: 'var(--radius-base)' }}
      {...props}
    />
  );
});
