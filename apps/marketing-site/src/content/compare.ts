export const compareContent = {
  title: "EventsGateway Comparisons",
  eyebrow: "Tracker Comparisons",
  intro:
    "Compare EventsGateway with Cloudflare Zaraz, RudderStack, Segment, GTM server-side setups, and PostHog. The goal is not generic feature parity. The goal is to explain where EventsGateway fits best: canonical event collection, Cloudflare-native runtime, low-friction install, and small-site-friendly cost control.",
  cards: [
    {
      slug: "cloudflare-zaraz",
      title: "EventsGateway vs Cloudflare Zaraz",
      text: "Compare direct event routing and canonical event control against Cloudflare's tag orchestration layer.",
      eyebrow: "Cloudflare comparison"
    },
    {
      slug: "rudderstack",
      title: "EventsGateway vs RudderStack",
      text: "Compare a Cloudflare-native event gateway against a broader customer data pipeline platform.",
      eyebrow: "CDP comparison"
    },
    {
      slug: "segment",
      title: "EventsGateway vs Segment",
      text: "Understand when a lightweight canonical event gateway is a better fit than a full CDP workflow.",
      eyebrow: "CDP comparison"
    },
    {
      slug: "posthog",
      title: "EventsGateway vs PostHog",
      text: "See the difference between product analytics depth and destination-first event routing control.",
      eyebrow: "Analytics comparison"
    },
    {
      slug: "gtm-server-side",
      title: "EventsGateway vs GTM Server-Side",
      text: "Compare UI-driven tag containers with a dedicated routing-first event layer on Cloudflare.",
      eyebrow: "Tagging comparison"
    }
  ],
  summary: [
    "EventsGateway is strongest when you want one browser-side event contract and flexible downstream routing.",
    "Cloudflare-native deployment matters if you want a small operational footprint and a free-tier-friendly starting point.",
    "Broader CDPs often win on warehouse activation and identity graphs, while EventsGateway wins on directness, install simplicity, and event gateway control."
  ]
} as const;
