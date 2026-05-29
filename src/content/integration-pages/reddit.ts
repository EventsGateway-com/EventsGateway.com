import type { IntegrationItem } from "./types";

export const reddit: IntegrationItem = {
  slug: "reddit",
  label: "Reddit",
  title: "Reddit integration",
  summary: "Keep Reddit Ads conversions cleaner and easier to compare with the rest of your paid media stack and funnel reporting.",
  hero: "Use Reddit when community-led acquisition needs purchase, signup, and lead events that stay consistent across campaigns, landing pages, and the rest of your downstream reporting.",
  repository: "https://github.com/managed-components/reddit",
  points: [
    "Align Reddit campaign conversions with other ad platforms",
    "Reduce event drift across community, content, and landing page experiences",
    "Make testing and iteration easier with one reusable conversion layer"
  ],
  useCases: [
    "Product launches and niche community campaigns",
    "Signup and lead tracking from discussion-driven traffic",
    "Remarketing tied to engagement signals and downstream conversions"
  ]
};
