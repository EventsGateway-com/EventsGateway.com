export const compareMeta = {
  "cloudflare-zaraz": {
    category: "Tag Manager",
    bestFor: "Best for teams replacing tag orchestration",
    scorecard: [
      { label: "Canonical event control", alternative: 2, eventsgateway: 5, note: "EventsGateway gives the browser one stable event contract." },
      { label: "Destination routing depth", alternative: 3, eventsgateway: 5, note: "Routing rules and fan-out are first-class in EventsGateway." },
      { label: "Cloudflare-native fit", alternative: 5, eventsgateway: 5, note: "Both fit Cloudflare-native teams well." }
    ]
  },
  rudderstack: {
    category: "CDP",
    bestFor: "Best for teams wanting a lighter CDP alternative",
    scorecard: [
      { label: "Operational simplicity", alternative: 2, eventsgateway: 5, note: "EventsGateway is narrower and easier to deploy." },
      { label: "Warehouse-centric breadth", alternative: 5, eventsgateway: 2, note: "RudderStack is broader for warehouse-heavy workflows." },
      { label: "Cloudflare-native deployment", alternative: 1, eventsgateway: 5, note: "EventsGateway is purpose-positioned for Cloudflare." }
    ]
  },
  segment: {
    category: "CDP",
    bestFor: "Best for teams outgrowing a classic CDP bill",
    scorecard: [
      { label: "Ecosystem breadth", alternative: 5, eventsgateway: 3, note: "Segment stays broader across enterprise integrations." },
      { label: "Routing-first clarity", alternative: 3, eventsgateway: 5, note: "EventsGateway keeps the story focused on collection and routing." },
      { label: "Small-site cost fit", alternative: 2, eventsgateway: 5, note: "EventsGateway is positioned better for lean deployments." }
    ]
  },
  posthog: {
    category: "Analytics",
    bestFor: "Best for teams choosing routing over product analytics depth",
    scorecard: [
      { label: "Product analytics depth", alternative: 5, eventsgateway: 2, note: "PostHog wins on replay, funnels, and product insight." },
      { label: "Ad destination routing", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger for sending to multiple ad tools." },
      { label: "Canonical tracking layer", alternative: 3, eventsgateway: 5, note: "EventsGateway is built around a neutral event contract." }
    ]
  },
  "gtm-server-side": {
    category: "Tag Manager",
    bestFor: "Best for teams replacing container-heavy tagging",
    scorecard: [
      { label: "Tag-container familiarity", alternative: 5, eventsgateway: 2, note: "GTM wins if the team is deeply container-oriented." },
      { label: "Routing-first product model", alternative: 2, eventsgateway: 5, note: "EventsGateway is clearer when routing is the main problem." },
      { label: "Vendor neutrality", alternative: 3, eventsgateway: 5, note: "EventsGateway sits above vendor-specific tag logic." }
    ]
  },
  jentis: {
    category: "Privacy Analytics",
    bestFor: "Best for teams wanting privacy plus open routing",
    scorecard: [
      { label: "Privacy-led positioning", alternative: 5, eventsgateway: 4, note: "JENTIS is more privacy-centric in positioning." },
      { label: "Open-source flexibility", alternative: 1, eventsgateway: 5, note: "EventsGateway is the stronger open-source option." },
      { label: "Cloudflare-native fit", alternative: 1, eventsgateway: 5, note: "EventsGateway is built around Cloudflare-native deployment." }
    ]
  },
  "stape-gtm-ss": {
    category: "Tag Manager",
    bestFor: "Best for teams leaving managed GTM server-side hosting",
    scorecard: [
      { label: "Managed GTM convenience", alternative: 5, eventsgateway: 2, note: "Stape wins if GTM server-side is already the chosen model." },
      { label: "Cleaner product architecture", alternative: 2, eventsgateway: 5, note: "EventsGateway is easier to position as a product, not hosting." },
      { label: "Canonical event layer", alternative: 2, eventsgateway: 5, note: "EventsGateway makes the event contract explicit." }
    ]
  },
  plausible: {
    category: "Privacy Analytics",
    bestFor: "Best for teams moving from simple analytics to routing",
    scorecard: [
      { label: "Lightweight analytics simplicity", alternative: 5, eventsgateway: 3, note: "Plausible is simpler for traffic reporting alone." },
      { label: "Multi-destination delivery", alternative: 1, eventsgateway: 5, note: "EventsGateway wins when multiple tools need the same event stream." },
      { label: "Small-site cost fit", alternative: 5, eventsgateway: 5, note: "Both can be attractive for smaller sites." }
    ]
  },
  matomo: {
    category: "Privacy Analytics",
    bestFor: "Best for teams choosing routing over owned reporting",
    scorecard: [
      { label: "Owned analytics reporting", alternative: 5, eventsgateway: 2, note: "Matomo is stronger as a reporting destination." },
      { label: "Destination routing control", alternative: 2, eventsgateway: 5, note: "EventsGateway wins when the same data must feed many tools." },
      { label: "Cloudflare-native simplicity", alternative: 2, eventsgateway: 5, note: "EventsGateway is easier to position on Cloudflare." }
    ]
  },
  "ga4-gtm": {
    category: "Analytics",
    bestFor: "Best for teams outgrowing the default Google stack",
    scorecard: [
      { label: "Familiarity", alternative: 5, eventsgateway: 3, note: "GA4 plus GTM wins on default-market familiarity." },
      { label: "Vendor neutrality", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger above vendor-specific logic." },
      { label: "Routing-first architecture", alternative: 2, eventsgateway: 5, note: "EventsGateway is better once the stack needs real routing." }
    ]
  },
  mixpanel: {
    category: "Analytics",
    bestFor: "Best for teams preferring routing over product analytics depth",
    scorecard: [
      { label: "Behavior analysis depth", alternative: 5, eventsgateway: 2, note: "Mixpanel wins on funnels and retention." },
      { label: "Ad platform delivery", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger for routing to ad destinations." },
      { label: "Canonical event control", alternative: 3, eventsgateway: 5, note: "EventsGateway centers the browser-side event contract." }
    ]
  },
  amplitude: {
    category: "Analytics",
    bestFor: "Best for teams replacing analytics-heavy tooling",
    scorecard: [
      { label: "Analytics sophistication", alternative: 5, eventsgateway: 2, note: "Amplitude wins for behavioral analytics depth." },
      { label: "Routing simplicity", alternative: 2, eventsgateway: 5, note: "EventsGateway is easier when routing is the real need." },
      { label: "Cloudflare-native fit", alternative: 1, eventsgateway: 5, note: "EventsGateway fits Cloudflare-first stacks better." }
    ]
  },
  heap: {
    category: "Analytics",
    bestFor: "Best for teams moving from auto-capture to explicit routing",
    scorecard: [
      { label: "Automatic capture", alternative: 5, eventsgateway: 1, note: "Heap is built around auto-capture." },
      { label: "Explicit event governance", alternative: 2, eventsgateway: 5, note: "EventsGateway wins when deliberate event design matters." },
      { label: "Destination control", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger for multi-destination flows." }
    ]
  },
  snowplow: {
    category: "CDP",
    bestFor: "Best for teams wanting less analytics-engineering overhead",
    scorecard: [
      { label: "Data engineering depth", alternative: 5, eventsgateway: 2, note: "Snowplow is stronger for modeled data pipelines." },
      { label: "Install simplicity", alternative: 2, eventsgateway: 5, note: "EventsGateway is easier to deploy and explain." },
      { label: "Cloudflare-native fit", alternative: 1, eventsgateway: 5, note: "EventsGateway fits Cloudflare-first teams much better." }
    ]
  },
  "adobe-analytics": {
    category: "Analytics",
    bestFor: "Best for teams choosing agility over enterprise suite weight",
    scorecard: [
      { label: "Enterprise suite depth", alternative: 5, eventsgateway: 2, note: "Adobe wins for enterprise analytics depth." },
      { label: "Open-source flexibility", alternative: 1, eventsgateway: 5, note: "EventsGateway is better for teams wanting open-source control." },
      { label: "Deployability", alternative: 2, eventsgateway: 5, note: "EventsGateway is lighter and easier to move fast with." }
    ]
  },
  "simple-analytics": {
    category: "Privacy Analytics",
    bestFor: "Best for teams graduating from simple privacy analytics",
    scorecard: [
      { label: "Minimal reporting simplicity", alternative: 5, eventsgateway: 3, note: "Simple Analytics is cleaner for basic reporting." },
      { label: "Routing and transformations", alternative: 1, eventsgateway: 5, note: "EventsGateway wins when the data must go elsewhere too." },
      { label: "Neutral event layer", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger as a central collection layer." }
    ]
  },
  fathom: {
    category: "Privacy Analytics",
    bestFor: "Best for teams moving beyond privacy-only reporting",
    scorecard: [
      { label: "Simple analytics UX", alternative: 5, eventsgateway: 3, note: "Fathom wins on clean reporting simplicity." },
      { label: "Multi-destination orchestration", alternative: 1, eventsgateway: 5, note: "EventsGateway is built for orchestration." },
      { label: "Canonical event governance", alternative: 2, eventsgateway: 5, note: "EventsGateway is stronger as the event control layer." }
    ]
  },
  "piwik-pro": {
    category: "Privacy Analytics",
    bestFor: "Best for teams wanting lighter privacy-first routing",
    scorecard: [
      { label: "Privacy governance depth", alternative: 5, eventsgateway: 4, note: "Piwik PRO is stronger as a governance suite." },
      { label: "Cloudflare-native deployability", alternative: 1, eventsgateway: 5, note: "EventsGateway is easier for Cloudflare-native setups." },
      { label: "Routing-first product story", alternative: 2, eventsgateway: 5, note: "EventsGateway is much clearer as a routing layer." }
    ]
  },
  "meta-pixel-direct": {
    category: "Ad Pixel",
    bestFor: "Best for teams replacing vendor-direct Meta tagging",
    scorecard: [
      { label: "Meta-only setup speed", alternative: 5, eventsgateway: 3, note: "Direct Meta tagging is faster for the smallest setup." },
      { label: "Multi-destination control", alternative: 1, eventsgateway: 5, note: "EventsGateway wins the moment more than one tool matters." },
      { label: "Vendor neutrality", alternative: 1, eventsgateway: 5, note: "EventsGateway gives the site a neutral event layer." }
    ]
  },
  "tiktok-pixel-direct": {
    category: "Ad Pixel",
    bestFor: "Best for teams replacing vendor-direct TikTok tagging",
    scorecard: [
      { label: "TikTok-only setup speed", alternative: 5, eventsgateway: 3, note: "Direct TikTok tagging is faster for the smallest TikTok-only use case." },
      { label: "Cross-platform delivery", alternative: 1, eventsgateway: 5, note: "EventsGateway wins when the same event feeds many tools." },
      { label: "Vendor-neutral event model", alternative: 1, eventsgateway: 5, note: "EventsGateway removes vendor-specific browser logic." }
    ]
  }
} as const;

export type CompareMetaSlug = keyof typeof compareMeta;
