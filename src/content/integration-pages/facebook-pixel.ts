import type { IntegrationItem } from "./types";

export const facebook_pixel: IntegrationItem = {
  slug: "facebook-pixel",
  label: "Facebook Pixel",
  title: "Facebook Pixel integration",
  summary: "Improve Meta EMQ, send stronger purchase and lead signals, and give the algorithm cleaner data to optimize on.",
  hero: "Use Facebook Pixel when Meta performance depends on better matching, cleaner browser and server-side tracking, and fewer wasted dollars caused by fragmented event setups.",
  repository: "https://github.com/managed-components/facebook-pixel",
  points: [
    "Improve Event Match Quality with cleaner identity, purchase, and lead events",
    "Keep Meta browser and server-side signals easier to reconcile",
    "Reduce wasted ad spend caused by duplicate tags, weak payloads, and broken event logic"
  ],
  useCases: [
    "Ecommerce purchase tracking for Meta campaigns",
    "Lead forms and qualified funnel events for performance marketing",
    "Audience building and retargeting from stronger identity and conversion signals"
  ]
};
