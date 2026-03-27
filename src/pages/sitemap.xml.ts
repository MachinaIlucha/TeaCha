import type { APIRoute } from "astro";

const fallbackSite = new URL("https://teacha.com.ua");

const pages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/english/", priority: "0.9", changefreq: "weekly" },
  { path: "/english/biznes-anhliyska/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/korporatyvna-anhliyska/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/anhliyska-dlya-it/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/anhliyska-dlya-dyzayneriv/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/pidhotovka-do-nmt/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/rozmovna-anhliyska/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/anhliyska-hramatyka/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/anhliyska-dlya-pereizdu/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/spiking-klub/", priority: "0.8", changefreq: "weekly" },
  { path: "/english/test/", priority: "0.7", changefreq: "monthly" },
  { path: "/chinese/", priority: "0.9", changefreq: "weekly" },
  { path: "/chinese/dlya-pochatkivciv/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/hsk/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/dlya-ditey/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/dlya-pidlitkiv/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/dilova/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/rozmovna/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/ieroglify/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/fonetyka/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/doramy/", priority: "0.8", changefreq: "weekly" },
  { path: "/chinese/torgivlya/", priority: "0.8", changefreq: "weekly" },
  { path: "/corporate/", priority: "0.8", changefreq: "weekly" },
  { path: "/about/", priority: "0.7", changefreq: "monthly" },
  { path: "/prices/", priority: "0.8", changefreq: "weekly" },
  { path: "/products/", priority: "0.6", changefreq: "monthly" },
] as const;

const toAbsoluteUrl = (site: URL, path: string) => new URL(path.replace(/^\/+/, ""), site).toString();

export const GET: APIRoute = ({ site }) => {
  const root = site ?? fallbackSite;
  const lastmod = new Date().toISOString();

  const urls = pages
    .map(
      ({ path, priority, changefreq }) => `
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
