import type { APIRoute } from "astro";

const fallbackSite = new URL("https://teacha.com.ua");

export const GET: APIRoute = ({ site }) => {
  const root = site ?? fallbackSite;
  const sitemapUrl = new URL("sitemap.xml", root).toString();

  const body = [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${sitemapUrl}`].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
