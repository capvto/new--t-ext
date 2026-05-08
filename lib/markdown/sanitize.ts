import { defaultSchema } from 'rehype-sanitize';

export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className', /^language-[a-zA-Z0-9_-]+$/, /^hljs/]
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['className', 'math-inline', 'math-display', 'math']
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ['className', 'math-inline', 'math-display', 'math', 'callout', 'callout-note', 'callout-info', 'callout-tip', 'callout-success', 'callout-warning', 'callout-danger', 'callout-title', 'callout-body']
    ],
    h1: [...(defaultSchema.attributes?.h1 || []), 'id'],
    h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
    h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
    h4: [...(defaultSchema.attributes?.h4 || []), 'id'],
    h5: [...(defaultSchema.attributes?.h5 || []), 'id'],
    h6: [...(defaultSchema.attributes?.h6 || []), 'id'],
    input: [
      ...(defaultSchema.attributes?.input || []),
      ['type', 'checkbox'],
      'checked',
      'disabled'
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      'href',
      'title',
      'target',
      'rel',
      'aria-label'
    ],
    img: ['src', 'alt', 'title', 'loading', 'decoding'],
    nav: [['className', 'markdown-toc']],
    ol: [['className', 'markdown-toc-list']],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'input',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'u',
    'nav'
  ]
};
