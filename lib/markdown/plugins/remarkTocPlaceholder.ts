import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';

// Trasforma righe [[toc]] in nodi custom che MarkdownRenderer intercetta
export const remarkTocPlaceholder: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.children.length !== 1) return;
      const child = node.children[0];
      if (child.type !== 'text') return;
      if ((child as Text).value.trim() !== '[[toc]]') return;

      const tocNode = {
        type: 'toc-placeholder',
        data: {
          hName: 'div',
          hProperties: { className: ['toc-placeholder'], 'data-toc': 'true' }
        },
        children: []
      };

      parent.children.splice(index, 1, tocNode as Parameters<typeof parent.children.splice>[2]);
      return index + 1;
    });
  };
};
