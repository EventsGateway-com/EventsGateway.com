import type { IntegrationItem } from "./types";

export const facebook_pixel: IntegrationItem = {
  slug: "facebook-pixel",
  label: "Facebook Pixel",
  title: "Meta Signal Quality For Teams That Want Higher EMQ And Less Waste",
  summary: "Improve Meta EMQ, send stronger purchase and lead signals, and give the algorithm cleaner data to optimize on.",
  hero: "Use Facebook Pixel when Meta performance depends on better matching, cleaner browser and server-side tracking, and fewer wasted dollars caused by fragmented event setups.",
  repository: "https://github.com/managed-components/facebook-pixel",
  whyTitle: "Why Meta performance improves when the event layer gets cleaner",
  whyDescription: "Meta usually suffers first when identity, conversion timing, and browser behavior are inconsistent. These are the biggest gains from a stronger event setup.",
  useCasesTitle: "Where Facebook Pixel improvements show up fastest",
  useCasesDescription: "These are the Meta-heavy scenarios where better signal quality usually creates the most visible lift.",
  ctaTitle: "Feed Meta stronger signals instead of asking the algorithm to guess.",
  ctaText: "Route cleaner identity, lead, and purchase events into Meta so EMQ, audience quality, and campaign learning improve without a fragile browser-only setup.",
  reasons: [
    {
      title: "Higher EMQ",
      text: "Improve Event Match Quality with cleaner identity, purchase, and lead events that Meta can actually match."
    },
    {
      title: "Cleaner Browser And Server Sync",
      text: "Keep Meta browser-side and server-side signals easier to reconcile when events travel through one controlled path."
    },
    {
      title: "Less Wasted Ad Spend",
      text: "Reduce wasted ad spend caused by duplicate tags, weak payloads, and broken event logic."
    },
    {
      title: "Better Optimization Inputs",
      text: "Send stronger downstream conversion context so Meta can optimize on what matters instead of shallow clicks or page views."
    },
    {
      title: "More Reliable Retargeting",
      text: "Build audiences from cleaner identity and lifecycle events instead of noisy partial signals."
    },
    {
      title: "Fewer Debugging Loops",
      text: "Cut down the time spent tracing mismatches between Ads Manager, site behavior, and CRM outcomes."
    }
  ],
  useCases: [
    {
      title: "Ecommerce Purchases",
      text: "Track purchase, checkout, and value-based events for Meta campaigns that depend on strong signal quality."
    },
    {
      title: "Lead Generation",
      text: "Send qualified lead and booked-call events instead of stopping at simple form submits."
    },
    {
      title: "Audience Building",
      text: "Create cleaner retargeting and lookalike audiences from richer identity and lifecycle data."
    },
    {
      title: "Mobile Traffic",
      text: "Stabilize conversion signals on mobile sessions where browser-only tracking weakens fastest."
    },
    {
      title: "Multi-Funnel Accounts",
      text: "Reuse one event layer across stores, funnels, and landing pages instead of many separate Meta setups."
    },
    {
      title: "ROAS Recovery",
      text: "Tighten conversion truth when Meta performance is slipping because the account is learning from low-quality inputs."
    }
  ]
};
