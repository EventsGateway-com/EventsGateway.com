import type { IntegrationItem } from "./types";

export const bing: IntegrationItem = {
  slug: "bing",
  label: "Bing",
  title: "Bing Conversion Tracking For Search Teams That Want Cleaner Signals",
  summary: "Push cleaner conversion actions into Microsoft Ads so bidding, reporting, and lead quality stay closer to the truth.",
  hero: "Use Bing when Microsoft Ads matters to pipeline or revenue and you want the same purchase, lead, and qualified funnel events that already power the rest of your paid search stack.",
  repository: "https://github.com/managed-components/bing",
  whyTitle: "Why Bing teams replace isolated search tagging",
  whyDescription: "Bing usually underperforms when it runs on a thinner or different version of the truth than the rest of paid search. These are the main reasons to keep it on the same event model.",
  useCasesTitle: "Where Bing tracking creates the biggest paid search advantage",
  useCasesDescription: "These are the Microsoft Ads scenarios where cleaner conversion routing usually improves trust, speed, and optimization quality.",
  ctaTitle: "Give Microsoft Ads cleaner signals without rebuilding search tracking again.",
  ctaText: "Keep Bing connected to the same purchase and qualified lead events already used across Google Ads, analytics, and CRM so paid search can scale on one conversion truth.",
  reasons: [
    {
      title: "Shared Search Truth",
      text: "Keep Bing conversion totals closer to Google Ads, analytics, and CRM numbers instead of letting each engine drift on its own."
    },
    {
      title: "Cleaner Bid Inputs",
      text: "Give Microsoft Ads cleaner conversion actions so automated bidding can learn from stronger downstream signals."
    },
    {
      title: "Less Duplicate Setup",
      text: "Reuse one conversion model across branded, non-brand, and landing page campaigns instead of rebuilding tags for each property."
    },
    {
      title: "Faster Launches",
      text: "Ship new pages and funnels faster because the core purchase and lead logic is already defined once."
    },
    {
      title: "Better Lead Quality",
      text: "Send more meaningful qualified lead events instead of relying only on shallow form-start or page-visit signals."
    },
    {
      title: "Lower Maintenance Cost",
      text: "Reduce the hidden cost of maintaining separate Microsoft Ads tagging every time a page, form, or funnel changes."
    }
  ],
  useCases: [
    {
      title: "Lead Generation",
      text: "Track form submissions, qualified leads, and booked calls for Microsoft Ads lead generation programs."
    },
    {
      title: "Ecommerce Sales",
      text: "Send purchase and checkout completion events for search-driven ecommerce funnels."
    },
    {
      title: "Multi-Engine Search",
      text: "Run Bing and Google Ads on the same conversion contract without manual reconciliation every week."
    },
    {
      title: "Landing Page Programs",
      text: "Keep campaign-specific pages tied to the same event model used on the main site."
    },
    {
      title: "Offline Qualification",
      text: "Route high-value downstream sales milestones back into the events that matter for search optimization."
    },
    {
      title: "Agency Reporting",
      text: "Give internal teams and agencies a cleaner way to compare Microsoft Ads performance with the rest of the stack."
    }
  ]
};
