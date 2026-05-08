import { visit } from 'unist-util-visit';
import type { Root, Blockquote, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';
import type { ContainerDirective } from 'mdast-util-directive';

const ALLOWED_TYPES = ['note', 'info', 'tip', 'success', 'warning', 'danger'] as const;
type AlertType = (typeof ALLOWED_TYPES)[number];

// Aliases: warn → warning, error → danger, ok → success
const TYPE_ALIASES: Record<string, AlertType> = {
  warn: 'warning',
  error: 'danger',
  ok: 'success',
  caution: 'warning',
  important: 'info'
};

function resolveType(raw: string): AlertType | null {
  const lower = raw.toLowerCase();
  if ((ALLOWED_TYPES as readonly string[]).includes(lower)) return lower as AlertType;
  return TYPE_ALIASES[lower] ?? null;
}

function defaultTitle(type: AlertType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const remarkAlerts: Plugin<[], Root> = () => {
  return (tree) => {
    // Handle :::type Title\n...\n::: via remark-directive
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      const type = resolveType(node.name);
      if (!type) return;

      let alertTitle = defaultTitle(type);
      const firstChild = node.children[0];
      if (
        firstChild?.type === 'paragraph' &&
        (firstChild as { data?: { directiveLabel?: boolean } }).data?.directiveLabel
      ) {
        const textNode = (firstChild as Paragraph).children[0];
        if (textNode?.type === 'text') {
          alertTitle = (textNode as Text).value;
          node.children.shift();
        }
      }

      node.data = {
        hName: 'div',
        hProperties: { className: ['callout', `callout-${type}`] }
      };

      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'div', hProperties: { className: ['callout-title'] } },
        children: [{ type: 'text', value: alertTitle }]
      } as Parameters<typeof node.children.unshift>[0]);
    });

    // Handle GitHub-style > [!TYPE]
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const firstChild = node.children[0];
      if (firstChild?.type !== 'paragraph') return;

      const firstText = (firstChild as Paragraph).children[0];
      if (firstText?.type !== 'text') return;

      const match = /^\[!([A-Z]+)\]\n?/i.exec((firstText as Text).value);
      if (!match) return;

      const type = resolveType(match[1]);
      if (!type) return;

      const remaining = (firstText as Text).value.slice(match[0].length);
      const newChildren = [...(firstChild as Paragraph).children];
      if (remaining.trim()) {
        newChildren[0] = { type: 'text', value: remaining } as Text;
      } else {
        newChildren.shift();
      }

      const bodyChildren = newChildren.length > 0
        ? [{ ...firstChild, children: newChildren }, ...node.children.slice(1)]
        : node.children.slice(1);

      parent.children[index] = {
        type: 'blockquote',
        data: {
          hName: 'div',
          hProperties: { className: ['callout', `callout-${type}`] }
        },
        children: [
          {
            type: 'paragraph',
            data: { hName: 'div', hProperties: { className: ['callout-title'] } },
            children: [{ type: 'text', value: defaultTitle(type) }]
          },
          ...bodyChildren
        ]
      } as Blockquote;
    });
  };
};
