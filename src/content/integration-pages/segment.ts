import type { IntegrationItem } from "./types";

export const segment: IntegrationItem = {
  slug: "segment",
  label: "Segment",
  title: "Segment integration",
  summary: "Feed Segment from one cleaner event stream and extend the same conversion truth into warehouses, tools, and automation.",
  hero: "Use Segment when your team wants one controlled source for purchase, lead, and lifecycle events before routing them deeper into warehouses, SaaS tools, and downstream automation.",
  repository: "https://github.com/managed-components/segment",
  points: [
    "Keep CDP inputs aligned with paid media and analytics tracking",
    "Reduce duplicate event collection logic across tools and teams",
    "Make downstream routing easier to scale from one source of truth instead of many"
  ],
  useCases: [
    "Warehouses and SaaS destinations fed through Segment",
    "Lifecycle and product events shared across teams",
    "Data stack consolidation around one cleaner tracking and routing model"
  ]
};
