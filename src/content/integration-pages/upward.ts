import type { IntegrationItem } from "./types";

export const upward: IntegrationItem = {
  slug: "upward",
  label: "Upward",
  title: "Upward integration",
  summary: "Track cleaner lead and conversion events in Upward without adding another isolated measurement workflow to maintain.",
  hero: "Use Upward when niche acquisition channels should receive the same trusted conversion events already used across the broader paid media stack, not their own disconnected tracking logic.",
  repository: "https://github.com/managed-components/upward",
  points: [
    "Keep Upward conversion data tied to the same source of truth as other destinations",
    "Reduce duplicated setup across campaign and reporting workflows",
    "Improve trust in lead and conversion reporting for smaller channels"
  ],
  useCases: [
    "Lead generation programs using Upward",
    "Conversion reporting for niche acquisition channels",
    "Shared event logic across primary and secondary destination types"
  ]
};
