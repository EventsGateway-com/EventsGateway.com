import type { IntegrationItem } from "./types";

export const twitter: IntegrationItem = {
  slug: "twitter",
  label: "Twitter",
  title: "Twitter Conversion Tracking That Stays In Sync With The Rest Of Paid Media",
  summary: "Keep Twitter conversion and audience signals tied to the same trusted event stream as the rest of your paid channels.",
  hero: "Use Twitter when performance campaigns and audience workflows need cleaner conversion data without extra tagging drift between content campaigns, direct response pushes, and analytics.",
  repository: "https://github.com/managed-components/twitter",
  whyTitle: "Why Twitter needs cleaner conversion structure to stay useful",
  whyDescription: "Twitter often lives in a mix of content and direct response motion, which makes consistent downstream events especially important. These are the biggest gains from tightening it up.",
  useCasesTitle: "Where Twitter event quality improves measurement the most",
  useCasesDescription: "These are the Twitter campaign situations where cleaner signals usually make reporting and optimization more trustworthy.",
  reasons: [
    {
      title: "Cross-Social Consistency",
      text: "Keep Twitter conversion signals consistent with other paid social channels."
    },
    {
      title: "Less Campaign Drift",
      text: "Reduce implementation drift across content and direct response campaigns."
    },
    {
      title: "Reusable Audience Logic",
      text: "Make audience and conversion tracking easier to reuse across campaigns."
    },
    {
      title: "Cleaner Downstream Reporting",
      text: "Compare Twitter outcomes with analytics and revenue systems through one shared event layer."
    },
    {
      title: "Lower Tagging Overhead",
      text: "Avoid separate setup logic every time a content experiment or launch goes live."
    },
    {
      title: "Better Growth Readouts",
      text: "Judge whether Twitter drives meaningful signups or leads, not just engagement spikes."
    }
  ],
  useCases: [
    {
      title: "Performance Campaigns",
      text: "Send lead and signup events into Twitter for direct response programs."
    },
    {
      title: "Content-Led Acquisition",
      text: "Track downstream outcomes from content-driven traffic and conversation-led campaigns."
    },
    {
      title: "Audience Workflows",
      text: "Use lifecycle and conversion signals for cleaner segmentation and retargeting."
    },
    {
      title: "Launch Programs",
      text: "Support launches that combine awareness, traffic, and conversion objectives."
    },
    {
      title: "Cross-Social Analysis",
      text: "Compare Twitter with Meta, LinkedIn, or TikTok using shared event definitions."
    },
    {
      title: "Mixed Campaign Types",
      text: "Keep content and direct response programs tied to one conversion truth."
    }
  ]
};
