import type { IntegrationItem } from "./types";

export const taboola: IntegrationItem = {
  slug: "taboola",
  label: "Taboola",
  title: "Taboola Conversion Routing For Native Campaigns That Need Cleaner Final Outcomes",
  summary: "Route cleaner conversion events into Taboola for native discovery campaigns that need better downstream visibility and fewer reporting gaps.",
  hero: "Use Taboola when native acquisition and advertorial flows need cleaner lead and purchase data instead of fragmented landing page tagging that breaks as pages change.",
  repository: "https://github.com/managed-components/taboola",
  whyTitle: "Why Taboola performance improves with stronger post-click event quality",
  whyDescription: "Native campaigns often produce lots of page interaction but weaker downstream clarity. These are the reasons to give Taboola a better event foundation.",
  useCasesTitle: "Where Taboola cleanup improves native reporting and optimization",
  useCasesDescription: "These are the native media situations where cleaner conversion routing tends to remove the most uncertainty.",
  reasons: [
    {
      title: "Shared Native Truth",
      text: "Align native campaign tracking with the same event truth as other channels instead of treating Taboola as separate."
    },
    {
      title: "Less Landing Page Fragility",
      text: "Reduce landing page tagging differences across advertorial and content programs."
    },
    {
      title: "Cleaner Final Conversion Reporting",
      text: "Keep reporting cleaner from discovery click to final conversion."
    },
    {
      title: "Better Lead Quality Signals",
      text: "Help Taboola optimize on events closer to real pipeline or purchase value."
    },
    {
      title: "Lower Maintenance Work",
      text: "Avoid rebuilding tracking logic each time content pages or templates change."
    },
    {
      title: "More Defensible Media Reviews",
      text: "Give stakeholders a stronger read on whether native traffic becomes real business outcomes."
    }
  ],
  useCases: [
    {
      title: "Purchase Campaigns",
      text: "Track native campaigns that should drive real purchases, not just readership."
    },
    {
      title: "Lead Funnels",
      text: "Send cleaner form and qualification events from advertorial traffic into Taboola."
    },
    {
      title: "Content Programs",
      text: "Support long-form content journeys that influence but do not instantly convert."
    },
    {
      title: "Landing Page Variants",
      text: "Keep many content variants tied to one stable event model."
    },
    {
      title: "Cross-Channel Comparison",
      text: "Judge Taboola against social and search on the same conversion baseline."
    },
    {
      title: "Media Optimization Reviews",
      text: "Prune placements based on downstream quality, not just cheap engagement."
    }
  ]
};
