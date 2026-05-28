export const compareContent = {
  title: "EventsGateway Comparisons",
  eyebrow: "Tracker Comparisons",
  intro:
    "Compare EventsGateway with Cloudflare Zaraz, RudderStack, Segment, GTM server-side setups, PostHog, JENTIS, Stape-based setups, Plausible, Matomo, GA4 plus GTM, Mixpanel, Amplitude, Heap, Snowplow, Adobe Analytics, Simple Analytics, Fathom, Piwik PRO, direct Meta Pixel setups, and direct TikTok Pixel setups. The goal is not generic feature parity. The goal is to explain where EventsGateway fits best: canonical event collection, Cloudflare-native runtime, low-friction install, and small-site-friendly cost control.",
  cards: [
    {
      slug: "cloudflare-zaraz",
      title: "EventsGateway vs Cloudflare Zaraz",
      text: "Compare direct event routing and canonical event control against Cloudflare's tag orchestration layer.",
      eyebrow: "Cloudflare comparison",
      category: "Tag Manager"
    },
    {
      slug: "rudderstack",
      title: "EventsGateway vs RudderStack",
      text: "Compare a Cloudflare-native event gateway against a broader customer data pipeline platform.",
      eyebrow: "CDP comparison",
      category: "CDP"
    },
    {
      slug: "segment",
      title: "EventsGateway vs Segment",
      text: "Understand when a lightweight canonical event gateway is a better fit than a full CDP workflow.",
      eyebrow: "CDP comparison",
      category: "CDP"
    },
    {
      slug: "posthog",
      title: "EventsGateway vs PostHog",
      text: "See the difference between product analytics depth and destination-first event routing control.",
      eyebrow: "Analytics comparison",
      category: "Analytics"
    },
    {
      slug: "gtm-server-side",
      title: "EventsGateway vs GTM Server-Side",
      text: "Compare UI-driven tag containers with a dedicated routing-first event layer on Cloudflare.",
      eyebrow: "Tagging comparison",
      category: "Tag Manager"
    },
    {
      slug: "jentis",
      title: "EventsGateway vs JENTIS",
      text: "Compare a privacy-heavy server-side data collection platform with a lean Cloudflare-native event gateway.",
      eyebrow: "Server-side comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "stape-gtm-ss",
      title: "EventsGateway vs Stape + GTM Server-Side",
      text: "Compare managed hosting for GTM server-side against a dedicated Cloudflare-native tracking product.",
      eyebrow: "Hosting comparison",
      category: "Tag Manager"
    },
    {
      slug: "plausible",
      title: "EventsGateway vs Plausible",
      text: "See the difference between lightweight web analytics and multi-destination tracking control.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "matomo",
      title: "EventsGateway vs Matomo",
      text: "Compare privacy-friendly analytics ownership with routing-first destination delivery.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "ga4-gtm",
      title: "EventsGateway vs GA4 + GTM",
      text: "Compare a common default analytics stack against a dedicated canonical event gateway.",
      eyebrow: "Google stack comparison",
      category: "Analytics"
    },
    {
      slug: "mixpanel",
      title: "EventsGateway vs Mixpanel",
      text: "Compare product analytics depth with destination-first routing control and ad-platform delivery.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "amplitude",
      title: "EventsGateway vs Amplitude",
      text: "Compare behavioral analytics depth with a lean Cloudflare-native event gateway.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "heap",
      title: "EventsGateway vs Heap",
      text: "Compare automatic product analytics capture with explicit canonical event routing.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "snowplow",
      title: "EventsGateway vs Snowplow",
      text: "Compare a data-engineering-heavy event pipeline with a deployable routing-first tracking layer.",
      eyebrow: "Pipeline comparison",
      category: "CDP"
    },
    {
      slug: "adobe-analytics",
      title: "EventsGateway vs Adobe Analytics",
      text: "Compare enterprise analytics depth with an open-source Cloudflare-native routing layer.",
      eyebrow: "Enterprise analytics comparison",
      category: "Analytics"
    },
    {
      slug: "simple-analytics",
      title: "EventsGateway vs Simple Analytics",
      text: "Compare minimalist privacy analytics with one-to-many event collection and delivery control.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "fathom",
      title: "EventsGateway vs Fathom",
      text: "Compare clean privacy analytics with a routing-first event gateway built for ad and analytics destinations.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "piwik-pro",
      title: "EventsGateway vs Piwik PRO",
      text: "Compare privacy and governance-heavy analytics against a lighter Cloudflare-native routing platform.",
      eyebrow: "Privacy analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "meta-pixel-direct",
      title: "EventsGateway vs Meta Pixel Direct",
      text: "Compare vendor-direct browser tagging with a canonical event layer that can also feed Meta.",
      eyebrow: "Ad platform comparison",
      category: "Ad Pixel"
    },
    {
      slug: "tiktok-pixel-direct",
      title: "EventsGateway vs TikTok Pixel Direct",
      text: "Compare direct TikTok browser tagging with a neutral tracking layer that can feed TikTok and more.",
      eyebrow: "Ad platform comparison",
      category: "Ad Pixel"
    }
  ],
  categories: [
    {
      title: "Analytics",
      description: "Tools focused on reporting, behavioral analysis, journeys, funnels, and product or web analytics."
    },
    {
      title: "CDP",
      description: "Platforms focused on customer data pipelines, warehouse movement, identity, and broader data orchestration."
    },
    {
      title: "Tag Manager",
      description: "Tools and setups centered on tags, tag containers, and server-side tagging operations."
    },
    {
      title: "Ad Pixel",
      description: "Vendor-direct pixels and browser-side ad platform integrations."
    },
    {
      title: "Privacy Analytics",
      description: "Privacy-led analytics and governance-heavy measurement platforms."
    }
  ],
  summary: [
    "EventsGateway is strongest when you want one browser-side event contract and flexible downstream routing.",
    "Cloudflare-native deployment matters if you want a small operational footprint and a free-tier-friendly starting point.",
    "Broader CDPs often win on warehouse activation and identity graphs, while EventsGateway wins on directness, install simplicity, and event gateway control.",
    "Analytics tools can be excellent for reporting, but EventsGateway becomes more compelling when you need routing, retry logic, transformations, and multi-destination delivery from one canonical source."
  ]
} as const;
