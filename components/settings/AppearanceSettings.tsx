'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { type Appearance, DEFAULTS, readSettings, applySettings } from '@/lib/appearance';

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

export function AppearanceBoot() {
  useEffect(() => {
    applySettings(readSettings());
  }, []);

  return null;
}

export function AppearanceSettings() {
  const [settings, setSettings] = useState<Appearance>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loaded = readSettings();
      setSettings(loaded);
      applySettings(loaded);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function update(next: Partial<Appearance>) {
    const merged = { ...settings, ...next };
    setSettings(merged);
    applySettings(merged);
    window.localStorage.setItem('text_appearance', JSON.stringify(merged));
    
    // Dispatch a custom event to immediately notify other components
    window.dispatchEvent(new CustomEvent('text_settings_changed', { detail: merged }));
    
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <motion.section
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Theme
          </div>
          <div className="p-5">
            <div className="flex bg-[var(--color-surface)] p-1 border border-[var(--color-border)] shadow-sm" style={{ borderRadius: 'calc(var(--radius-base) + 4px)' }}>
              {(['dark', 'light'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => update({ theme })}
                  className={`relative flex-1 px-4 py-2 text-sm z-10 transition-colors ${
                    settings.theme === theme ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-text-soft)] hover:text-[var(--color-text)]'
                  }`}
                  style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                >
                  <span className="relative z-10 font-ui font-medium">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                  {settings.theme === theme && (
                    <motion.div
                      layoutId="settings-theme"
                      className="absolute inset-0 bg-[var(--color-primary-c)] shadow-sm"
                      style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Typeface
          </div>
          <div className="p-5">
            <div className="flex bg-[var(--color-surface)] p-1 border border-[var(--color-border)] shadow-sm" style={{ borderRadius: 'calc(var(--radius-base) + 4px)' }}>
              {(['serif', 'sans', 'mono'] as const).map((typeface) => (
                <button
                  key={typeface}
                  type="button"
                  onClick={() => update({ typeface })}
                  className={`relative flex-1 px-4 py-2 text-sm z-10 transition-colors ${
                    settings.typeface === typeface ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-text-soft)] hover:text-[var(--color-text)]'
                  }`}
                  style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                >
                  <span className="relative z-10 font-ui font-medium">{typeface.charAt(0).toUpperCase() + typeface.slice(1)}</span>
                  {settings.typeface === typeface && (
                    <motion.div
                      layoutId="settings-typeface"
                      className="absolute inset-0 bg-[var(--color-primary-c)] shadow-sm"
                      style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Editor Tools
          </div>
          <div className="p-5">
            <div className="flex bg-[var(--color-surface)] p-1 border border-[var(--color-border)] shadow-sm" style={{ borderRadius: 'calc(var(--radius-base) + 4px)' }}>
              {([{ value: true, label: 'Show Toolbar' }, { value: false, label: 'Hide Toolbar' }] as const).map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => update({ showToolbar: opt.value })}
                  className={`relative flex-1 px-4 py-2 text-sm z-10 transition-colors ${
                    settings.showToolbar === opt.value ? 'text-[var(--color-on-accent)]' : 'text-[var(--color-text-soft)] hover:text-[var(--color-text)]'
                  }`}
                  style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                >
                  <span className="relative z-10 font-ui font-medium">{opt.label}</span>
                  {settings.showToolbar === opt.value && (
                    <motion.div
                      layoutId="settings-toolbar"
                      className="absolute inset-0 bg-[var(--color-primary-c)] shadow-sm"
                      style={{ borderRadius: 'calc(var(--radius-base) + 2px)' }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Reading
          </div>
          <div className="grid gap-5 p-5">
            <label>
              <div className="mb-3 flex justify-between">
                <span className="mono-label">Text size</span>
                <span className="font-ui text-xs text-[var(--color-text-soft)]">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="24"
                value={settings.fontSize}
                onChange={(event) => update({ fontSize: Number(event.target.value) })}
                className="w-full"
              />
            </label>
            <label>
              <div className="mb-3 flex justify-between">
                <span className="mono-label">Line height</span>
                <span className="font-ui text-xs text-[var(--color-text-soft)]">{settings.lineHeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.3"
                max="2"
                step="0.05"
                value={settings.lineHeight}
                onChange={(event) => update({ lineHeight: Number(event.target.value) })}
                className="w-full"
              />
            </label>
          </div>
        </motion.section>

        <motion.section
          custom={4}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Accent color
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-[auto_minmax(0,1fr)]">
            <input
              aria-label="Accent color"
              type="color"
              value={settings.accent}
              onChange={(event) => update({ accent: event.target.value })}
              className="h-10 w-16 border border-[var(--color-border)] bg-transparent"
            />
            <Input value={settings.accent} onChange={(event) => update({ accent: event.target.value })} />
          </div>
        </motion.section>

        <motion.section
          custom={5}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="border border-[var(--color-border)] bg-[var(--color-surface-lowest)] overflow-hidden"
          style={{ borderRadius: 'var(--radius-base)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 font-ui text-xs font-500 uppercase tracking-[0.05em]">
            Border Radius
          </div>
          <div className="grid gap-5 p-5">
            <label>
              <div className="mb-3 flex justify-between">
                <span className="mono-label">Roundness</span>
                <span className="font-ui text-xs text-[var(--color-text-soft)]">{settings.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                step="2"
                value={settings.borderRadius}
                onChange={(event) => update({ borderRadius: Number(event.target.value) })}
                className="w-full"
              />
            </label>
          </div>
        </motion.section>

        <motion.div
          custom={6}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className={`font-ui text-xs text-[var(--color-text-soft)] transition-opacity duration-300 ${saved ? 'opacity-100' : 'opacity-0'}`}
        >
          Saved
        </motion.div>
      </div>
    </div>
  );
}
