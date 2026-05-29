import type { IntegrationItem } from "./types";

export const twitter: IntegrationItem = {
  slug: "twitter",
  label: "Twitter",
  title: "Twitter integration",
  summary: "Keep Twitter conversion and audience signals tied to the same trusted event stream as the rest of your paid channels.",
  hero: "Use Twitter when performance campaigns and audience workflows need cleaner conversion data without extra tagging drift between content campaigns, direct response pushes, and analytics.",
  repository: "https://github.com/managed-components/twitter",
  points: [
    "Keep Twitter conversion signals consistent with other paid social channels",
    "Reduce implementation drift across content and direct response campaigns",
    "Make audience and conversion tracking easier to reuse across campaigns"
  ],
  useCases: [
    "Performance campaigns on Twitter",
    "Lead and signup tracking from content-driven traffic",
    "Audience workflows that share the same event truth used on other platforms"
  ]
};
