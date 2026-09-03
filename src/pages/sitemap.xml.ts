import type { APIRoute } from "astro";
import { blogArticles } from "../data/blog";

const fallbackSite = new URL("https://teacha.com.ua");

const pages = [
  { path: "/", lastmod: "2026-09-03" },
  { path: "/chinese/", lastmod: "2026-09-03" },
  { path: "/chinese/dlya-pochatkivciv/", lastmod: "2026-09-03" },
  { path: "/chinese/hsk/", lastmod: "2026-09-03" },
  { path: "/chinese/dlya-ditey/", lastmod: "2026-09-03" },
  { path: "/chinese/dlya-pidlitkiv/", lastmod: "2026-09-03" },
  { path: "/chinese/dilova/", lastmod: "2026-09-03" },
  { path: "/chinese/rozmovna/", lastmod: "2026-09-03" },
  { path: "/chinese/ieroglify/", lastmod: "2026-09-03" },
  { path: "/chinese/fonetyka/", lastmod: "2026-09-03" },
  { path: "/chinese/doramy/", lastmod: "2026-09-03" },
  { path: "/chinese/torgivlya/", lastmod: "2026-09-03" },
  { path: "/blog/", lastmod: "2026-09-03" },
  ...blogArticles.map((article) => ({
    path: `/blog/${article.slug}/`,
    lastmod: article.updatedAt,
  })),
  { path: "/english/", lastmod: "2026-09-03" },
  { path: "/english/biznes-anhliyska/", lastmod: "2026-09-03" },
  { path: "/english/korporatyvna-anhliyska/", lastmod: "2026-09-03" },
  { path: "/english/anhliyska-dlya-it/", lastmod: "2026-09-03" },
  { path: "/english/anhliyska-dlya-dyzayneriv/", lastmod: "2026-09-03" },
  { path: "/english/pidhotovka-do-nmt/", lastmod: "2026-09-03" },
  { path: "/english/rozmovna-anhliyska/", lastmod: "2026-09-03" },
  { path: "/english/anhliyska-hramatyka/", lastmod: "2026-09-03" },
  { path: "/english/anhliyska-dlya-pereizdu/", lastmod: "2026-09-03" },
  { path: "/english/spiking-klub/", lastmod: "2026-09-03" },
  { path: "/english/test/", lastmod: "2026-09-03" },
  { path: "/corporate/", lastmod: "2026-09-03" },
  { path: "/about/", lastmod: "2026-09-03" },
  { path: "/prices/", lastmod: "2026-09-03" },
] as const;

const toAbsoluteUrl = (site: URL, path: string) => new URL(path.replace(/^\/+/, ""), site).toString();

export const GET: APIRoute = ({ site }) => {
  const root = site ?? fallbackSite;

  const urls = pages
    .map(
      ({ path, lastmod }) => `
  <url>
    <loc>${toAbsoluteUrl(root, path)}</loc>
    <lastmod>${lastmod}</lastmod>
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
