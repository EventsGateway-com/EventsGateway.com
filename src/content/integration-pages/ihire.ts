import type { IntegrationItem } from "./types";

export const ihire: IntegrationItem = {
  slug: "ihire",
  label: "iHire",
  title: "iHire integration",
  summary: "Track cleaner application and candidate conversions for recruitment programs running through iHire.",
  hero: "Use iHire when hiring campaigns need dependable application events, candidate milestones, and clearer reporting across recruitment landing pages, media sources, and internal hiring teams.",
  repository: "https://github.com/managed-components/iHire",
  points: [
    "Keep recruitment conversions aligned with the rest of your acquisition reporting",
    "Reduce noise between ad clicks, applications, and candidate journeys",
    "Reuse one cleaner event setup across hiring funnels instead of patching multiple tools together"
  ],
  useCases: [
    "Application completion tracking for job campaigns",
    "Candidate lead capture from recruitment pages",
    "Hiring funnels measured alongside the rest of paid acquisition"
  ]
};
