import type { APIRoute } from "astro";

const fallbackSite = new URL("https://teacha.pages.dev");

const pages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/english/", priority: "0.9", changefreq: "weekly" },
  { path: "/chinese/", priority: "0.9", changefreq: "weekly" },
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
