import type { IntegrationItem } from "./types";

export const taboola: IntegrationItem = {
  slug: "taboola",
  label: "Taboola",
  title: "Taboola integration",
  summary: "Route cleaner conversion events into Taboola for native discovery campaigns that need better downstream visibility and fewer reporting gaps.",
  hero: "Use Taboola when native acquisition and advertorial flows need cleaner lead and purchase data instead of fragmented landing page tagging that breaks as pages change.",
  repository: "https://github.com/managed-components/taboola",
  points: [
    "Align native campaign tracking with the same event truth as other channels",
    "Reduce landing page tagging differences across content programs",
    "Keep reporting cleaner from discovery click to final conversion"
  ],
  useCases: [
    "Native discovery campaigns with purchase goals",
    "Lead generation funnels supported by advertorial content",
    "Cross-channel reporting across native, search, and paid social media"
  ]
};
