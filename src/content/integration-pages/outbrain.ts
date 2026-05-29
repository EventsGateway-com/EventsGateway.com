import type { IntegrationItem } from "./types";

export const outbrain: IntegrationItem = {
  slug: "outbrain",
  label: "Outbrain",
  title: "Outbrain integration",
  summary: "Send cleaner lead and purchase signals into Outbrain so native campaigns learn from better downstream data, not shallow page events.",
  hero: "Use Outbrain when content discovery campaigns should optimize on cleaner leads and purchases instead of fragmented page-level tracking that hides downstream quality.",
  repository: "https://github.com/managed-components/outbrain",
  points: [
    "Keep Outbrain conversion data aligned with the rest of your paid media stack",
    "Reduce native advertising tracking drift across landing pages",
    "Make top-of-funnel to conversion reporting easier to trust and compare"
  ],
  useCases: [
    "Content discovery campaigns tied to leads or purchases",
    "Native advertising funnels with longer consideration cycles",
    "Multi-channel reporting across awareness, nurture, and conversion media"
  ]
};
