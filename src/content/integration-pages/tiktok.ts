import type { IntegrationItem } from "./types";

export const tiktok: IntegrationItem = {
  slug: "tiktok",
  label: "TikTok",
  title: "TikTok integration",
  summary: "Send TikTok cleaner purchase and lead signals without building a separate tracking setup just for one channel.",
  hero: "Use TikTok when campaign learning depends on stronger mobile signals, cleaner attribution, and one reusable event stream that also serves the rest of your paid media stack.",
  repository: "https://github.com/managed-components/tiktok",
  points: [
    "Keep TikTok conversion data aligned with Meta and Google Ads",
    "Improve signal consistency across mobile-heavy acquisition funnels",
    "Avoid channel-by-channel tracking drift as creative volume and campaign count scale"
  ],
  useCases: [
    "Lead generation campaigns on mobile-heavy traffic",
    "Purchase events reused across multiple paid channels",
    "Paid social setups that need one cleaner conversion layer across the board"
  ]
};
