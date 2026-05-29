import type { IntegrationItem } from "./types";

export const posthog: IntegrationItem = {
  slug: "posthog",
  label: "PostHog",
  title: "PostHog Analytics And Experiments Connected To The Same Revenue Events As Marketing",
  summary: "Keep product analytics, experiments, and growth reporting tied to the same event truth as acquisition and revenue.",
  hero: "Use PostHog when product teams want funnel analysis, feature usage, and experiments to stay aligned with the same signup, revenue, and lifecycle events that marketing uses to drive growth.",
  repository: "https://github.com/mountainash/posthog-managed-component",
  whyTitle: "Why PostHog gets more strategic when product and marketing share one event language",
  whyDescription: "PostHog is most valuable when product analysis is tied to the same commercial truth as acquisition and revenue systems. These are the gains from aligning them.",
  useCasesTitle: "Where PostHog alignment improves product and growth decisions",
  useCasesDescription: "These are the product, experimentation, and funnel scenarios where shared event truth creates the clearest value.",
  ctaTitle: "Align experiments and product analytics with the revenue events marketing already uses.",
  ctaText: "Keep PostHog connected to the same signup, activation, and purchase milestones used across growth and acquisition so teams stop working from parallel event definitions.",
  reasons: [
    {
      title: "Shared Growth Truth",
      text: "Keep product analytics aligned with marketing and revenue events instead of creating parallel realities."
    },
    {
      title: "Less Experimentation Drift",
      text: "Reduce event naming drift between experimentation and acquisition workflows."
    },
    {
      title: "Better Funnel Analysis",
      text: "Make funnel analysis easier to compare with campaign outcomes and revenue quality."
    },
    {
      title: "Cross-Team Visibility",
      text: "Help product, growth, and marketing read the same lifecycle milestones."
    },
    {
      title: "Reusable Event Definitions",
      text: "Use one event model for signup, activation, purchase, and retention stages."
    },
    {
      title: "Cleaner Decision Inputs",
      text: "Base growth bets on events that already match the rest of the business reporting."
    }
  ],
  useCases: [
    {
      title: "Activation Funnels",
      text: "Track onboarding and activation events in the same system used for acquisition analysis."
    },
    {
      title: "Experiment Reviews",
      text: "Judge experiments against downstream lifecycle and revenue outcomes."
    },
    {
      title: "Feature Usage",
      text: "Compare feature adoption with the quality of users brought in by campaigns."
    },
    {
      title: "Growth Reporting",
      text: "Support shared reporting between product, growth, and marketing teams."
    },
    {
      title: "Revenue Analysis",
      text: "Connect product behavior with upgrades, purchases, or qualified lifecycle events."
    },
    {
      title: "Cross-Tool Governance",
      text: "Keep PostHog event definitions consistent with the rest of the event routing stack."
    }
  ]
};
