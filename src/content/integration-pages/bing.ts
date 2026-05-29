import type { IntegrationItem } from "./types";

export const bing: IntegrationItem = {
  slug: "bing",
  label: "Bing",
  title: "Bing integration",
  summary: "Push cleaner conversion actions into Microsoft Ads so bidding, reporting, and lead quality stay closer to the truth.",
  hero: "Use Bing when Microsoft Ads matters to pipeline or revenue and you want the same purchase, lead, and qualified funnel events that already power the rest of your paid search stack.",
  repository: "https://github.com/managed-components/bing",
  points: [
    "Keep Bing conversion totals closer to Google Ads, analytics, and CRM numbers",
    "Reuse one conversion model across branded, non-brand, and landing page campaigns",
    "Reduce the hidden cost of maintaining separate Microsoft Ads tagging"
  ],
  useCases: [
    "Lead generation programs that buy traffic on Microsoft Ads",
    "Ecommerce funnels that need clean purchase tracking for paid search",
    "Multi-engine search setups that need one shared conversion contract"
  ]
};
