import type { IntegrationItem } from "./types";

export const google_analytics: IntegrationItem = {
  slug: "google-analytics",
  label: "Google Analytics",
  title: "Google Analytics integration",
  summary: "Keep classic Google Analytics reporting closer to the same clean events used by your marketing stack.",
  hero: "Use Google Analytics when legacy reporting still matters and you want analytics inputs to stay aligned with the same purchase, lead, and engagement events used across ads and downstream tools.",
  repository: "https://github.com/managed-components/google-analytics",
  points: [
    "Reuse one event model across analytics and paid media workflows",
    "Reduce manual differences between analytics tagging and ad tracking",
    "Keep reporting easier to compare during migrations and legacy support periods"
  ],
  useCases: [
    "Legacy analytics environments that still drive reporting",
    "Migration periods that need continuity with older dashboards",
    "Teams that want one measurement layer across older and newer analytics tools"
  ]
};
