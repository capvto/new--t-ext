import type { EditorView } from '@codemirror/view';
import { undo, redo } from '@codemirror/commands';

export type FormatType =
  | 'h2'
  | 'h3'
  | 'bold'
  | 'italic'
  | 'code'
  | 'blockquote'
  | 'link'
  | 'ul'
  | 'ol'
  | 'task'
  | 'codeblock'
  | 'hr'
  | 'image'
  | 'toc'
  | 'alert'
  | 'undo'
  | 'redo';

// Wrap selection with markers; if no selection, place cursor between markers
function wrapSelection(view: EditorView, before: string, after: string) {
  const { state } = view;
  const sel = state.selection.main;
  const selected = state.sliceDoc(sel.from, sel.to);
  const insert = `${before}${selected}${after}`;
  const cursorAt = sel.from + before.length + selected.length;

  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: { anchor: sel.from + before.length, head: cursorAt }
  });
  view.focus();
}

function prefixLines(view: EditorView, getPrefix: (line: string, index: number) => string, remove?: RegExp) {
  const { state } = view;
  const sel = state.selection.main;
  const fromLine = state.doc.lineAt(sel.from);
  const toLine = state.doc.lineAt(sel.to);

  const changes: { from: number; to: number; insert: string }[] = [];

  for (let ln = fromLine.number; ln <= toLine.number; ln++) {
    const line = state.doc.line(ln);
    if (remove && remove.test(line.text)) {
      const match = remove.exec(line.text)!;
      changes.push({ from: line.from, to: line.from + match[0].length, insert: '' });
    } else {
      const prefix = getPrefix(line.text, ln - fromLine.number);
      changes.push({ from: line.from, to: line.from, insert: prefix });
    }
  }

  view.dispatch({ changes });
  view.focus();
}

export function applyMarkdownFormat(view: EditorView, type: FormatType): void {
  switch (type) {
    case 'undo':
      undo(view);
      view.focus();
      return;
    case 'redo':
      redo(view);
      view.focus();
      return;
    case 'h2':
      prefixLines(view, () => '## ', /^##\s/);
      return;
    case 'h3':
      prefixLines(view, () => '### ', /^###\s/);
      return;
    case 'bold':
      wrapSelection(view, '**', '**');
      return;
    case 'italic':
      wrapSelection(view, '*', '*');
      return;
    case 'code':
      wrapSelection(view, '`', '`');
      return;
    case 'blockquote':
      prefixLines(view, () => '> ', /^>\s/);
      return;
    case 'link': {
      const { state } = view;
      const sel = state.selection.main;
      const selected = state.sliceDoc(sel.from, sel.to);
      const insert = selected ? `[${selected}]()` : `[]()`;
      // place cursor inside the parens
      const cursorAt = sel.from + insert.length - 1;
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert },
        selection: { anchor: cursorAt, head: cursorAt }
      });
      view.focus();
      return;
    }
    case 'image': {
      const { state } = view;
      const sel = state.selection.main;
      const selected = state.sliceDoc(sel.from, sel.to);
      const insert = selected ? `![${selected}]()` : `![]()`;
      const cursorAt = sel.from + insert.length - 1;
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert },
        selection: { anchor: cursorAt, head: cursorAt }
      });
      view.focus();
      return;
    }
    case 'ul':
      prefixLines(view, () => '- ', /^-\s/);
      return;
    case 'ol':
      prefixLines(view, (_line, i) => `${i + 1}. `, /^\d+\.\s/);
      return;
    case 'task':
      prefixLines(view, () => '- [ ] ', /^-\s\[[\sx]\]\s/);
      return;
    case 'codeblock': {
      const { state } = view;
      const sel = state.selection.main;
      const selected = state.sliceDoc(sel.from, sel.to);
      const insert = selected ? `\`\`\`\n${selected}\n\`\`\`` : `\`\`\`\n\n\`\`\``;
      const cursorAt = selected ? sel.from + insert.length : sel.from + 4;
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert },
        selection: { anchor: cursorAt }
      });
      view.focus();
      return;
    }
    case 'hr': {
      const { state } = view;
      const sel = state.selection.main;
      const line = state.doc.lineAt(sel.from);
      const insert = line.text ? '\n\n---\n\n' : '\n---\n\n';
      view.dispatch({
        changes: { from: sel.to, to: sel.to, insert },
        selection: { anchor: sel.to + insert.length }
      });
      view.focus();
      return;
    }
    case 'toc': {
      const { state } = view;
      const sel = state.selection.main;
      const line = state.doc.lineAt(sel.from);
      const insert = line.text ? '\n\n[[toc]]\n\n' : '[[toc]]\n\n';
      view.dispatch({ changes: { from: sel.to, to: sel.to, insert } });
      view.focus();
      return;
    }
    case 'alert': {
      const { state } = view;
      const sel = state.selection.main;
      const line = state.doc.lineAt(sel.from);
      const prefix = line.text ? '\n\n' : '';
      const body = ':::info\n\n:::';
      const insert = prefix + body + '\n';
      // cursor on the empty line inside: after ":::info\n"
      const cursorAt = sel.to + prefix.length + 8;
      view.dispatch({
        changes: { from: sel.to, to: sel.to, insert },
        selection: { anchor: cursorAt }
      });
      view.focus();
      return;
    }
  }
}
