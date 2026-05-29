import type { IntegrationItem } from "./types";

export const mixpanel: IntegrationItem = {
  slug: "mixpanel",
  label: "Mixpanel",
  title: "Mixpanel integration",
  summary: "Keep product analytics closer to the same event truth that drives acquisition, activation, and revenue decisions.",
  hero: "Use Mixpanel when product, growth, and marketing teams need signup, activation, purchase, and lifecycle data to stay consistent across analysis, experimentation, and campaign decisions.",
  repository: "https://github.com/managed-components/mixpanel",
  points: [
    "Keep product analytics aligned with paid media and revenue events",
    "Reduce event naming drift between product and marketing teams",
    "Make behavioral analysis easier to compare with acquisition and revenue outcomes"
  ],
  useCases: [
    "Signup and onboarding funnel analysis",
    "Feature usage tied to acquisition quality",
    "Lifecycle reporting that combines product, marketing, and revenue data"
  ]
};
