# (t)ext 2.0

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Version](https://img.shields.io/badge/version-2.0.1-7170d6?style=flat-square)

**(t)ext** is a minimal, self-hosted Markdown editor and publishing platform. Write, set a secret edit code, and publish to a custom URL — no account required.

---

## Features

- **Distraction-free editor** — CodeMirror 6 with native Markdown syntax highlighting and full undo/redo history
- **Live preview** — Side-by-side rendering that mirrors the public page exactly
- **Advanced Markdown** — Emoji shortcodes (`!rocket!` → 🚀), callout blocks (`:::info`, `:::warning`), custom heading IDs, inline table of contents (`[[toc]]`), and protocol-less link normalisation
- **Advanced code blocks** — Language badge, filename header, optional line numbers, line highlighting, colour variants, diff styling
- **Safe by default** — Raw HTML stripped, dangerous URL protocols blocked, bcrypt-hashed edit codes, Zod-validated inputs
- **Autosave** — Local drafts for unpublished notes; debounced server autosave for published notes
- **Import / Export** — Load from or save to `.md` files directly from the toolbar
- **Change edit code** — Rotate the edit code from the edit view without losing access to the note
- **Math support** — KaTeX for inline and block LaTeX expressions
- **Self-hosted & private** — SQLite, no external services, no tracking

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Markdown | react-markdown + remark/rehype pipeline |
| Database | SQLite via `@libsql/client` |
| Animations | Framer Motion |
| Security | bcryptjs · Zod · rehype-sanitize |

---

## Getting Started

### Docker (recommended)

```bash
git clone https://github.com/capvto/new--t-ext.git
cd new--t-ext
cp .env.example .env
docker compose up -d
```

Open `http://localhost:3000`. Data is persisted in `./data`.

### Local development

```bash
npm install
npm run dev
```

---

## Markdown syntax

### Callout blocks

```md
:::info
Informational note.
:::

:::warning Heads up
Something to pay attention to.
:::
```

Supported types: `info`, `note`, `tip`, `success`, `warning`, `danger`  
Aliases: `warn`, `error`, `ok`, `caution`, `important`

GitHub-style alerts are also supported:

```md
> [!NOTE]
> Text here.
```

### Emoji shortcodes

```md
!rocket!  →  🚀
!100!     →  💯
!fire!    →  🔥
!check!   →  ✅
```

Escape with `\!rocket!` to prevent substitution. Shortcodes inside code blocks are never transformed.

### Custom heading IDs

```md
## My Section {#my-section}
```

### Table of contents

```md
[[toc]]
```

### Advanced code blocks

````md
```tsx title="components/Button.tsx" {2,5-7} lineNumbers color="purple"
export function Button() {
  return <button>Click me</button>;
}
```
````

Options: `title="..."` · `{lines}` · `lineNumbers` · `color="blue|purple|green|yellow|red|pink|neutral"` · `diff`

### Protocol-less links

```md
[My site](example.com)  →  https://example.com
```

`javascript:`, `data:`, and `vbscript:` URLs are blocked.

---

## Configuration

See `.env.example`:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3000`) |
| `DATA_DIR` | Directory for the SQLite database |
| `SQLITE_PATH` | Full path to the `.db` file |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash to enable the admin dashboard |
| `IP_HASH_SALT` | Salt for IP anonymisation |
| `BCRYPT_ROUNDS` | Bcrypt work factor (default `12`) |

---

## Security

- Edit codes are bcrypt-hashed and never stored in plain text
- All Markdown HTML is stripped (`skipHtml`) — no raw HTML execution
- URLs are validated and normalised before rendering
- Inputs are validated server-side with Zod
- Rate limiting on edit, delete, and code-change endpoints
- IP addresses are hashed before storage

---

Developed by [Matteo Caputo](https://matteocaputo.dev).
