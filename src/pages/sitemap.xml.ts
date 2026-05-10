import type { APIRoute } from "astro";

const fallbackSite = new URL("https://teacha.com.ua");

const pages = [
  { path: "/", priority: "1.0", changefreq: "weekly", lastmod: "2026-05-10" },
  { path: "/english/", priority: "0.9", changefreq: "weekly", lastmod: "2026-05-10" },
  { path: "/english/biznes-anhliyska/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/korporatyvna-anhliyska/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/anhliyska-dlya-it/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/anhliyska-dlya-dyzayneriv/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/pidhotovka-do-nmt/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/rozmovna-anhliyska/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/anhliyska-hramatyka/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/anhliyska-dlya-pereizdu/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/spiking-klub/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/english/test/", priority: "0.9", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/", priority: "0.9", changefreq: "weekly", lastmod: "2026-05-10" },
  { path: "/chinese/dlya-pochatkivciv/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/hsk/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/dlya-ditey/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/dlya-pidlitkiv/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/dilova/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/rozmovna/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/ieroglify/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/fonetyka/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/doramy/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/chinese/torgivlya/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/corporate/", priority: "0.8", changefreq: "monthly", lastmod: "2026-05-01" },
  { path: "/about/", priority: "0.7", changefreq: "monthly", lastmod: "2026-04-01" },
  { path: "/prices/", priority: "0.8", changefreq: "weekly", lastmod: "2026-05-10" },
  { path: "/products/", priority: "0.6", changefreq: "monthly", lastmod: "2026-03-01" },
  { path: "/docs/dogovir-publichnoi-oferty.pdf", priority: "0.3", changefreq: "yearly", lastmod: "2026-01-01" },
  { path: "/docs/polityka-konfidentsiinosti.pdf", priority: "0.3", changefreq: "yearly", lastmod: "2026-01-01" },
] as const;

const toAbsoluteUrl = (site: URL, path: string) => new URL(path.replace(/^\/+/, ""), site).toString();

export const GET: APIRoute = ({ site }) => {
  const root = site ?? fallbackSite;

  const urls = pages
    .map(
      ({ path, priority, changefreq, lastmod }) => `
  <url>
    <loc>${toAbsoluteUrl(root, path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
