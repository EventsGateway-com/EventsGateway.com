import type { IntegrationItem } from "./types";

export const google_analytics_4: IntegrationItem = {
  slug: "google-analytics-4",
  label: "Google Analytics 4",
  title: "Google Analytics 4 integration",
  summary: "Keep GA4 reporting closer to the same events your ad platforms actually optimize on and your team actually trusts.",
  hero: "Use Google Analytics 4 when you want analytics, attribution, and ad performance discussions to start from the same clean purchase, lead, and lifecycle events instead of three different versions of the truth.",
  repository: "https://github.com/managed-components/google-analytics-4",
  points: [
    "Reuse the same clean event names across ads and analytics",
    "Reduce mismatches between GA4 totals and ad platform conversions",
    "Make funnel reporting easier to trust across channels, teams, and tools"
  ],
  useCases: [
    "Shared purchase and lead events across GA4 and ad tools",
    "Campaign reporting with cleaner funnel consistency",
    "Teams that want less manual reconciliation between analytics, media, and revenue reporting"
  ]
};
