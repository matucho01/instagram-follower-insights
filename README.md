# Instagram Follower Insights

Privacy-first analytics for Instagram follower exports. Upload the ZIP or JSON files that Instagram sends you, and this app will parse them entirely in your browser, surface metrics, highlight pending requests, and help you compare two snapshots over time—all without sending your data to a server.

> **Key promise:** files never leave your machine. Parsing, storage, and encryption all happen locally using IndexedDB + AES-GCM.

## ✨ Features

- **Offline parsing pipeline** – Uses a Web Worker (Comlink + JSZip + Papaparse) to ingest Instagram `followers.json`, `following.json`, and related request datasets with accurate username normalization.
- **Metrics dashboard** – Summary cards, pending requests, blocked/restricted lists, hashtag follows, and CSV/PDF exports.
- **Snapshot comparison** – Set a baseline analysis and compare it with a newer export to understand gained/lost followers.
- **Encrypted saved sessions** – Persist analyses locally with a passphrase so you can revisit results without re-uploading.
- **PWA ready** – Installable with generated icons, manifest, and theme color metadata.
- **Keyboard shortcuts** – Quickly open the upload picker or jump between views (Ctrl/Cmd + Shift + 1–6, U).
- **Accessibility & i18n foundations** – Spanish and English UI strings with locale toggle, skip link, and dark/light themes.

## 🧱 Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript
- [Zustand](https://github.com/pmndrs/zustand) with Immer for state management
- [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS plugin
- [JSZip](https://stuk.github.io/jszip/), [Papaparse](https://www.papaparse.com/), [pdf-lib](https://pdf-lib.js.org/)
- [Vitest](https://vitest.dev/) + Testing Library (unit tests)

## ✅ Requirements

- Node.js **20.11** or newer (ESM-compatible, aligns with `next@15` + `vitest`)
- npm (Bundled with Node) – or adapt commands for `pnpm`/`yarn`
- Modern Chromium/Firefox/Safari browser for running the app locally

## 🚀 Local Setup

```bash
git clone <repo-url>
cd instagram-follower-insights
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the UI. The app hot-reloads when you edit files inside `src/` or `app/`.

### Building for production

```bash
npm run build
npm start
```

### Quality gates

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint across the project |
| `npm test` | Vitest unit tests (parsers, etc.) |
| `npm run build` | Next.js production build |

## 📂 Project Structure

```
app/                    # App router entrypoints (layout, page, manifest, icons)
src/components/         # UI components (landing, summary, tables, modals)
src/lib/                # Parsing, metrics, exporters, encryption helpers
src/state/              # Zustand store + actions
public/                 # Static assets (if any)
tests/                  # Vitest test suites (unit + e2e placeholder)
```

## 🛠️ Usage Guide

1. **Download your Instagram data** – Use the Facebook/Instagram Accounts Center (Settings → Accounts Center → Download information) and request followers/following data.
2. **Extract the ZIP** (if Instagram sent a compressed package) or download the standalone JSON files.
3. **Upload** the files via the landing dropzone or press `Ctrl/Cmd + Shift + U` to open the file picker.
4. **Review metrics** in the Summary, Requests, Lists, and Hashtags tabs. Switch views with `Ctrl/Cmd + Shift + [1-6]`.
5. **Save analyses** (optional) with a passphrase to store an encrypted snapshot in IndexedDB. Manage saved data in the Storage Inspector.
6. **Compare snapshots** – Set a baseline, upload a newer export, and see gains/losses highlighted in the Comparison view.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + Shift + U` | Open upload dialog |
| `Ctrl/Cmd + Shift + 1` | Summary view |
| `Ctrl/Cmd + Shift + 2` | Requests view |
| `Ctrl/Cmd + Shift + 3` | Followers list |
| `Ctrl/Cmd + Shift + 4` | Following list |
| `Ctrl/Cmd + Shift + 5` | Comparison view |
| `Ctrl/Cmd + Shift + 6` | Privacy/Storage view |

## 🔐 Data & Privacy

- Files are parsed **entirely in the browser**. The app never uploads data to a backend.
- Saved analyses are encrypted with AES-GCM before being written to IndexedDB. Losing the passphrase means the data cannot be recovered.
- Use the Storage Inspector to delete cached analyses or clear everything with one click.

## 🧪 Testing

- **Unit tests:** `npm test`
	- Includes parser coverage to ensure follower/following dedupe rules keep working.
- **Linting:** `npm run lint`
- **End-to-end:** A skipped Vitest placeholder lives in `tests/e2e/placeholder.test.ts`; adapt it for Playwright when you’re ready.

## ⚠️ Troubleshooting

- **Build warnings about `themeColor` metadata:** Next.js prefers using the `viewport` export. Consider migrating when you next touch metadata.
- **Multiple lockfile warning:** Next.js detects lockfiles higher in your filesystem (e.g., `C:\Users\mate_\yarn.lock`). Set `outputFileTracingRoot` in `next.config.ts` or remove unneeded lockfiles to silence it.
- **Parsing errors:** Check that uploads came from the official Instagram export and contain `followers_*.json` / `following.json` in the expected format.
- **Theme issues:** If colors look incorrect, reset the theme via browser devtools (`localStorage.removeItem("instagram-follower-insights.theme")`).

## 📈 Roadmap Ideas

- Finish accessibility review (ARIA on complex tables, focus management for dialogs)
- Expand automated tests to cover UI flows (Playwright/Testing Library)
- Harden CSP headers for production deployment
- Add more export formats (Excel, JSON diff)

---

Made with ❤️ to help Instagram creators understand their audience while keeping data private.
