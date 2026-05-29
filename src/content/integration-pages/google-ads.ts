import type { IntegrationItem } from "./types";

export const google_ads: IntegrationItem = {
  slug: "google-ads",
  label: "Google Ads",
  title: "Google Ads integration",
  summary: "Reduce mismatched totals and send Google Ads cleaner conversion actions for bidding, reporting, and remarketing.",
  hero: "Use Google Ads when you want conversion actions that stay cleaner across landing pages, forms, and checkout flows, without fighting constant gaps between Google Ads, GA4, and your CRM.",
  repository: "https://github.com/managed-components/google-ads",
  points: [
    "Map clean purchase and lead events into conversion actions once",
    "Keep Google Ads closer to the same conversion truth as GA4 and other channels",
    "Reduce reporting gaps caused by duplicated scripts, separate tags, and disconnected tooling"
  ],
  useCases: [
    "Lead generation funnels with multiple conversion steps",
    "Ecommerce purchase and checkout tracking",
    "Remarketing and audience building from one shared event stream"
  ]
};
