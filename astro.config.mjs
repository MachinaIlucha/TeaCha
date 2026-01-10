import { defineConfig } from "astro/config";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  site: "https://machinailucha.github.io",
  base: isProd ? "/TeaCha/" : "/",
});
