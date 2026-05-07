# (t)ext 2.0

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)

**(t)ext** is a minimal, high-fidelity Markdown editor and publishing platform designed for writers who value privacy, simplicity, and speed. It follows a "publish-and-forget" flow inspired by Rentry: write, set a secret code, and publish to a custom URL without ever creating an account.

---

## ✨ Features

- **Minimalist Writing Experience**: A distraction-free editor with a clean, dark-first interface.
- **Local-First Archive**: Organize your drafts locally in your browser. No cloud account required.
- **Folder Organization**: Group your notes into folders with support for **Drag & Drop** organization.
- **Personalization**: Customize your folders with curated colors and distinct icons.
- **LaTeX & Math Support**: Full support for KaTeX to render complex mathematical equations.
- **Secure Publishing**: Each note is protected by a bcrypt-hashed edit code. Only you can modify or delete your content.
- **Import/Export**: Easily move your notes in and out of the app using standard `.md` files.
- **Self-Hosted & Private**: No external databases or tracking. Your data belongs to you.

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (via `libsql`)
- **Markdown**: React-Markdown with GFM, Math, and KaTeX support
- **Animations**: Framer Motion for UI transitions
- **Security**: Bcryptjs for secure code hashing, Zod for validation

---

## 🚀 Getting Started

### Using Docker (Recommended)

The easiest way to self-host **(t)ext** is using Docker Compose.

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/text.git
   cd text
   ```

2. Create your environment file:
   ```bash
   cp .env.example .env
   ```

3. Spin up the container:
   ```bash
   docker compose up -d
   ```

Access the app at `http://localhost:3000`. Your data will be persisted in the `./data` directory.

### Local Development

If you want to contribute or run it locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Folder System & Organization

(t)ext 2.0 introduces a robust local organizational system:
- **Drag & Drop**: Drag notes onto folders to categorize them.
- **Breadcrumb Navigation**: Seamlessly navigate through your hierarchy.
- **Customization**: Right-click or use the settings icon on a folder to change its color and icon.
- **All-Notes Drop**: Drag a note onto the "All Notes" breadcrumb to quickly move it out of a folder.

---

## 🛡 Security & Privacy

- **No Cookies**: (t)ext does not use tracking or profiling cookies.
- **Local Storage**: Your drafts and organization settings never leave your browser.
- **Hashed Codes**: Edit codes are never stored in plain text.
- **Sanitized Output**: All Markdown is sanitized to prevent XSS attacks.

---

## ⚙️ Configuration

Check `.env.example` for available configuration options:
- `PORT`: Change the default port.
- `DATA_DIR`: Customize where the SQLite database is stored.
- `ADMIN_PASSWORD_HASH`: Enable the optional admin dashboard to manage all published notes.

---

Developed by [Matteo Caputo](https://matteocaputo.dev).

