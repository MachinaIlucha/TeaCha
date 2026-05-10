# TeaCha SEO Audit Report

**URL:** https://teacha.com.ua/  
**Date:** 2026-05-10  
**Business type:** Language school (English + Chinese), hybrid (brick-and-mortar + online), Kyiv, Ukraine  
**Tech stack:** Astro 5.16.8 (SSG) on Cloudflare Pages  

---

## Overall SEO Health Score: 55/100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 61 | 13.4 |
| Content Quality & E-E-A-T | 23% | 74 | 17.0 |
| On-Page SEO | 20% | 72 | 14.4 |
| Schema / Structured Data | 10% | 58 | 5.8 |
| Performance (CWV) | 10% | 65 | 6.5 |
| AI Search Readiness | 10% | 41 | 4.1 |
| Images | 5% | 68 | 3.4 |
| **Total** | **100%** | | **64.6** |

> **Note:** The weighted total is 64.6, but the effective score is adjusted to **55** because the site has **zero Google indexation** — none of the on-page optimizations are delivering value until crawlability is resolved.

---

## Executive Summary

### Top 5 Critical Issues

1. **Zero Google indexation** — `site:teacha.com.ua` returns 0 results. Cloudflare Bot Fight Mode is likely blocking Googlebot at the WAF layer before it even reaches the site.
2. **robots.txt blocks AI search bots** — GPTBot, Google-Extended, ClaudeBot, and Applebot-Extended are all blocked, cutting the site off from AI Overviews, ChatGPT citations, and Bing Copilot.
3. **Prices render as "---" in static HTML** — all price values use `data-price` attributes and JS hydration, so crawlers see placeholder dashes instead of actual prices. This kills the OfferCatalog schema and causes CLS.
4. **No Google Business Profile confirmed** — for a hybrid brick-and-mortar + online school in Kyiv, missing GBP means no local pack visibility.
5. **No analytics or tracking installed** — no Google Analytics, Tag Manager, or any analytics. No way to measure traffic, conversions, or SEO performance.

### Top 5 Quick Wins

1. Disable Cloudflare Bot Fight Mode or add a Googlebot exception rule (free, immediate impact).
2. Remove Google-Extended from robots.txt blocks (keeps training opt-out via `ai-train=no` header while allowing AI search features).
3. Pre-render price values in static HTML instead of JS hydration.
4. Create and verify a Google Business Profile.
5. Install Google Analytics 4 + Google Search Console.

---

## 1. Technical SEO (61/100)

### Crawlability (30/100) -- CRITICAL

- **Zero indexation**: `site:teacha.com.ua` returns no results in Google.
- **Root cause**: Cloudflare Bot Fight Mode (enabled by default on free/pro plans) challenges or blocks automated requests, including Googlebot. The site returns 403 to non-browser user agents.
- **robots.txt**: Well-structured, allows all legitimate crawlers, blocks `/api/`. Includes `Content-Signal` headers (`search=yes`, `ai-train=no`). Sitemap reference present.
- **Sitemap**: Valid XML with 25 URLs, proper `lastmod`, `changefreq`, and `priority` values. All URLs have trailing slashes.

### Indexability (70/100)

- Canonical tags: correctly implemented on all pages (self-referencing).
- Meta robots: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` -- optimal.
- Hreflang: `uk` + `x-default` implemented (appropriate for single-language Ukrainian site).
- `<html lang="uk">` -- correct.
- All pages are pre-rendered static HTML (SSG) -- no client-side rendering issues for content except prices.

### Security & Infrastructure (80/100)

- HTTPS: enforced via Cloudflare.
- HTTP/2: enabled via Cloudflare.
- `theme-color` meta tag: present (`#f6efe3`).
- Astro View Transitions (ClientRouter) for SPA-like navigation -- good UX, but `data-astro-transition` attributes add minor HTML weight.
- Missing: `Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security` headers (Cloudflare can add these via Transform Rules).

### URL Structure (85/100)

- Clean, descriptive Ukrainian transliteration: `/english/biznes-anhliyska/`, `/chinese/dlya-pochatkivciv/`.
- Consistent trailing slashes.
- Logical hierarchy: `/{language}/{course}/`.
- PDF documents served from `/docs/` path.

### Mobile (75/100)

- Viewport meta tag present and correct.
- Responsive design with mobile-specific components (`hero__chips--mobile`, `process__mobile`).
- Burger menu with proper `aria-expanded`, `aria-controls`.
- No mobile-specific CSS file inspection done (via Playwright), but HTML structure is mobile-ready.

---

## 2. Content Quality & E-E-A-T (74/100)

### Trust Signals (27/30) -- Strong

- **Real founder names**: Daryna Shvets and Dariia Poznyakivska, with a real photo.
- **Credentials listed**: KNU Shevchenko red diploma, Confucius Institute, year in Qingdao University, 4+ years managing a language center.
- **Real student reviews** (5 students): V'yacheslav, Nataliia, Anya, Olena, Yuliia -- each with Point A/B progress tracking, specific dates, and level changes (e.g., A1+ to B1+ from July 2024 to September 2025).
- **Physical address**: Prospect Akademika Palladin, 44a, Kyiv.
- **Legal documents**: Public offer agreement + Privacy policy PDFs.
- **Contact points**: phone, email, Instagram, TikTok.

### Experience (18/20) -- Strong

- Clearly demonstrates teaching outcomes with before/after data.
- Specific metrics: 200+ students, 3-5 person mini-groups, 60-minute lessons.
- Multiple format options: individual, pair, group, corporate.
- Student progress tracking (Point A to Point B) shows real results.

### Expertise (15/25) -- Moderate

- Founder credentials are strong but only listed for the two founders, not other teachers.
- No individual teacher profiles or bios beyond "higher pedagogical/philological education".
- No blog, articles, or educational content demonstrating expertise.
- No certifications page or accreditation badges.

### Authoritativeness (14/25) -- Weak

- No external authority signals on the site (press mentions, partnerships, awards).
- Only 2 social channels (Instagram, TikTok) -- no Facebook, LinkedIn, YouTube.
- No Google reviews or third-party review platform integration (Trustpilot, Google Maps).
- `sameAs` URLs contain tracking parameters (`?igsh=...`, `?_r=1&_t=...`) -- should be clean canonical URLs.
- No backlink profile data available.

### Content Depth

- **Homepage**: Comprehensive -- hero, founders, facts, test banner, learning process, pricing, reviews, FAQ. ~2,500 words of content.
- **FAQ section**: 8 questions covering program, duration, group size, materials, location, payment, teacher qualifications, schedule flexibility. Good but could be expanded.
- **Course pages**: Not analyzed in detail due to context limits, but sitemap shows 9 English courses + 9 Chinese courses + corporate page.

### Content Issues

- Prices render as "---" placeholder in HTML -- crawlers see no pricing content.
- Hidden SEO nav (`aria-hidden="true"`, `tabindex="-1"`) with keyword-rich anchor text is a borderline technique. Google may flag it as manipulative if overdone.
- No blog or educational content -- pure commercial pages.

---

## 3. On-Page SEO (72/100)

### Title Tags (85/100)

- Homepage: `Школа англійської та китайської в Києві --- онлайн та офлайн | TeaCha` (64 chars -- good).
- Consistent `{Page Title} | TeaCha` pattern.
- Title contains primary keywords: school, English, Chinese, Kyiv, online, offline.

### Meta Descriptions (80/100)

- Homepage: `TeaCha --- курси англійської та китайської в Києві: індивідуально, мінігрупи й корпоративно. Онлайн та офлайн. Пробний урок за записом.` (137 chars -- good length).
- Includes call-to-action ("trial lesson by appointment").
- Per-page unique descriptions appear to be configured (each page passes `description` prop).

### Heading Structure (75/100)

- `<h1>` on homepage is `visuallyHidden`: `TeaCha - школа англійської та китайської мов онлайн і офлайн у Києві`. Hidden but accessible -- OK for design-driven layout.
- Section headings use `<h2>` consistently: Founders, Facts, Process, Pricing, Reviews, FAQ.
- Heading hierarchy is logical.
- Issue: some sections use `visuallyHidden` headings while others use decorative text. Inconsistent but functional.

### Internal Linking (65/100)

- Main navigation: 6 links (English, Chinese, Corporate, Prices, Products, About).
- SEO hidden nav: 19 deep links to all course pages -- provides crawl paths but is `aria-hidden`.
- No breadcrumb navigation visible in the UI (only schema markup available for sub-pages).
- No cross-linking between related course pages (e.g., "Business English" doesn't link to "Corporate English").
- Footer: links to test, legal docs, but no footer sitemap to major pages.

### Open Graph & Social (85/100)

- All OG tags present: `og:type`, `og:locale`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:alt`.
- Twitter Card: `summary_large_image` with all tags.
- OG image points to `home-hero-background.JClymmVI.jpg` -- hashed Astro filename will change on rebuild, breaking any cached social shares.

---

## 4. Schema / Structured Data (58/100)

### Implemented Schemas

| Schema | Status | Issues |
|---|---|---|
| EducationalOrganization + LocalBusiness | Present | Logo/image URLs use hashed Astro paths; `sameAs` has tracking params |
| WebSite | Present | Clean, no issues |
| WebPage | Present | Clean, per-page |
| BreadcrumbList | Present | Only on sub-pages with breadcrumb props |
| FAQPage | Present | **Duplicate** -- injected twice on homepage (once from BaseLayout, once inline) |
| ItemList (Reviews) | Present | Good -- 5 real reviews with author, reviewBody, itemReviewed |
| Course | Present | Via `buildCourseSchema()` -- Online + Onsite instances |
| OfferCatalog | Present | Prices are correct in schema but "---" in visible HTML -- schema/content mismatch |

### Schema Issues

1. **Duplicate FAQPage**: Homepage has two `<script type="application/ld+json">` blocks both containing `FAQPage` with identical 8 questions. Google may ignore both or show warnings in Search Console.
2. **Hashed asset URLs**: `logo`, `image`, `og:image` all use Astro content-hashed filenames (e.g., `logo.ChmpYQIM.png`). These change on every build, making schema URLs unstable.
3. **Tracking parameters in sameAs**: Instagram URL contains `?igsh=MW15MzJpdmVqemRidg==`, TikTok contains `?_r=1&_t=ZM-92xtLcPpblU`. These should be clean canonical URLs.
4. **Missing AggregateRating**: 5 reviews exist but no aggregate rating summary. Adding `AggregateRating` to the Organization schema would enable star ratings in search results.
5. **Missing priceRange**: LocalBusiness schema should include `priceRange` field.
6. **No Review schema on reviews page**: Individual reviews use ItemList but not standalone Review schemas on the homepage.

---

## 5. Performance / Core Web Vitals (65/100)

### Estimated Lab Metrics

- **LCP** (Largest Contentful Paint): The hero image `home-hero-teacha-team.BqK4TNq_.webp` is loaded with `loading="eager"` and `fetchpriority="high"` -- good. However, Google Fonts (Montserrat) is loaded as a render-blocking stylesheet via `<link rel="stylesheet">` which delays first render.
- **CLS** (Cumulative Layout Shift): Price cards render as "---" and then JS replaces them with actual values -- causes layout shift. Review carousel image swap also likely causes CLS.
- **INP** (Interaction to Next Paint): Minimal JS -- should be good. Astro SSG with small JS bundle.

### Performance Issues

1. **Render-blocking Google Fonts**: Montserrat 300/400/500 loaded via `fonts.googleapis.com` with `display=swap`. The CSS file itself is render-blocking. Should use `<link rel="preload" as="style">` pattern or self-host.
2. **JS-dependent price rendering**: All price `<div>` elements show "---" until JS runs. For SSG site this is unnecessary -- prices should be in the static HTML.
3. **CSS asset path variables**: `--asset-hero-home-bg`, `--asset-process-divider`, `--asset-reviews-quote` loaded as inline CSS variables with background images. These may trigger unnecessary downloads.
4. **No image lazy-loading audit**: Hero image is eager (correct), other images use `loading="lazy"` (correct), but no `width`/`height` on some decorative images.

### Performance Positives

- Static HTML (SSG) -- no server rendering overhead.
- WebP images used throughout.
- Cloudflare CDN for global delivery.
- Small JavaScript footprint (only lead forms, review carousel, FAQ accordion, reveal animations).
- `<link rel="preconnect">` for Google Fonts domains.

---

## 6. AI Search Readiness / GEO (41/100)

### AI Crawler Access (10/100) -- CRITICAL

The `robots.txt` blocks every major AI search crawler:

| Bot | Status | Impact |
|---|---|---|
| GPTBot | Blocked | No ChatGPT citations |
| Google-Extended | Blocked | No AI Overviews snippets |
| ClaudeBot | Blocked | No Anthropic citations |
| Applebot-Extended | Blocked | No Apple Intelligence features |
| CCBot | Blocked | No Common Crawl indexing |
| Bytespider | Blocked | No TikTok search |

While `Content-Signal: search=yes, ai-train=no` headers are present, the robots.txt `Disallow: /` takes precedence. These bots cannot even see the content to cite it.

### Citability (55/100)

- Content is well-structured with clear headings and facts.
- FAQ section provides question-answer pairs ideal for AI citation.
- Founder credentials and student outcomes provide citable data points.
- However: no blog content, no educational articles, no statistics pages that AI systems tend to cite.

### llms.txt (0/100)

- No `llms.txt` file present at root.
- No machine-readable content summary for AI systems.

### Brand Mention Signals (45/100)

- Brand name "TeaCha" is unique and recognizable.
- Social presence on Instagram and TikTok.
- No Wikipedia, Wikidata, or knowledge panel presence.
- No press coverage or external mentions found.

### Recommendations for AI Visibility

1. Allow GPTBot and Google-Extended in robots.txt (keep `ai-train=no` via Content-Signal header to opt out of training while allowing search features).
2. Create `/llms.txt` with structured school description, course catalog, and contact info.
3. Add educational blog content that AI systems can cite as authoritative source on language learning in Ukraine.

---

## 7. Images (68/100)

### Format & Optimization (85/100)

- WebP used for all hero and content images -- excellent.
- PNG used appropriately for icons and logos.
- Images have explicit `width` and `height` attributes for layout stability.
- `decoding="async"` used on most images.

### Alt Text (65/100)

- Hero image: `alt="Команда викладачів TeaCha"` -- descriptive, good.
- Founder photo: `alt="Дарина та Дарія"` -- could include "founders of TeaCha language school".
- Stamp card icons: `alt="" aria-hidden="true"` -- correct for decorative images.
- Review photos: `alt="Фото: ВʼЯЧЕСЛАВ"` -- functional but could be more descriptive.
- Logo: `alt="TeaCha"` -- adequate.

### OG/Social Images (55/100)

- Default OG image is the hero background JPG (hashed Astro URL).
- No dedicated social preview image designed for sharing.
- No `og:image:width` or `og:image:height` specified.
- Hashed filename changes on rebuild, invalidating cached previews.

---

## 8. Search Experience Optimization / SXO (34/100)

### Page-Type Match

- **English courses hub** (`/english/`): Correct page type for "курси англійської київ" query -- landing page with course listing.
- **Chinese courses hub** (`/chinese/`): Currently mirrors English hub structure. For "курси китайської київ" (lower volume query), Google may prefer a standalone landing page that differentiates more clearly from generic language school results.
- **Individual course pages**: Correct as sub-pages under language hubs.

### User Intent Alignment (40/100)

- Commercial intent queries ("курси англійської ціна київ") are partially served -- prices exist but render as "---" for crawlers.
- Informational intent queries ("як вивчити англійську") are not served at all -- no blog content.
- Navigational queries ("teacha школа") are well-served with clear branding.
- Transactional queries ("записатись на курси англійської") are served with multiple CTAs and lead forms.

### Conversion Paths (55/100)

- Multiple lead capture points: hero badge, start-lead section, footer form, lead dock (sticky), modal.
- CTAs are clear: "ХОЧУ ПРОБНЕ ЗАНЯТТЯ", "ЗАПИСАТИСЯ НА ПРОБНИЙ УРОК".
- Privacy consent checkbox on all forms.
- Missing: phone click-to-call links (phone number is text, not `tel:` link in footer).
- Missing: direct WhatsApp/Telegram contact buttons.
- Missing: price-to-CTA connection (price cards link to `#start-lead` instead of pre-filling course selection).

---

## 9. Local SEO (28/100)

### NAP Consistency (40/100)

- **Name**: "TeaCha" consistent across site, schema, social.
- **Address**: "проспект Академіка Палладіна, 44а, Київ" -- consistent in footer, schema, FAQ answer.
- **Phone**: "+380634602120" in schema, displayed as "+38 (063) 460-21-20" in footer. A second phone "+38 (067) 362-63-64" appears in footer but not in schema.
- **Email**: teachaschoolkyiv@gmail.com -- consistent.

### Google Business Profile (0/100)

- No confirmed GBP presence.
- No Google Maps reviews visible.
- `hasMap` in schema points to generic coordinates URL, not a Google Maps business listing.

### Local Schema (45/100)

- `LocalBusiness` + `EducationalOrganization` dual type -- correct.
- `GeoCoordinates` present (50.47026, 30.357656).
- `openingHoursSpecification`: Mon-Sun 09:00-21:00.
- `contactPoint` with `areaServed: "UA"`.
- Missing: `priceRange`, `paymentAccepted`, `currenciesAccepted`.

### Local Content (30/100)

- Physical address mentioned on homepage and in FAQ.
- Google Maps link via `hasMap`.
- No location-specific landing pages (e.g., "English courses in Sviatoshyn district").
- No transit/parking/directions information.
- No Google Maps embed on the site.

### Reviews & Reputation (25/100)

- 5 student reviews on site with real names and progress data -- high quality.
- No integration with Google Reviews, Facebook Reviews, or other platforms.
- No `AggregateRating` in schema.

---

## Appendix: File Structure Analyzed

```
F:\Programming\projects\TeaCha\
  src/
    layouts/BaseLayout.astro     -- Central SEO, meta, schema management
    data/seoSchemas.ts           -- Course, FAQ, Offer schema builders
    data/siteText.ts             -- All site copy, SEO defaults, contact info
  dist/
    index.html                   -- Pre-rendered homepage
    sitemap.xml                  -- 25 URLs
    robots.txt                   -- Crawler rules
  astro.config.mjs               -- site: "https://teacha.com.ua"
  package.json                   -- Astro 5.16.8
```
