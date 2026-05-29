import type { APIRoute } from "astro";
import { comparePages } from "../content/compare-pages";
import { docsPlaybooks } from "../content/docs-playbooks";
import { integrationsContent } from "../content/integrations";
import { siteConfig } from "../config/site";

export const prerender = true;

const staticPageModules = Object.keys(import.meta.glob("./**/*.astro"));

const staticPaths = staticPageModules
  .filter((modulePath) => !modulePath.includes("[") && modulePath !== "./404.astro")
  .map((modulePath) =>
    modulePath
      .replace(/^\.\//, "/")
      .replace(/index\.astro$/, "")
      .replace(/\.astro$/, "/")
      .replace(/\/+/g, "/")
  )
  .map((path) => (path === "" ? "/" : path));

const dynamicPaths = [
  ...Object.keys(comparePages).map((slug) => `/compare/${slug}/`),
  ...Object.keys(docsPlaybooks).map((slug) => `/docs/playbooks/${slug}/`),
  ...integrationsContent.items.map((item) => `/integrations/${item.slug}/`)
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const baseUrl = siteConfig.domain.replace(/\/+$/, "");

const urls = [...new Set([...staticPaths, ...dynamicPaths])]
  .sort((left, right) => left.localeCompare(right))
  .map((path) => `${baseUrl}${path}`);

export const GET: APIRoute = () => {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
};
