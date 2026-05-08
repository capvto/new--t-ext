'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, historyKeymap } from '@codemirror/commands';
import { MarkdownToolbar } from '@/components/editor/MarkdownToolbar';
import { applyMarkdownFormat, type FormatType } from '@/components/editor/editorCommands';
import { wordCount } from '@/lib/markdown';
import { readSettings } from '@/lib/appearance';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  minHeightClass?: string;
};

const textEditorTheme = EditorView.theme({
  '&': {
    background: 'transparent !important',
    backgroundColor: 'transparent !important',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-family-mono)',
    fontSize: '14px',
    height: '100%'
  },
  '&.cm-focused': { outline: 'none !important' },
  '.cm-scroller': {
    fontFamily: 'inherit',
    overflow: 'auto',
    lineHeight: '1.65'
  },
  '.cm-content': {
    padding: '0',
    caretColor: 'var(--color-primary)'
  },
  '.cm-line': { padding: '0' },
  '.cm-gutters': {
    background: 'transparent !important',
    backgroundColor: 'transparent !important',
    color: 'var(--color-text-faint)',
    border: '0'
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-primary)' },
  '.cm-selectionBackground': {
    background: 'var(--color-primary-c) !important'
  },
  '.cm-activeLine': { backgroundColor: 'transparent !important' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent !important' }
}, { dark: true });

export function MarkdownEditor({ value, onChange, minHeightClass = 'min-h-[520px]' }: MarkdownEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    setShowToolbar(readSettings().showToolbar);

    function handleSettingsChange(e: Event) {
      setShowToolbar((e as CustomEvent).detail.showToolbar);
    }

    window.addEventListener('text_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('text_settings_changed', handleSettingsChange);
  }, []);

  const handleFormat = useCallback((type: FormatType) => {
    const view = editorRef.current?.view;
    if (!view) return;
    applyMarkdownFormat(view, type);
  }, []);

  const extensions = [
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    textEditorTheme,
    EditorView.lineWrapping,
    keymap.of([...defaultKeymap, ...historyKeymap])
  ];

  return (
    <div className="flex flex-col w-full h-full">
      {showToolbar && (
        <MarkdownToolbar onFormat={handleFormat} wordCount={wordCount(value)} />
      )}
      <div className={`text-editor-wrapper w-full ${showToolbar ? 'mt-4' : ''} md:px-8 md:pb-8 ${minHeightClass}`}>
        <CodeMirror
          ref={editorRef}
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme="none"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: false,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            highlightSelectionMatches: false,
            syntaxHighlighting: true,
            searchKeymap: false
          }}
          spellCheck
          className="text-editor-cm"
        />
      </div>
    </div>
  );
}
