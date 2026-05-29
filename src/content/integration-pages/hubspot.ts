import type { IntegrationItem } from "./types";

export const hubspot: IntegrationItem = {
  slug: "hubspot",
  label: "HubSpot",
  title: "HubSpot integration",
  summary: "Keep CRM updates, lead capture, and lifecycle automation aligned with the same conversion truth used in marketing.",
  hero: "Use HubSpot when sales and marketing need one trusted stream for leads, lifecycle changes, and revenue events instead of disconnected forms, automations, and CRM updates.",
  repository: "https://github.com/managed-components/hubspot",
  points: [
    "Keep CRM updates closer to the same source as ad and site conversions",
    "Reduce duplicated lead handling across forms, campaigns, and automation",
    "Make lifecycle and revenue events easier to trust across marketing and sales teams"
  ],
  useCases: [
    "Lead intake from forms, calls, and qualification steps",
    "Lifecycle updates tied to purchases and pipeline movement",
    "Teams that want a cleaner handoff from campaign click to CRM record"
  ]
};
