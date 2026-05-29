import type { IntegrationItem } from "./types";

export const google_ads: IntegrationItem = {
  slug: "google-ads",
  label: "Google Ads",
  title: "Google Ads Conversion Actions Built On One Cleaner Event Model",
  summary: "Reduce mismatched totals and send Google Ads cleaner conversion actions for bidding, reporting, and remarketing.",
  hero: "Use Google Ads when you want conversion actions that stay cleaner across landing pages, forms, and checkout flows, without fighting constant gaps between Google Ads, GA4, and your CRM.",
  repository: "https://github.com/managed-components/google-ads",
  whyTitle: "Why Google Ads works better with cleaner downstream conversion truth",
  whyDescription: "Google Ads loses efficiency when conversions differ between ad tags, analytics, and revenue systems. These are the practical gains from a more disciplined event layer.",
  useCasesTitle: "Where Google Ads signal cleanup pays off first",
  useCasesDescription: "These are the ad account situations where better conversion routing usually improves trust and optimization fastest.",
  ctaTitle: "Let Google Ads optimize on cleaner conversions, not mismatched totals.",
  ctaText: "Send Google Ads the same trusted lead, purchase, and lifecycle events used in GA4 and revenue reporting so bidding and remarketing rely on stronger inputs.",
  reasons: [
    {
      title: "Clearer Conversion Actions",
      text: "Map clean purchase and lead events into Google Ads conversion actions once instead of managing separate tag logic everywhere."
    },
    {
      title: "Fewer GA4 Gaps",
      text: "Keep Google Ads closer to the same conversion truth as GA4 and other channels."
    },
    {
      title: "Better Bidding Inputs",
      text: "Give smart bidding cleaner signals so budget decisions reflect real funnel outcomes."
    },
    {
      title: "Less Tag Sprawl",
      text: "Reduce reporting gaps caused by duplicated scripts, separate tags, and disconnected tooling."
    },
    {
      title: "Faster Campaign Launches",
      text: "Ship new landing pages and campaigns without rebuilding your conversion layer from zero."
    },
    {
      title: "Cleaner Remarketing",
      text: "Feed audiences from the same event model that drives attribution and revenue reporting."
    }
  ],
  useCases: [
    {
      title: "Lead Funnels",
      text: "Track multi-step lead funnels with cleaner conversion actions for qualified outcomes."
    },
    {
      title: "Ecommerce Checkout",
      text: "Send purchase and checkout milestones into Google Ads with less duplication."
    },
    {
      title: "Offline Value Signals",
      text: "Extend conversions beyond simple form submits when revenue happens later in the funnel."
    },
    {
      title: "Agency Accounts",
      text: "Give account managers and stakeholders a cleaner view of what Google Ads is actually driving."
    },
    {
      title: "Cross-Channel Reporting",
      text: "Compare Google Ads to Meta, GA4, and CRM data with fewer weekly reconciliation headaches."
    },
    {
      title: "Audience Programs",
      text: "Use cleaner lifecycle events for remarketing and customer segmentation."
    }
  ]
};
