import type { IntegrationItem } from "./types";

export const google_analytics: IntegrationItem = {
  slug: "google-analytics",
  label: "Google Analytics",
  title: "Classic Google Analytics Kept In Sync With Modern Event Routing",
  summary: "Keep classic Google Analytics reporting closer to the same clean events used by your marketing stack.",
  hero: "Use Google Analytics when legacy reporting still matters and you want analytics inputs to stay aligned with the same purchase, lead, and engagement events used across ads and downstream tools.",
  repository: "https://github.com/managed-components/google-analytics",
  whyTitle: "Why older analytics setups still benefit from cleaner event routing",
  whyDescription: "Legacy analytics should not force your team to keep legacy tracking chaos. These are the reasons to keep classic Google Analytics on the same structured event layer.",
  useCasesTitle: "Where classic Google Analytics still delivers value",
  useCasesDescription: "These are the situations where older analytics workflows still matter enough to justify cleaner support.",
  ctaTitle: "Support legacy analytics without carrying legacy tracking chaos forward.",
  ctaText: "Keep older Google Analytics reporting alive on the same structured event model used by the rest of your stack, so migration work does not create parallel truths.",
  reasons: [
    {
      title: "Reporting Continuity",
      text: "Keep classic dashboards usable while the rest of the stack modernizes around them."
    },
    {
      title: "Shared Event Model",
      text: "Reuse one event model across analytics and paid media workflows instead of preserving separate legacy definitions."
    },
    {
      title: "Less Manual Drift",
      text: "Reduce manual differences between analytics tagging and ad tracking."
    },
    {
      title: "Migration Safety",
      text: "Make reporting easier to compare during migrations and legacy support periods."
    },
    {
      title: "Lower Rebuild Cost",
      text: "Support old reporting without rebuilding a separate measurement stack just for one tool."
    },
    {
      title: "Cleaner Stakeholder Readouts",
      text: "Give teams that still rely on older reports a version of the truth that stays closer to current systems."
    }
  ],
  useCases: [
    {
      title: "Legacy Dashboards",
      text: "Support business units that still rely on long-running Google Analytics reports."
    },
    {
      title: "Migration Windows",
      text: "Bridge reporting during transitions to newer analytics tools."
    },
    {
      title: "Historical Comparisons",
      text: "Keep historical trend analysis possible while using newer routing underneath."
    },
    {
      title: "Executive Reporting",
      text: "Preserve familiar metrics for stakeholders who have not moved off older reports yet."
    },
    {
      title: "Audit Projects",
      text: "Compare legacy analytics behavior with new event routing during validation work."
    },
    {
      title: "Mixed Tool Environments",
      text: "Support teams that operate both older and newer analytics tools in parallel."
    }
  ]
};
