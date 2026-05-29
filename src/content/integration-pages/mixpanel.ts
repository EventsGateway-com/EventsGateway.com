import type { IntegrationItem } from "./types";

export const mixpanel: IntegrationItem = {
  slug: "mixpanel",
  label: "Mixpanel",
  title: "Mixpanel Product Analytics Kept In Sync With Growth And Revenue Events",
  summary: "Keep product analytics closer to the same event truth that drives acquisition, activation, and revenue decisions.",
  hero: "Use Mixpanel when product, growth, and marketing teams need signup, activation, purchase, and lifecycle data to stay consistent across analysis, experimentation, and campaign decisions.",
  repository: "https://github.com/managed-components/mixpanel",
  whyTitle: "Why Mixpanel is stronger when product and acquisition share event definitions",
  whyDescription: "Product analytics loses leverage when it uses a different language than marketing and revenue systems. These are the biggest benefits of tying Mixpanel to one event truth.",
  useCasesTitle: "Where Mixpanel alignment improves growth analysis the most",
  useCasesDescription: "These are the product and growth scenarios where shared event definitions create the clearest advantage.",
  ctaTitle: "Keep product analytics close to the same truth that drives revenue decisions.",
  ctaText: "Use one event model for signup, activation, purchase, and lifecycle milestones so Mixpanel stays aligned with growth, media, and business reporting.",
  reasons: [
    {
      title: "Aligned Product And Revenue Data",
      text: "Keep product analytics aligned with paid media and revenue events instead of treating them as separate worlds."
    },
    {
      title: "Less Naming Drift",
      text: "Reduce event naming drift between product and marketing teams."
    },
    {
      title: "Better Behavior Analysis",
      text: "Make behavioral analysis easier to compare with acquisition and revenue outcomes."
    },
    {
      title: "Cleaner Experiment Readouts",
      text: "Judge experiments on events that stay consistent with broader business reporting."
    },
    {
      title: "Faster Cross-Team Decisions",
      text: "Let product, growth, and performance teams work from one version of important milestones."
    },
    {
      title: "Reusable Funnel Logic",
      text: "Define signup, activation, and purchase logic once and reuse it across tools."
    }
  ],
  useCases: [
    {
      title: "Signup Funnels",
      text: "Track signup and onboarding behavior using the same events referenced by acquisition teams."
    },
    {
      title: "Activation Analysis",
      text: "Compare activation quality with the channels that originally brought users in."
    },
    {
      title: "Feature Adoption",
      text: "Measure product engagement in the context of acquisition quality and lifecycle value."
    },
    {
      title: "Growth Experiments",
      text: "Run experiments on a cleaner event layer that reflects downstream outcomes."
    },
    {
      title: "Revenue Journeys",
      text: "Connect product behaviors with purchases, upgrades, or other value events."
    },
    {
      title: "Cross-Team Reporting",
      text: "Support shared reporting between product, marketing, and leadership."
    }
  ]
};
