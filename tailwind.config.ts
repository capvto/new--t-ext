import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        ui: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        content: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif']
      },
      colors: {
        ink: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          low: 'var(--color-surface-low)',
          lowest: 'var(--color-surface-lowest)',
          high: 'var(--color-surface-high)',
          text: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          primary: 'var(--color-primary)',
          accent: 'var(--color-primary-c)'
        }
      },
      maxWidth: {
        article: '720px'
      }
    }
  },
  plugins: []
};

export default config;
