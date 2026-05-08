import { visit } from 'unist-util-visit';
import type { Root, Text } from 'mdast';
import type { Plugin } from 'unified';
import { EMOJI_SHORTCODES } from '../emoji';

const EMOJI_REGEX = /\\!([a-zA-Z0-9]+)!|!([a-zA-Z0-9]+)!/g;

export const remarkEmojiShortcodes: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (!node.value.includes('!')) return;

      const parts: Array<{ type: 'text'; value: string } | { type: 'emoji'; value: string }> = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      EMOJI_REGEX.lastIndex = 0;
      while ((match = EMOJI_REGEX.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }

        if (match[1]) {
          // escaped: \!key! → keep as literal !key!
          parts.push({ type: 'text', value: `!${match[1]}!` });
        } else if (match[2]) {
          const emoji = EMOJI_SHORTCODES[match[2]];
          if (emoji) {
            parts.push({ type: 'emoji', value: emoji });
          } else {
            parts.push({ type: 'text', value: match[0] });
          }
        }

        lastIndex = match.index + match[0].length;
      }

      if (parts.length === 0) return;
      if (lastIndex < node.value.length) {
        parts.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      const newNodes: Text[] = parts.map((p) => ({ type: 'text', value: p.value } as Text));
      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
};
