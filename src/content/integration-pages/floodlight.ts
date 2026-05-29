import type { IntegrationItem } from "./types";

export const floodlight: IntegrationItem = {
  slug: "floodlight",
  label: "Floodlight",
  title: "Floodlight integration",
  summary: "Keep Floodlight conversion data cleaner and easier to compare with the rest of your enterprise measurement stack.",
  hero: "Use Floodlight when Google Marketing Platform reporting, attribution, and media operations all need to start from the same trusted conversion events used elsewhere in the business.",
  repository: "https://github.com/managed-components/floodlight",
  points: [
    "Align Floodlight activities with the same purchase and lead events used elsewhere",
    "Reduce implementation drift across ad serving, attribution, and reporting workflows",
    "Make enterprise media measurement easier to reconcile across systems and teams"
  ],
  useCases: [
    "Google Marketing Platform reporting programs",
    "Floodlight-based attribution and activity tracking",
    "Large paid media teams with agency and in-house reporting requirements"
  ]
};
