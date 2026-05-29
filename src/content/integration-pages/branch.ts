import type { IntegrationItem } from "./types";

export const branch: IntegrationItem = {
  slug: "branch",
  label: "Branch",
  title: "Branch integration",
  summary: "Unify app attribution, deep links, and downstream conversions so mobile growth decisions rely on cleaner data.",
  hero: "Use Branch when install, reopen, and in-app journeys need to stay connected to the same trusted conversion events your team already uses across web and paid media.",
  repository: "https://github.com/managed-components/branch",
  points: [
    "Keep Branch attribution closer to the same source of truth as site and app tracking",
    "Reduce drift between deep-link journeys, re-engagement flows, and paid campaign reports",
    "Make install and post-install conversion data easier to trust"
  ],
  useCases: [
    "App install and app reopen campaigns across paid channels",
    "Mobile deep-link journeys tied to ads, email, or referral traffic",
    "Teams that need clearer web-to-app attribution and reporting"
  ]
};
