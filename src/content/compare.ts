export const compareContent = {
  title: "EVENTS Gateway Comparisons",
  eyebrow: "Tracker Comparisons",
  intro:
    "See why performance teams are abandoning bloated CDPs and fragile GTM setups for a routing-first event gateway. Compare EVENTS Gateway with Cloudflare Zaraz, RudderStack, Segment, GTM server-side setups, PostHog, JENTIS, Stape-based setups, Plausible, Matomo, GA4 plus GTM, Mixpanel, Amplitude, Heap, Snowplow, Adobe Analytics, Simple Analytics, Fathom, Piwik PRO, direct Meta Pixel setups, and direct TikTok Pixel setups. These pages are written for performance teams that care about Meta signal quality, Event Match Quality (EMQ) posture, cost clarity, and one clean event stream that can feed every channel.",
  cards: [
    {
      slug: "cloudflare-zaraz",
      title: "EVENTS Gateway vs Cloudflare Zaraz",
      text: "Compare direct event routing and canonical event control against Cloudflare's tag orchestration layer.",
      eyebrow: "Cloudflare comparison",
      category: "Tag Manager"
    },
    {
      slug: "rudderstack",
      title: "EVENTS Gateway vs RudderStack",
      text: "Compare a lean event-routing product against a broader customer data pipeline platform.",
      eyebrow: "CDP comparison",
      category: "CDP"
    },
    {
      slug: "segment",
      title: "EVENTS Gateway vs Segment",
      text: "Understand when a lightweight canonical event gateway is a better fit than a full CDP workflow.",
      eyebrow: "CDP comparison",
      category: "CDP"
    },
    {
      slug: "posthog",
      title: "EVENTS Gateway vs PostHog",
      text: "See the difference between product analytics depth and destination-first event routing control.",
      eyebrow: "Analytics comparison",
      category: "Analytics"
    },
    {
      slug: "gtm-server-side",
      title: "EVENTS Gateway vs GTM Server-Side",
      text: "Compare container-heavy tagging and server maintenance headaches with a managed, routing-first event layer built for cleaner ad signal.",
      eyebrow: "Tagging comparison",
      category: "Tag Manager"
    },
    {
      slug: "jentis",
      title: "EVENTS Gateway vs JENTIS",
      text: "Compare a privacy-heavy server-side data collection platform with a lean event gateway built for ad and analytics routing.",
      eyebrow: "Server-side comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "stape-gtm-ss",
      title: "EVENTS Gateway vs Stape + GTM Server-Side",
      text: "Compare managed GTM server-side hosting against a dedicated tracking product with one event contract.",
      eyebrow: "Hosting comparison",
      category: "Tag Manager"
    },
    {
      slug: "plausible",
      title: "EVENTS Gateway vs Plausible",
      text: "See the difference between lightweight web analytics and multi-destination tracking control.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "matomo",
      title: "EVENTS Gateway vs Matomo",
      text: "Compare privacy-friendly analytics ownership with routing-first destination delivery.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "ga4-gtm",
      title: "EVENTS Gateway vs GA4 + GTM",
      text: "Compare a common default analytics stack against a dedicated canonical event gateway.",
      eyebrow: "Google stack comparison",
      category: "Analytics"
    },
    {
      slug: "mixpanel",
      title: "EVENTS Gateway vs Mixpanel",
      text: "Compare product analytics depth with destination-first routing control and ad-platform delivery.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "amplitude",
      title: "EVENTS Gateway vs Amplitude",
      text: "Compare behavioral analytics depth with a lean event gateway focused on routing and signal quality.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "heap",
      title: "EVENTS Gateway vs Heap",
      text: "Compare automatic product analytics capture with explicit canonical event routing.",
      eyebrow: "Product analytics comparison",
      category: "Analytics"
    },
    {
      slug: "snowplow",
      title: "EVENTS Gateway vs Snowplow",
      text: "Compare a data-engineering-heavy event pipeline with a deployable routing-first tracking layer.",
      eyebrow: "Pipeline comparison",
      category: "CDP"
    },
    {
      slug: "adobe-analytics",
      title: "EVENTS Gateway vs Adobe Analytics",
      text: "Compare enterprise analytics depth with an open-source routing layer focused on collection, routing, and delivery.",
      eyebrow: "Enterprise analytics comparison",
      category: "Analytics"
    },
    {
      slug: "simple-analytics",
      title: "EVENTS Gateway vs Simple Analytics",
      text: "Compare minimalist privacy analytics with one-to-many event collection and delivery control.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "fathom",
      title: "EVENTS Gateway vs Fathom",
      text: "Compare clean privacy analytics with a routing-first event gateway built for ad and analytics destinations.",
      eyebrow: "Analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "piwik-pro",
      title: "EVENTS Gateway vs Piwik PRO",
      text: "Compare privacy and governance-heavy analytics against a lighter routing platform for performance teams.",
      eyebrow: "Privacy analytics comparison",
      category: "Privacy Analytics"
    },
    {
      slug: "meta-pixel-direct",
      title: "EVENTS Gateway vs Meta Pixel Direct",
      text: "Compare vendor-direct browser tagging with a canonical event layer that can also feed Meta.",
      eyebrow: "Ad platform comparison",
      category: "Ad Pixel"
    },
    {
      slug: "tiktok-pixel-direct",
      title: "EVENTS Gateway vs TikTok Pixel Direct",
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
    "EVENTS Gateway is strongest when you want one browser-side event contract and stronger downstream routing for Meta, Google, TikTok, and analytics tools.",
    "The biggest commercial advantage is signal quality plus cost clarity: one implementation, one event model, and one lower-cost routing layer.",
    "Broader CDPs often win on warehouse activation and identity graphs, while EVENTS Gateway wins on directness, launch speed, and routing control for advertisers.",
    "Analytics tools can be excellent for reporting, but EVENTS Gateway becomes more compelling when you need better Event Match Quality (EMQ) posture, retries, transformations, and multi-destination delivery from one canonical source."
  ]
} as const;
