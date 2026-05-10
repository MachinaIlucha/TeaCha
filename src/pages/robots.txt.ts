import type { APIRoute } from "astro";

const fallbackSite = new URL("https://teacha.com.ua");

export const GET: APIRoute = ({ site }) => {
  const root = site ?? fallbackSite;
  const sitemapUrl = new URL("sitemap.xml", root).toString();

  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "User-agent: Amazonbot",
    "Disallow: /",
    "",
    "User-agent: Bytespider",
    "Disallow: /",
    "",
    "User-agent: CCBot",
    "Disallow: /",
    "",
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    "User-agent: Google-Extended",
    "Disallow: /",
    "",
    "User-agent: ClaudeBot",
    "Disallow: /",
    "",
    "User-agent: Applebot-Extended",
    "Disallow: /",
    "",
    "User-agent: meta-externalagent",
    "Disallow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
