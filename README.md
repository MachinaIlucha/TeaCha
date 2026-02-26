# TeaCha Website

Сайт школы языков TeaCha на `Astro` с деплоем на `Cloudflare Pages`.

Прод URL: `https://teacha.pages.dev`

## Стек

- `Astro 5`
- `Sass`
- `Cloudflare Pages Functions` (API endpoint `/api/lead`)

## Команды

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Структура проекта

```text
.
├─ functions/              # Cloudflare Pages Functions
│  └─ api/lead.js          # отправка заявок в Telegram
├─ public/                 # статические файлы, которые должны идти 1:1 в root
├─ src/
│  ├─ assets/              # изображения и прочие ассеты проекта
│  ├─ components/          # Astro-компоненты
│  ├─ data/                # текстовый контент и маппинг ассетов
│  ├─ layouts/             # layout'ы страниц
│  ├─ pages/               # роуты
│  ├─ scripts/             # клиентский JS
│  └─ styles/              # SCSS-архитектура
├─ astro.config.mjs
└─ package.json
```

## Лиды в Telegram

Форма отправляется на `/api/lead`, который работает через Cloudflare Function:

- файл: `functions/api/lead.js`
- метод: `POST`
- body (`application/json`):
  - `name` (string, обязательно)
  - `contact` (string, обязательно)
  - `source` (string, опционально)

Для работы на Cloudflare Pages задай переменные окружения:

- `TG_BOT_TOKEN`
- `TG_CHAT_ID`

Без них endpoint вернет `500 SERVER_CONFIG`.

## Деплой на Cloudflare Pages

Рекомендуемые настройки проекта в Cloudflare:

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (корень репозитория)
- Functions directory: `functions`

## Важное по ассетам

- Основные изображения лежат в `src/assets` и подключаются из компонентов.
- `public/` оставляй только для файлов, которые должны быть доступны напрямую по URL (например `robots.txt`, `favicon`, внешние верификационные файлы).
- Для путей к изображениям используй единый подход через маппинг в `src/data/assetMap.ts`, чтобы избежать проблем на проде.
