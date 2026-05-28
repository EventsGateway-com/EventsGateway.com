export const compareContent = {
  title: "EventsGateway Comparisons",
  eyebrow: "Tracker Comparisons",
  intro:
    "Compare EventsGateway with Cloudflare Zaraz, RudderStack, Segment, GTM server-side setups, PostHog, JENTIS, Stape-based setups, Plausible, Matomo, and GA4 plus GTM. The goal is not generic feature parity. The goal is to explain where EventsGateway fits best: canonical event collection, Cloudflare-native runtime, low-friction install, and small-site-friendly cost control.",
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
    },
    {
      slug: "jentis",
      title: "EventsGateway vs JENTIS",
      text: "Compare a privacy-heavy server-side data collection platform with a lean Cloudflare-native event gateway.",
      eyebrow: "Server-side comparison"
    },
    {
      slug: "stape-gtm-ss",
      title: "EventsGateway vs Stape + GTM Server-Side",
      text: "Compare managed hosting for GTM server-side against a dedicated Cloudflare-native tracking product.",
      eyebrow: "Hosting comparison"
    },
    {
      slug: "plausible",
      title: "EventsGateway vs Plausible",
      text: "See the difference between lightweight web analytics and multi-destination tracking control.",
      eyebrow: "Analytics comparison"
    },
    {
      slug: "matomo",
      title: "EventsGateway vs Matomo",
      text: "Compare privacy-friendly analytics ownership with routing-first destination delivery.",
      eyebrow: "Analytics comparison"
    },
    {
      slug: "ga4-gtm",
      title: "EventsGateway vs GA4 + GTM",
      text: "Compare a common default analytics stack against a dedicated canonical event gateway.",
      eyebrow: "Google stack comparison"
    }
  ],
  summary: [
    "EventsGateway is strongest when you want one browser-side event contract and flexible downstream routing.",
    "Cloudflare-native deployment matters if you want a small operational footprint and a free-tier-friendly starting point.",
    "Broader CDPs often win on warehouse activation and identity graphs, while EventsGateway wins on directness, install simplicity, and event gateway control.",
    "Analytics tools can be excellent for reporting, but EventsGateway becomes more compelling when you need routing, retry logic, transformations, and multi-destination delivery from one canonical source."
  ]
} as const;
