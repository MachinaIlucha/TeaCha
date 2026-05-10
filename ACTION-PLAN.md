# TeaCha SEO Action Plan

**Site:** https://teacha.com.ua/  
**Date:** 2026-05-10  
**Current Score:** 55/100  

---

## Critical Priority (fix immediately -- blocks indexing)

### 1. Fix Cloudflare Bot Fight Mode blocking Googlebot
**Impact:** Technical SEO +30 points | Enables all other SEO to take effect  
**Effort:** 15 minutes  
**Category:** Technical SEO / Crawlability

**Problem:** `site:teacha.com.ua` returns 0 results. Cloudflare Bot Fight Mode (enabled by default) challenges or blocks Googlebot, preventing any page from being indexed.

**Fix:**
1. Log in to Cloudflare Dashboard > Security > Bots.
2. Either disable Bot Fight Mode entirely, or (better) create a WAF Custom Rule:
   - **Rule name:** Allow Search Engine Bots
   - **Expression:** `(cf.client.bot)` — this matches verified bots (Googlebot, Bingbot, etc.)
   - **Action:** Skip (Allow)
3. After deploying, request indexing via Google Search Console for the homepage and key pages.
4. Monitor `site:teacha.com.ua` over the next 1-2 weeks.

**File:** Cloudflare Dashboard (no code change)

---

### 2. Install Google Search Console
**Impact:** Enables indexation monitoring and debug  
**Effort:** 30 minutes  
**Category:** Technical SEO

**Fix:**
1. Go to https://search.google.com/search-console/
2. Add property `https://teacha.com.ua/`
3. Verify via Cloudflare DNS TXT record (easiest) or HTML meta tag in `BaseLayout.astro`
4. Submit sitemap: `https://teacha.com.ua/sitemap.xml`
5. Use URL Inspection tool to debug indexing issues
6. Request indexing for key pages

---

### 3. Install Google Analytics 4
**Impact:** Enables traffic measurement and conversion tracking  
**Effort:** 30 minutes  
**Category:** Analytics

**Fix:**
1. Create GA4 property at https://analytics.google.com/
2. Add the GA4 tag to `BaseLayout.astro` `<head>`:
```html
<!-- Add before closing </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
3. Set up conversion events for lead form submissions.

**File:** `src/layouts/BaseLayout.astro`

---

## High Priority (fix within 1 week -- significantly impacts rankings)

### 4. Pre-render prices in static HTML
**Impact:** Content Quality +5, CLS improvement, Schema consistency  
**Effort:** 2 hours  
**Category:** Content / Performance

**Problem:** All price cards show "---" in static HTML. Prices load via JS from a JSON config (`data-price` attributes). Googlebot sees no pricing information. This also causes CLS when JS hydrates.

**Fix:**
Either:
- **(Recommended)** Inline price values directly in the Astro components at build time from `siteText.ts` data, removing the client-side price injection.
- Or use Astro's server-side data to render prices into the HTML during SSG build.

The `OfferCatalog` schema already has correct prices -- the visible HTML should match.

**File:** Price section component + `src/data/siteText.ts`

---

### 5. Fix duplicate FAQPage schema on homepage
**Impact:** Schema +5, avoids Google warnings  
**Effort:** 30 minutes  
**Category:** Schema

**Problem:** Homepage has two `<script type="application/ld+json">` blocks both containing `FAQPage` with the same 8 questions. One comes from `BaseLayout.astro` (via `jsonLd` prop) and one is rendered inline in the FAQ section component.

**Fix:** Remove the inline FAQPage schema from the FAQ section component. Keep only the one passed via `jsonLd` prop to `BaseLayout.astro`.

**File:** FAQ section component (find the inline `<script type="application/ld+json">` with FAQPage)

---

### 6. Allow AI search bots in robots.txt
**Impact:** AI Search Readiness +30  
**Effort:** 15 minutes  
**Category:** GEO / AI Readiness

**Problem:** robots.txt blocks GPTBot, Google-Extended, ClaudeBot, Applebot-Extended. The site uses Content-Signal headers (`ai-train=no`) to opt out of training, but the robots.txt Disallow overrides everything -- bots can't even see the content to cite it in search results.

**Fix:**
Keep blocking pure training bots (CCBot, Bytespider), but allow search-integrated bots:

```
# REMOVE these blocks:
# User-agent: GPTBot
# Disallow: /
#
# User-agent: Google-Extended
# Disallow: /
#
# User-agent: ClaudeBot
# Disallow: /
#
# User-agent: Applebot-Extended
# Disallow: /
```

The `Content-Signal: ai-train=no` header already opts out of training while allowing search features.

**File:** `dist/robots.txt` (and the source that generates it)

---

### 7. Create Google Business Profile
**Impact:** Local SEO +40  
**Effort:** 1-2 hours  
**Category:** Local SEO

**Fix:**
1. Create a GBP listing at https://business.google.com/
2. Business name: "TeaCha - школа англійської та китайської"
3. Category: "Language School"
4. Address: проспект Академіка Палладіна, 44а, Київ
5. Phone: +380634602120
6. Hours: Mon-Sun 09:00-21:00
7. Add photos of the school, classrooms, team
8. Verify via postcard or phone
9. Ask existing students to leave Google Reviews

---

### 8. Use stable (non-hashed) URLs for schema assets
**Impact:** Schema +3, Social sharing reliability  
**Effort:** 1 hour  
**Category:** Schema / Technical

**Problem:** `logo`, `image`, and `og:image` in schema use Astro content-hashed filenames (e.g., `logo.ChmpYQIM.png`). These change on every build, making URLs unstable. Cached social previews and schema references break.

**Fix:**
1. Copy logo and OG image to `public/` directory with stable filenames:
   - `public/logo.png`
   - `public/og-image.jpg`
2. Update `BaseLayout.astro` to reference these stable paths for schema `logo`, `image`, and `og:image`.
3. Keep the hashed versions for actual `<img>` rendering (cache-busting is good there).

**File:** `src/layouts/BaseLayout.astro`, `public/` directory

---

### 9. Clean tracking parameters from sameAs URLs
**Impact:** Schema +2  
**Effort:** 10 minutes  
**Category:** Schema

**Problem:** Social URLs in schema contain tracking params:
- Instagram: `?igsh=MW15MzJpdmVqemRidg==`
- TikTok: `?_r=1&_t=ZM-92xtLcPpblU`

**Fix:** Update `siteText.ts` contact URLs to clean versions:
- `https://www.instagram.com/teacha_english_chinese/`
- `https://www.tiktok.com/@school.teacha`

**File:** `src/data/siteText.ts` (contact.instagramUrl, contact.tiktokUrl)

---

## Medium Priority (fix within 1 month -- optimization opportunities)

### 10. Add AggregateRating to Organization schema
**Impact:** Schema +5, enables star ratings in search  
**Effort:** 30 minutes  
**Category:** Schema

**Fix:** Add to the `organizationSchema` in `BaseLayout.astro`:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "5.0",
  "reviewCount": 5,
  "bestRating": "5"
}
```

Calculate actual average from the 5 reviews. Update `reviewCount` as new reviews are added.

**File:** `src/layouts/BaseLayout.astro`

---

### 11. Self-host Google Fonts
**Impact:** Performance +5 (LCP improvement)  
**Effort:** 1 hour  
**Category:** Performance

**Problem:** Montserrat 300/400/500 loaded from `fonts.googleapis.com` as a render-blocking stylesheet. Requires DNS lookup + connection to Google servers before rendering.

**Fix:**
1. Download Montserrat WOFF2 files (300, 400, 500 weights).
2. Place in `public/fonts/`.
3. Add `@font-face` declarations in your main SCSS with `font-display: swap`.
4. Remove the Google Fonts `<link>` tags from `BaseLayout.astro`.
5. Remove the `<link rel="preconnect">` tags for Google Fonts.

**File:** `src/layouts/BaseLayout.astro`, `src/styles/main.scss`, `public/fonts/`

---

### 12. Add phone click-to-call links
**Impact:** Local SEO +3, Conversion +5  
**Effort:** 15 minutes  
**Category:** Local SEO / UX

**Fix:** Wrap phone numbers in footer with `<a href="tel:+380634602120">`:
```html
<a href="tel:+380634602120">+38 (063) 460-21-20</a>
<a href="tel:+380673626364">+38 (067) 362-63-64</a>
```

**File:** Footer component

---

### 13. Add second phone number to schema
**Impact:** Schema +1  
**Effort:** 10 minutes  
**Category:** Schema

**Problem:** Footer shows two phone numbers but schema `contactPoint` only includes the first one.

**Fix:** Add second `ContactPoint` to the `organizationSchema`:
```json
{
  "@type": "ContactPoint",
  "contactType": "customer support",
  "telephone": "+380673626364",
  "areaServed": "UA",
  "availableLanguage": ["uk"]
}
```

**File:** `src/layouts/BaseLayout.astro` or `src/data/siteText.ts`

---

### 14. Add priceRange to LocalBusiness schema
**Impact:** Schema +2  
**Effort:** 5 minutes  
**Category:** Schema

**Fix:** Add `"priceRange": "$$"` (or actual range like `"350-700 UAH"`) to the `organizationSchema` in `BaseLayout.astro`.

**File:** `src/layouts/BaseLayout.astro`

---

### 15. Create llms.txt
**Impact:** AI Search Readiness +10  
**Effort:** 30 minutes  
**Category:** GEO

**Fix:** Create `public/llms.txt` with structured information:
```
# TeaCha Language School

> English and Chinese language courses in Kyiv, Ukraine. Individual, pair, group, and corporate formats. Online and offline.

## Courses
- English: Business, Corporate, IT, Design, NMT Prep, Conversational, Grammar, Relocation, Speaking Club
- Chinese: Beginners, HSK Prep, Children, Teens, Business, Conversational, Hieroglyphs, Phonetics, Dramas, Trade

## Contact
- Address: Prospect Akademika Palladina, 44a, Kyiv, Ukraine
- Phone: +380634602120
- Email: teachaschoolkyiv@gmail.com
- Website: https://teacha.com.ua/

## Pricing
- Individual: from 350 UAH/lesson
- Pair: from 250 UAH/lesson  
- Group (3-5): from 200 UAH/lesson
- Trial lesson available
```

**File:** `public/llms.txt`

---

### 16. Add breadcrumb navigation to UI
**Impact:** On-Page SEO +3, UX improvement  
**Effort:** 1-2 hours  
**Category:** On-Page SEO

**Problem:** BreadcrumbList schema exists for sub-pages but no visible breadcrumb navigation in the UI. Google prefers when schema matches visible content.

**Fix:** Add a simple breadcrumb component rendered above the main content on sub-pages (course pages, about, prices).

**File:** New component or update in `BaseLayout.astro`

---

### 17. Add og:image dimensions
**Impact:** Social sharing +2  
**Effort:** 10 minutes  
**Category:** On-Page SEO

**Fix:** Add to `BaseLayout.astro`:
```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

Create a proper 1200x630 OG image for social sharing.

**File:** `src/layouts/BaseLayout.astro`

---

## Low Priority (backlog -- nice to have)

### 18. Start a blog / educational content section
**Impact:** Content +10, AI Readiness +10, long-term SEO growth  
**Effort:** Ongoing  
**Category:** Content Strategy

Add a `/blog/` section with educational articles (e.g., "Як підготуватися до НМТ з англійської", "10 фраз для бізнес-зустрічі китайською"). This serves informational intent queries and provides citable content for AI search.

---

### 19. Add teacher profile pages
**Impact:** E-E-A-T +5  
**Effort:** 2-3 hours  
**Category:** Content / E-E-A-T

Create individual pages or a detailed section for each teacher with: name, photo, education, certifications, years of experience, specialization.

---

### 20. Add Google Maps embed
**Impact:** Local SEO +3  
**Effort:** 15 minutes  
**Category:** Local SEO

Embed a Google Maps iframe on the About or Contact section showing the school's location.

---

### 21. Add more social channels
**Impact:** Authoritativeness +3  
**Effort:** Ongoing  
**Category:** E-E-A-T

Create and link Facebook page, YouTube channel (lesson previews), LinkedIn company page. Add to `sameAs` in schema.

---

### 22. Integrate third-party reviews
**Impact:** Local SEO +5, Trust +5  
**Effort:** 1-2 hours  
**Category:** Local SEO / E-E-A-T

Display Google Reviews widget on site once GBP is active. Consider Trustpilot or local Ukrainian review platforms.

---

### 23. Add security headers via Cloudflare
**Impact:** Technical SEO +2, Security  
**Effort:** 30 minutes  
**Category:** Technical SEO

Add via Cloudflare Transform Rules or `_headers` file:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
```

**File:** `public/_headers` or Cloudflare Dashboard

---

## Impact Summary

| Priority | Items | Estimated Score Impact |
|---|---|---|
| Critical | #1-3 | +30 (unlocks indexation, enables measurement) |
| High | #4-9 | +20 (content quality, schema, AI readiness) |
| Medium | #10-17 | +10 (optimization, performance, local) |
| Low | #18-23 | +10 (long-term growth) |
| **Projected score after all fixes** | | **~85/100** |

---

## Recommended Implementation Order

**Week 1 (Critical + Quick Wins):**
1. Fix Cloudflare Bot Fight Mode (#1)
2. Install Google Search Console (#2)
3. Install GA4 (#3)
4. Clean sameAs tracking params (#9)
5. Allow AI search bots in robots.txt (#6)

**Week 2 (High Impact):**
6. Pre-render prices (#4)
7. Fix duplicate FAQPage (#5)
8. Create Google Business Profile (#7)
9. Stable schema asset URLs (#8)

**Week 3-4 (Optimization):**
10. Self-host fonts (#11)
11. Add AggregateRating (#10)
12. Click-to-call links (#12)
13. Add llms.txt (#15)
14. Schema improvements (#13, 14)
15. OG image dimensions (#17)
16. Breadcrumb UI (#16)

**Ongoing:**
17. Blog content (#18)
18. Teacher profiles (#19)
19. Social expansion (#21)
20. Review integration (#22)
