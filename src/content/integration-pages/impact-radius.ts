import type { IntegrationItem } from "./types";

export const impact_radius: IntegrationItem = {
  slug: "impact-radius",
  label: "Impact Radius",
  title: "Impact Radius integration",
  summary: "Keep affiliate and partner conversion data closer to the same purchase and lead truth used everywhere else in the business.",
  hero: "Use Impact Radius when partner programs, affiliate payouts, and internal reporting all need to start from one cleaner conversion source instead of multiple hand-built tracking paths.",
  repository: "https://github.com/managed-components/impact-radius",
  points: [
    "Align partner conversions with core ad and analytics data",
    "Reduce discrepancies between affiliate reporting and internal numbers",
    "Reuse one event model across direct, affiliate, partner, and marketplace channels"
  ],
  useCases: [
    "Affiliate revenue tracking for ecommerce brands",
    "Partner lead attribution programs",
    "Performance teams that need cleaner payout and commission signals"
  ]
};
