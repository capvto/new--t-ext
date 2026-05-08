import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { Root, Heading, Text } from 'mdast';
import type { Plugin } from 'unified';

const CUSTOM_ID_REGEX = / \{#([a-zA-Z][a-zA-Z0-9_-]*)\}$/;

export const remarkCustomHeadingIds: Plugin<[], Root> = () => {
  return (tree) => {
    const slugger = new GithubSlugger();

    visit(tree, 'heading', (node: Heading) => {
      const lastChild = node.children[node.children.length - 1];
      let customId: string | null = null;

      if (lastChild?.type === 'text') {
        const match = CUSTOM_ID_REGEX.exec((lastChild as Text).value);
        if (match) {
          customId = match[1];
          const newValue = (lastChild as Text).value.slice(0, match.index);
          if (newValue) {
            (lastChild as Text).value = newValue;
          } else {
            node.children.pop();
          }
        }
      }

      const textContent = node.children
        .filter((c) => c.type === 'text')
        .map((c) => (c as Text).value)
        .join('');

      const id = customId || slugger.slug(textContent);

      if (!node.data) node.data = {};
      if (!node.data.hProperties) node.data.hProperties = {};
      (node.data.hProperties as Record<string, unknown>).id = id;
    });
  };
};
