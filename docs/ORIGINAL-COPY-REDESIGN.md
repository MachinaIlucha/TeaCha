# Existing redesign with original main content

Branch: `design/original-copy`.

The visual source is the existing local redesign in `TeaCha`, previously uploaded to the Cloudflare `redesign` preview. Its four `school*.css` files, photography, intro, motion system and interactive components are retained. Text comes from working `main`, commit `cdc0dbff8c54e5e767bc360ddf3b38e16fd1554f`.

The original `siteText.ts`, `blog.ts`, `chineseVocabulary.ts` and `seoSchemas.ts` data are preserved. Previously abbreviated course content and omitted sections now appear using the redesign's existing typography and layouts. Blog article cards use their complete original titles, descriptions and dates.

`src/data/preservedSeo.json` captures the original title, meta tags, canonical and icon links, and JSON-LD for each of the 39 routes. `OriginalSeo.astro` emits this content consistently, including the original FAQ, course and breadcrumb schemas. Edit this snapshot deliberately when a future content or SEO change is authorized. `robots.txt` and `sitemap.xml` remain the original main implementations.

Validation:

```powershell
npm run build
python -X utf8 scripts/verify-original-copy.py
python -X utf8 scripts/check-redesign-browser.py
```

The comparison script expects the original build in the adjacent `TeaCha-main-preview/dist` directory and compares content, paragraphs, metadata, structured data, robots and sitemap. It also verifies the four design styles against the adjacent original `TeaCha` workspace. The browser script expects the built preview at `http://127.0.0.1:4325/`, uses Playwright with installed Chrome, and intercepts lead submissions; it does not send real applications.

Local preview is served from this branch's `dist` directory on port 4325. No Cloudflare deployment has been made for this branch.
