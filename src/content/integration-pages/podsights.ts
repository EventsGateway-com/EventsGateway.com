import type { IntegrationItem } from "./types";

export const podsights: IntegrationItem = {
  slug: "podsights",
  label: "Podsights",
  title: "Podsights integration",
  summary: "Connect podcast attribution to cleaner downstream conversions instead of disconnected media estimates and guessed outcomes.",
  hero: "Use Podsights when audio campaigns need purchase and lead signals that can be tied back to the same conversion truth your team already uses across search, social, and analytics.",
  repository: "https://github.com/managed-components/podsights",
  points: [
    "Align podcast attribution with the same source of truth as other channels",
    "Reduce disconnected reporting between awareness media and conversions",
    "Make delayed conversion signals easier to interpret and defend"
  ],
  useCases: [
    "Podcast campaign attribution and lift analysis",
    "Lead or purchase tracking after audio ad exposure",
    "Cross-channel reporting that includes audio, social, and search media"
  ]
};
