import { integrationItems } from "./integration-pages";

export const integrationsContent = {
  eyebrow: "Integrations",
  title: "One event stream. Every destination that matters.",
  intro:
    "Browse the full EVENTS Gateway integration catalog and connect the tools that drive acquisition, attribution, analytics, CRM, and downstream reporting. Keep one clean event model, reduce duplicate tagging, and send better data everywhere.",
  items: integrationItems
} as const;

export type IntegrationSlug = (typeof integrationsContent.items)[number]["slug"];
