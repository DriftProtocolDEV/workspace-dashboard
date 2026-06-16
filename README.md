# Workspace Dashboard

A clean, modern, static Progressive Web App (PWA) for your personal Google Workspace hub.

## Features
- **Launcher**: Quick buttons for Gmail, Calendar, Drive, Docs, Sheets, Slides, Gemini, Keep.
- **Central Workspace**: Loads supported Google apps in an iframe when possible (Docs/Sheets/Slides/Gemini often work well).
- **Account Switcher**: Switch between Google accounts (0-3) — URLs are rewritten with authuser.
- **Quick Notes**: Autosaved locally in your browser (localStorage) — private and offline.
- **Fallbacks**: "Open in new tab" for apps that block embedding (Gmail/Drive/Calendar frequently do in static contexts).
- **PWA Installable**: Install as a standalone desktop app on macOS/Windows via Chrome/Edge.

## Security & Privacy
- 100% frontend / static.
- No backend, no OAuth, no API keys, no personal data stored.
- All Google access uses **your existing browser session cookies**.
- Notes stay only in your browser.

## Hosting (GitHub Pages)
This repo is set up for GitHub Pages (HTTPS enabled by default).

1. Push these files to the `main` branch (or `gh-pages`).
2. In repo Settings → Pages, set source to "Deploy from a branch" → main (or root).
3. Visit `https://<user>.github.io/workspace-dashboard`.
4. Chrome will offer to "Install" the app (look for the install icon in the address bar).

## Local Development
```bash
# Simple static server
python3 -m http.server 8080
# or npx serve .
```
Open http://localhost:8080 and test the install prompt (Chrome supports it on localhost).

## How to Use
- Use the right-side launcher or top address bar to open tools.
- Switch accounts in the left sidebar.
- Take notes — they save automatically.
- For best results with embedding, some apps work better than others in a pure web/PWA context (no extension header-stripping privileges).

## Optional: Chrome Extension Version
For more powerful embedding (Gmail/Drive/Calendar in iframe without blocks), see the original rich extension implementation with declarativeNetRequest and content script hacks. This static version prioritizes simplicity, privacy, and easy GitHub Pages hosting.

## Files
- `index.html` — The dashboard shell
- `style.css` — Dark, glassmorphism UI
- `app.js` — Launcher logic, account rewriting, local notes, PWA SW registration
- `app.webmanifest` — PWA install manifest (standalone mode)
- `sw.js` — Basic service worker for caching/offline
- `icons/` — PWA icons (replace with your own for production)

Built as a static PWA from the original Workspace PWA extension concepts.
