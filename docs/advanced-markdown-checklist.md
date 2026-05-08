# Advanced Markdown — Manual Test Checklist

## Pages to verify

- [ ] Editor page `/`
- [ ] Edit page `/:slug/edit`
- [ ] Public page `/:slug`

## Themes and devices

- [ ] Dark theme
- [ ] Light theme (`?theme=light`)
- [ ] Desktop
- [ ] Mobile

## Features

- [ ] Protocol-less links: `[site](example.com)` → `https://example.com`
- [ ] Dangerous links blocked: `[bad](javascript:alert(1))` renders as text
- [ ] External links open in new tab with `rel="noreferrer noopener"`
- [ ] Images load with `loading="lazy"`
- [ ] Broken image shows fallback text
- [ ] Emoji shortcodes: `!100!` → 💯, `!rocket!` → 🚀
- [ ] Escaped emoji: `\!100!` renders as `!100!`
- [ ] Emoji inside code not transformed: `` `!100!` ``
- [ ] Directive alerts: `:::info`, `:::warning Titolo`, `:::danger`
- [ ] GitHub-style alerts: `> [!NOTE]`, `> [!WARNING]`
- [ ] Custom heading ID: `## API {#api-v2}` → `id="api-v2"`, text "API"
- [ ] Auto slug: `## Hello World` → `id="hello-world"`
- [ ] Duplicate headings deduplicated: `intro`, `intro-1`
- [ ] Heading anchor link `#` appears on hover
- [ ] `[[toc]]` renders table of contents
- [ ] TOC hidden if fewer than 2 headings
- [ ] Code block: copy button works, copies raw code (no line numbers)
- [ ] Code block with `title="..."`: filename shown in header
- [ ] Code block with `lineNumbers`: line numbers visible
- [ ] Code block with `{2}`: line 2 highlighted
- [ ] Code block with `color="purple"`: purple border variant
- [ ] Diff code block: `+` lines green, `-` lines red
- [ ] Monospace font in code blocks and inline code
- [ ] Nested lists correct indentation
- [ ] Task list checkboxes
- [ ] HTML raw tags are stripped (no `<script>`, `<img onerror>`)
- [ ] Math KaTeX still renders: `$E=mc^2$`

## Flows

- [ ] Publish note → visible on public page
- [ ] Edit note → autosave works
- [ ] Change edit code → old code rejected, new code accepted
- [ ] Delete uses new code after code change
- [ ] Import/export `.md` file

## Tradeoffs documented

- Underline removed from toolbar (HTML raw stripped by `skipHtml`). Markdown puro non ha underline nativo.
- `<img>` nativo usato invece di `next/image` per supporto URL esterni arbitrari (warning ESLint ignorabile).
- `useEffect + setState` pattern pre-esistente mantenuto per compatibilità con `readSettings()` sincrono.
