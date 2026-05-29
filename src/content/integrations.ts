export const integrationsContent = {
  eyebrow: "Integrations",
  title: "Connect cleaner conversion data to every platform that drives growth.",
  intro:
    "EventsGateway helps marketers send one cleaner event stream into the platforms that matter most for optimization, attribution, audience building, and reporting.",
  items: [
    {
      slug: "meta-ads",
      label: "Meta Ads",
      title: "Meta Ads integration",
      summary: "Improve Meta Event Match Quality (EMQ) with cleaner purchase, lead, and identity data.",
      hero:
        "Send cleaner conversion data to Meta so campaigns optimize on stronger matching inputs, better audience quality, and more reliable mobile signal.",
      points: [
        "Improve Event Match Quality (EMQ) with cleaner purchase and lead events",
        "Keep browser and server-side conversion logic easier to trust",
        "Reduce wasted spend caused by fragmented or incomplete Meta tracking"
      ],
      useCases: [
        "Purchase tracking for ecommerce campaigns",
        "Lead tracking for forms, calls, and funnel milestones",
        "Audience building from cleaner conversion and identity signals"
      ]
    },
    {
      slug: "google-ads",
      label: "Google Ads",
      title: "Google Ads integration",
      summary: "Send cleaner conversion actions into Google Ads without rebuilding tracking for every funnel.",
      hero:
        "Use one cleaner event layer for Google Ads so conversion actions, remarketing inputs, and campaign optimization data stay consistent across funnels.",
      points: [
        "Map clean purchase and lead events into conversion actions",
        "Keep tracking easier to reuse across multiple sites and landing pages",
        "Reduce reporting gaps caused by duplicated scripts and disconnected tools"
      ],
      useCases: [
        "Lead generation funnels with multiple conversion steps",
        "Ecommerce purchase and checkout milestones",
        "Audience and remarketing signals from the same event stream"
      ]
    },
    {
      slug: "ga4",
      label: "GA4",
      title: "GA4 integration",
      summary: "Keep analytics data aligned with the same clean events used by your ad platforms.",
      hero:
        "Route the same clean events into GA4 so marketing teams can compare analytics, ad performance, and conversion outcomes without maintaining separate event logic.",
      points: [
        "Reuse the same clean event names across ads and analytics",
        "Keep GA4 reporting closer to what paid campaigns actually optimize on",
        "Reduce analytics drift caused by separate tracking implementations"
      ],
      useCases: [
        "Shared purchase and lead events across ads and analytics",
        "Campaign reporting with cleaner funnel consistency",
        "Fewer mismatches between ad tools and analytics tools"
      ]
    },
    {
      slug: "tiktok-ads",
      label: "TikTok Ads",
      title: "TikTok Ads integration",
      summary: "Send cleaner events to TikTok Ads without relying on a separate tracking setup just for one channel.",
      hero:
        "Use the same clean event stream for TikTok Ads so your team can improve signal consistency, conversion quality, and campaign learning without multiplying browser-side tracking.",
      points: [
        "Keep TikTok conversion data aligned with Meta and Google Ads",
        "Improve signal consistency across mobile-heavy acquisition funnels",
        "Avoid channel-by-channel tracking drift as campaigns scale"
      ],
      useCases: [
        "Lead generation campaigns on mobile-heavy traffic",
        "Purchase events reused across multiple paid channels",
        "One event layer for broader paid-media consistency"
      ]
    },
    {
      slug: "webhooks",
      label: "Webhooks",
      title: "Webhook integration",
      summary: "Send the same clean events to internal tools, CRMs, and partner systems.",
      hero:
        "Use webhook destinations when your business needs the same purchase, lead, and lifecycle events to reach internal systems alongside ad and analytics platforms.",
      points: [
        "Keep internal systems aligned with the same clean marketing events",
        "Avoid rebuilding event payloads in multiple separate tools",
        "Make downstream automation easier to trust"
      ],
      useCases: [
        "CRM lead intake and lifecycle updates",
        "Partner systems that need purchase and lead events",
        "Internal automation built on the same event stream as paid media"
      ]
    },
    {
      slug: "custom-pipelines",
      label: "Custom Pipelines",
      title: "Custom pipeline integration",
      summary: "Extend the same clean event stream into the rest of your data and growth stack.",
      hero:
        "Use custom pipelines when your team needs one clean conversion stream to feed reporting, internal tools, experiments, or partner workflows beyond standard ad platforms.",
      points: [
        "Keep one clean source of truth for purchases, leads, and key actions",
        "Reduce manual event duplication across growth and reporting tools",
        "Extend the same event logic as your stack evolves"
      ],
      useCases: [
        "Internal reporting pipelines",
        "Growth experiments and custom attribution workflows",
        "Business systems that need the same event truth as campaign tools"
      ]
    }
  ]
} as const;

export type IntegrationSlug = (typeof integrationsContent.items)[number]["slug"];
