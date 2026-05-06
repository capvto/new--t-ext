export type Appearance = {
  theme: 'dark' | 'light';
  typeface: 'serif' | 'sans' | 'mono';
  fontSize: number;
  lineHeight: number;
  accent: string;
  minimal: boolean;
  showToolbar: boolean;
  borderRadius: number;
};

export const KEY = 'text_appearance';

export const DEFAULTS: Appearance = {
  theme: 'dark',
  typeface: 'serif',
  fontSize: 18,
  lineHeight: 1.65,
  accent: '#7170d6',
  minimal: true,
  showToolbar: false,
  borderRadius: 10
};

export const families: Record<Appearance['typeface'], string> = {
  serif: '"Newsreader", Georgia, Cambria, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
};

export function readSettings(): Appearance {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function applySettings(settings: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.style.setProperty('--font-family-content', families[settings.typeface]);
  root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
  root.style.setProperty('--line-height-base', String(settings.lineHeight));
  root.style.setProperty('--accent-color', settings.accent);
  root.style.setProperty('--color-primary-c', settings.accent);
  root.style.setProperty('--radius-base', `${settings.borderRadius}px`);
}
