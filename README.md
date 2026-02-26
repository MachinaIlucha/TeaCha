# TeaCha Website

TeaCha language school website built with `Astro` and deployed on `Cloudflare Pages`.

Production URL: `https://teacha.pages.dev`

## Tech Stack

- `Astro 5`
- `Sass`
- `Cloudflare Pages Functions` (API endpoint `/api/lead`)

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project Structure

```text
.
├─ functions/              # Cloudflare Pages Functions
│  └─ api/lead.js          # sends lead messages to Telegram
├─ public/                 # static files copied 1:1 to site root
├─ src/
│  ├─ assets/              # project images and media assets
│  ├─ components/          # Astro components
│  ├─ data/                # text content and asset mapping
│  ├─ layouts/             # page layouts
│  ├─ pages/               # routes
│  ├─ scripts/             # client-side JavaScript
│  └─ styles/              # SCSS architecture
├─ astro.config.mjs
└─ package.json
```

## Telegram Leads

Lead forms submit to `/api/lead`, handled by a Cloudflare Function:

- file: `functions/api/lead.js`
- method: `POST`
- body (`application/json`):
  - `name` (string, required)
  - `contact` (string, required)
  - `source` (string, optional)

Set these environment variables in Cloudflare Pages:

- `TG_BOT_TOKEN`
- `TG_CHAT_ID`

Without them, the endpoint returns `500 SERVER_CONFIG`.

## Cloudflare Pages Deployment

Recommended Cloudflare project settings:

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (repository root)
- Functions directory: `functions`

## Asset Notes

- Keep main images in `src/assets` and import them from components.
- Use `public/` only for files that must be directly available by URL (for example `robots.txt`, `favicon`, verification files).
- Use the centralized path mapping in `src/data/assetMap.ts` to avoid production path issues.
