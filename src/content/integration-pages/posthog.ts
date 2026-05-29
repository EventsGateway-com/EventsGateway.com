import type { IntegrationItem } from "./types";

export const posthog: IntegrationItem = {
  slug: "posthog",
  label: "PostHog",
  title: "PostHog integration",
  summary: "Keep product analytics, experiments, and growth reporting tied to the same event truth as acquisition and revenue.",
  hero: "Use PostHog when product teams want funnel analysis, feature usage, and experiments to stay aligned with the same signup, revenue, and lifecycle events that marketing uses to drive growth.",
  repository: "https://github.com/mountainash/posthog-managed-component",
  points: [
    "Keep product analytics aligned with marketing and revenue events",
    "Reduce event naming drift between experimentation and acquisition workflows",
    "Make funnel analysis easier to compare with campaign outcomes and revenue quality"
  ],
  useCases: [
    "Signup and activation funnel analysis",
    "Growth experiments tied to downstream revenue signals",
    "Product analytics built from the same event source as paid media and CRM"
  ]
};
