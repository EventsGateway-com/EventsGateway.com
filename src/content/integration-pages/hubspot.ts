import type { IntegrationItem } from "./types";

export const hubspot: IntegrationItem = {
  slug: "hubspot",
  label: "HubSpot",
  title: "HubSpot Lifecycle Events Aligned With The Same Truth As Your Marketing",
  summary: "Keep CRM updates, lead capture, and lifecycle automation aligned with the same conversion truth used in marketing.",
  hero: "Use HubSpot when sales and marketing need one trusted stream for leads, lifecycle changes, and revenue events instead of disconnected forms, automations, and CRM updates.",
  repository: "https://github.com/managed-components/hubspot",
  whyTitle: "Why HubSpot works better when CRM and media share the same events",
  whyDescription: "When HubSpot drifts from ad and site tracking, teams stop trusting the pipeline story. These are the biggest reasons to keep CRM events on the same routing layer.",
  useCasesTitle: "Where HubSpot alignment creates the clearest revenue impact",
  useCasesDescription: "These are the CRM and lifecycle scenarios where shared event truth removes friction between teams.",
  reasons: [
    {
      title: "CRM Consistency",
      text: "Keep CRM updates closer to the same source as ad and site conversions."
    },
    {
      title: "Cleaner Lead Handoffs",
      text: "Reduce duplicated lead handling across forms, campaigns, and automation."
    },
    {
      title: "Trusted Lifecycle Events",
      text: "Make lifecycle and revenue events easier to trust across marketing and sales teams."
    },
    {
      title: "Fewer Form Logic Gaps",
      text: "Prevent the common mismatch between what a form records and what media platforms think happened."
    },
    {
      title: "Better Revenue Attribution",
      text: "Connect campaign activity to pipeline and closed revenue with less manual mapping."
    },
    {
      title: "Simpler Automation Governance",
      text: "Give operations one cleaner source for triggering workflows and reporting changes."
    }
  ],
  useCases: [
    {
      title: "Lead Intake",
      text: "Send form, call, and qualification signals into HubSpot from the same event layer used by marketing."
    },
    {
      title: "Pipeline Movement",
      text: "Track lifecycle updates tied to deals, purchases, and stage progression."
    },
    {
      title: "Sales And Marketing Alignment",
      text: "Create a cleaner handoff from campaign click to CRM record."
    },
    {
      title: "Automation Workflows",
      text: "Trigger automations from events that are consistent with the rest of your stack."
    },
    {
      title: "Attribution Projects",
      text: "Compare HubSpot pipeline outcomes with ad platform and analytics performance using one shared truth."
    },
    {
      title: "Revenue Reporting",
      text: "Support cleaner campaign-to-revenue reporting for teams that need defensible numbers."
    }
  ]
};
