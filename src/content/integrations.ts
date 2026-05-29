type IntegrationGroup = "Official Managed Components" | "Community Managed Components";

type IntegrationItem = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  hero: string;
  group: IntegrationGroup;
  repository: string;
  points: [string, string, string];
  useCases: [string, string, string];
};

const items = [
  {
    slug: "bing",
    label: "Bing",
    title: "Bing integration",
    summary: "Send cleaner conversion signals into Microsoft Ads and keep paid search optimization aligned with one event layer.",
    hero:
      "Use EVENTS Gateway to route the same clean purchase, lead, and lifecycle events into Bing so Microsoft Ads gets stronger conversion inputs without another tracking stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/bing",
    points: [
      "Keep Microsoft Ads conversion data aligned with the rest of your paid media stack",
      "Reduce duplicated setup between Bing, Google Ads, and analytics tooling",
      "Make search campaign optimization depend on cleaner event inputs"
    ],
    useCases: [
      "Lead generation campaigns running on Microsoft Ads",
      "Purchase tracking for ecommerce search traffic",
      "Shared conversion logic across multiple paid search channels"
    ]
  },
  {
    slug: "branch",
    label: "Branch",
    title: "Branch integration",
    summary: "Pass cleaner identity and conversion events into Branch for mobile attribution and deep-link journeys.",
    hero:
      "Route one trusted event stream into Branch so mobile attribution, deferred deep linking, and downstream conversion reporting stay easier to trust.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/branch",
    points: [
      "Keep mobile attribution inputs closer to the same source of truth as web tracking",
      "Improve consistency between Branch events and ad platform conversions",
      "Reduce event drift across mobile funnels and install journeys"
    ],
    useCases: [
      "App install and re-engagement campaigns",
      "Mobile deep-link experiences tied to paid traffic",
      "Cross-platform attribution across web and app flows"
    ]
  },
  {
    slug: "facebook-pixel",
    label: "Facebook Pixel",
    title: "Facebook Pixel integration",
    summary: "Improve Meta matching and optimization with cleaner browser and server-side conversion signals.",
    hero:
      "Use the Facebook Pixel managed component to send stronger purchase, lead, and identity data into Meta without rebuilding separate event logic for every funnel.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/facebook-pixel",
    points: [
      "Improve Event Match Quality with cleaner purchase and lead events",
      "Keep Meta browser and server-side tracking easier to reconcile",
      "Reduce wasted spend caused by fragmented Meta implementations"
    ],
    useCases: [
      "Purchase tracking for ecommerce campaigns",
      "Lead tracking for forms and key funnel milestones",
      "Audience building from cleaner identity and conversion signals"
    ]
  },
  {
    slug: "floodlight",
    label: "Floodlight",
    title: "Floodlight integration",
    summary: "Send cleaner events into Floodlight for Google Marketing Platform measurement and attribution workflows.",
    hero:
      "Use one cleaner event stream for Floodlight so campaign measurement, attribution, and reporting in the wider Google Marketing Platform stay more reliable.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/floodlight",
    points: [
      "Align Floodlight conversion inputs with the rest of your measurement stack",
      "Reduce implementation drift across ad serving and reporting workflows",
      "Keep conversion tags closer to one reusable event model"
    ],
    useCases: [
      "Campaign reporting inside Google Marketing Platform",
      "Attribution workflows that depend on Floodlight activities",
      "Large paid media programs with centralized measurement needs"
    ]
  },
  {
    slug: "google-ads",
    label: "Google Ads",
    title: "Google Ads integration",
    summary: "Send cleaner conversion actions into Google Ads without rebuilding tracking for every funnel.",
    hero:
      "Use one cleaner event layer for Google Ads so conversion actions, remarketing inputs, and campaign optimization data stay consistent across funnels.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/google-ads",
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
    slug: "google-analytics",
    label: "Google Analytics",
    title: "Google Analytics integration",
    summary: "Route clean events into Google Analytics for teams that still rely on classic analytics workflows and reporting.",
    hero:
      "Use EVENTS Gateway to keep Google Analytics inputs closer to the same clean purchase, lead, and engagement events used everywhere else in your stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/google-analytics",
    points: [
      "Reuse one event model across analytics and media workflows",
      "Reduce manual differences between analytics tagging and ad tracking",
      "Keep reporting easier to compare across older analytics setups"
    ],
    useCases: [
      "Legacy analytics environments still in production",
      "Historical reporting continuity during migration projects",
      "Teams that need one shared measurement layer across tools"
    ]
  },
  {
    slug: "google-analytics-4",
    label: "Google Analytics 4",
    title: "Google Analytics 4 integration",
    summary: "Keep analytics data aligned with the same clean events used by your ad platforms.",
    hero:
      "Route the same clean events into Google Analytics 4 so marketing teams can compare analytics, ad performance, and conversion outcomes without maintaining separate event logic.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/google-analytics-4",
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
    slug: "google-maps-rwg",
    label: "Google Maps RWG",
    title: "Google Maps RWG integration",
    summary: "Support Reserve with Google and local conversion journeys with cleaner booking and lead events.",
    hero:
      "Use Google Maps RWG when location-based businesses need trusted booking, reservation, and lead events to reach Google surfaces through one cleaner event layer.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/google-maps-RWG",
    points: [
      "Keep booking signals aligned with other paid and analytics destinations",
      "Reduce manual tracking differences across local discovery journeys",
      "Make reservation and lead events easier to reuse across channels"
    ],
    useCases: [
      "Local businesses driving bookings from Google surfaces",
      "Reservation flows tied to marketing campaigns",
      "Service businesses measuring calls, leads, and appointments"
    ]
  },
  {
    slug: "hubspot",
    label: "HubSpot",
    title: "HubSpot integration",
    summary: "Send cleaner lead and lifecycle events into HubSpot so sales and marketing work from the same signal.",
    hero:
      "Route one trusted event stream into HubSpot so lead capture, lifecycle updates, and revenue workflows stay aligned with the same marketing truth used across channels.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/hubspot",
    points: [
      "Keep CRM and campaign data closer to the same conversion source",
      "Reduce duplicated lead handling logic between forms and marketing tools",
      "Improve trust in lifecycle events shared across teams"
    ],
    useCases: [
      "Lead intake from forms, calls, and qualification steps",
      "Lifecycle updates tied to purchases and pipeline movement",
      "Marketing and sales teams sharing one cleaner conversion stream"
    ]
  },
  {
    slug: "ihire",
    label: "iHire",
    title: "iHire integration",
    summary: "Track recruitment marketing conversions into iHire with cleaner applicant and lead events.",
    hero:
      "Use iHire when hiring campaigns need dependable application and candidate conversion events without a separate recruitment tracking setup.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/iHire",
    points: [
      "Keep recruitment conversion tracking aligned with other acquisition channels",
      "Reduce noise between ad clicks, applications, and candidate journeys",
      "Make hiring funnel events easier to reuse across reporting tools"
    ],
    useCases: [
      "Application completion tracking for job campaigns",
      "Candidate lead capture from recruitment landing pages",
      "Hiring funnels measured alongside broader paid media activity"
    ]
  },
  {
    slug: "impact-radius",
    label: "Impact Radius",
    title: "Impact Radius integration",
    summary: "Send cleaner partner and affiliate conversion data into Impact Radius from the same event stream.",
    hero:
      "Route clean purchase and lead signals into Impact Radius so affiliate, partner, and performance marketing workflows stay tied to one reliable conversion source.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/impact-radius",
    points: [
      "Keep affiliate conversions aligned with core ad and analytics data",
      "Reduce discrepancies between partner reporting and internal measurement",
      "Reuse the same event model across direct and partner channels"
    ],
    useCases: [
      "Affiliate revenue tracking for ecommerce brands",
      "Partner lead attribution programs",
      "Performance marketing programs that need cleaner payout signals"
    ]
  },
  {
    slug: "indeed",
    label: "Indeed",
    title: "Indeed integration",
    summary: "Push cleaner hiring and application events into Indeed for recruitment campaign measurement.",
    hero:
      "Use EVENTS Gateway with Indeed so job application milestones and candidate conversion events stay consistent across recruitment landing pages and hiring campaigns.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/indeed",
    points: [
      "Align recruitment conversion tracking with the rest of your acquisition stack",
      "Reduce manual tracking gaps in candidate journeys",
      "Keep application events easier to compare across hiring channels"
    ],
    useCases: [
      "Indeed-sponsored job campaigns",
      "Application and candidate lead tracking",
      "Reporting across multiple recruitment media sources"
    ]
  },
  {
    slug: "linkedin-insights",
    label: "LinkedIn Insights",
    title: "LinkedIn Insights integration",
    summary: "Send cleaner lead and audience signals into LinkedIn campaigns without duplicating tracking logic.",
    hero:
      "Route one clean event stream into LinkedIn Insights so B2B teams can optimize on stronger lead signals and keep campaign attribution easier to trust.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/linkedin",
    points: [
      "Keep LinkedIn conversion data aligned with Meta, Google Ads, and analytics",
      "Improve B2B lead tracking quality across longer funnels",
      "Reduce separate tagging work for each campaign destination"
    ],
    useCases: [
      "B2B lead generation campaigns on LinkedIn",
      "Audience building from cleaner lifecycle signals",
      "Attribution across demo, contact, and pipeline milestones"
    ]
  },
  {
    slug: "mixpanel",
    label: "Mixpanel",
    title: "Mixpanel integration",
    summary: "Pass trusted product and growth events into Mixpanel from the same stream used for marketing decisions.",
    hero:
      "Use Mixpanel with EVENTS Gateway when product analytics should stay aligned with the same purchase, signup, and lifecycle events that power your acquisition stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/mixpanel",
    points: [
      "Keep product analytics closer to the same event truth as paid media",
      "Reduce event naming drift between product and marketing teams",
      "Make behavioral analysis easier to compare with acquisition outcomes"
    ],
    useCases: [
      "Signup and onboarding funnels",
      "Feature usage tied to acquisition quality",
      "Lifecycle analysis that combines product and marketing data"
    ]
  },
  {
    slug: "outbrain",
    label: "Outbrain",
    title: "Outbrain integration",
    summary: "Route cleaner conversion signals into Outbrain for content discovery campaigns and native media optimization.",
    hero:
      "Use EVENTS Gateway to send purchase and lead events into Outbrain so native campaign optimization depends on cleaner signals instead of fragmented page-level tagging.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/outbrain",
    points: [
      "Keep Outbrain conversion data aligned with the rest of your paid media stack",
      "Reduce native advertising tracking drift across landing pages",
      "Make top-of-funnel to conversion reporting easier to trust"
    ],
    useCases: [
      "Content discovery campaigns tied to leads or purchases",
      "Native advertising funnels with long consideration cycles",
      "Multi-channel reporting across awareness and conversion media"
    ]
  },
  {
    slug: "pinterest",
    label: "Pinterest",
    title: "Pinterest integration",
    summary: "Send cleaner conversion data into Pinterest campaigns for stronger audience and catalog optimization.",
    hero:
      "Use Pinterest with one clean event layer so inspiration-driven purchase journeys, remarketing, and audience building stay aligned with your wider paid media setup.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/pinterest",
    points: [
      "Keep Pinterest conversions consistent with Meta and Google Ads",
      "Improve purchase and audience signal quality for visual discovery campaigns",
      "Reduce duplicated tracking code across creative landing pages"
    ],
    useCases: [
      "Ecommerce purchase tracking for Pinterest campaigns",
      "Audience building from catalog and content engagement",
      "Remarketing flows that reuse the same event layer as other channels"
    ]
  },
  {
    slug: "podsights",
    label: "Podsights",
    title: "Podsights integration",
    summary: "Connect cleaner conversion events to podcast attribution and media measurement workflows.",
    hero:
      "Use Podsights when podcast advertising needs cleaner downstream conversion signals tied back to the same purchase and lead data used in the rest of your stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/podsights",
    points: [
      "Align podcast attribution with the same source of truth as other channels",
      "Reduce disconnected reporting between awareness media and conversion outcomes",
      "Keep offline and delayed conversion signals easier to interpret"
    ],
    useCases: [
      "Podcast campaign attribution and lift analysis",
      "Lead or purchase tracking after audio ad exposure",
      "Cross-channel reporting that includes podcast media"
    ]
  },
  {
    slug: "quora",
    label: "Quora",
    title: "Quora integration",
    summary: "Push cleaner lead and conversion events into Quora campaigns without maintaining a separate tagging stack.",
    hero:
      "Use one trusted event layer for Quora so your team can optimize lead generation and content-driven campaigns on cleaner conversion signals.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/quora",
    points: [
      "Keep Quora conversion tracking aligned with other demand generation channels",
      "Reduce fragmented setup between content traffic and downstream conversions",
      "Improve trust in campaign reporting across educational funnels"
    ],
    useCases: [
      "Lead generation from high-intent Quora traffic",
      "Top-of-funnel content campaigns tied to downstream actions",
      "B2B and education funnels that rely on longer consideration journeys"
    ]
  },
  {
    slug: "reddit",
    label: "Reddit",
    title: "Reddit integration",
    summary: "Send cleaner conversion events into Reddit Ads for community-led acquisition and remarketing workflows.",
    hero:
      "Use EVENTS Gateway with Reddit so purchase, signup, and lead events stay consistent between community-driven campaigns and the rest of your paid media stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/reddit",
    points: [
      "Align Reddit campaign conversions with other ad platforms",
      "Reduce event drift across community, content, and landing page experiences",
      "Make experimentation easier with one reusable event layer"
    ],
    useCases: [
      "Reddit Ads for product launches and niche communities",
      "Signup and lead tracking from discussion-driven traffic",
      "Remarketing programs tied to engagement and conversion events"
    ]
  },
  {
    slug: "segment",
    label: "Segment",
    title: "Segment integration",
    summary: "Send one cleaner event stream into Segment and extend it into the rest of your data stack.",
    hero:
      "Use Segment when your team wants the same clean purchase, lead, and lifecycle events to feed warehouses, SaaS tools, and downstream automation from one controlled source.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/segment",
    points: [
      "Keep CDP inputs aligned with paid media and analytics tracking",
      "Reduce duplicate event collection logic across tools and teams",
      "Make downstream routing easier to scale from one event source"
    ],
    useCases: [
      "Warehouses and SaaS destinations fed through Segment",
      "Lifecycle and product events shared across teams",
      "Data stack consolidation around one cleaner tracking model"
    ]
  },
  {
    slug: "snapchat",
    label: "Snapchat",
    title: "Snapchat integration",
    summary: "Send cleaner conversion data into Snapchat campaigns for mobile-first acquisition and optimization.",
    hero:
      "Use one clean event stream for Snapchat so your team can improve signal quality, conversion consistency, and mobile campaign learning without channel-by-channel tracking drift.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/snapchat",
    points: [
      "Keep Snapchat conversion data aligned with Meta, TikTok, and Google Ads",
      "Improve mobile signal quality across high-volume acquisition funnels",
      "Reduce duplicated implementation work across paid social channels"
    ],
    useCases: [
      "Mobile-first lead generation campaigns",
      "Purchase events reused across social ad platforms",
      "Broader paid social measurement with one event layer"
    ]
  },
  {
    slug: "taboola",
    label: "Taboola",
    title: "Taboola integration",
    summary: "Route clean conversion events into Taboola for native discovery campaigns and performance reporting.",
    hero:
      "Use Taboola with one trusted event stream so native acquisition and content-driven conversion campaigns stay easier to optimize and compare across channels.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/taboola",
    points: [
      "Align native campaign tracking with the same event truth as other channels",
      "Reduce landing page tagging differences across content programs",
      "Keep reporting cleaner from discovery click to downstream conversion"
    ],
    useCases: [
      "Native discovery campaigns with purchase goals",
      "Lead generation funnels supported by advertorial content",
      "Cross-channel reporting across paid social, search, and native media"
    ]
  },
  {
    slug: "tatari",
    label: "Tatari",
    title: "Tatari integration",
    summary: "Pass cleaner conversion data into Tatari for TV and cross-channel performance measurement.",
    hero:
      "Use Tatari when your team needs purchase and lead events from digital journeys to support TV attribution and blended media decision-making from one cleaner source.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/tatari",
    points: [
      "Align TV attribution workflows with digital conversion truth",
      "Reduce disconnected reporting between offline and online channels",
      "Make blended media optimization depend on cleaner downstream signals"
    ],
    useCases: [
      "TV and streaming campaign attribution",
      "Cross-channel reporting across broadcast and digital",
      "Brand programs that tie media exposure to downstream leads or purchases"
    ]
  },
  {
    slug: "tiktok",
    label: "TikTok",
    title: "TikTok integration",
    summary: "Send cleaner events to TikTok without relying on a separate tracking setup just for one channel.",
    hero:
      "Use the same clean event stream for TikTok so your team can improve signal consistency, conversion quality, and campaign learning without multiplying browser-side tracking.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/tiktok",
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
    slug: "twitter",
    label: "Twitter",
    title: "Twitter integration",
    summary: "Send cleaner conversion and audience events into Twitter campaigns from the same trusted event stream.",
    hero:
      "Use EVENTS Gateway with Twitter so performance campaigns, audience workflows, and downstream reporting stay aligned with one cleaner measurement layer.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/twitter",
    points: [
      "Keep Twitter conversion signals consistent with other paid social channels",
      "Reduce implementation drift across content and direct response campaigns",
      "Make audience and conversion tracking easier to reuse"
    ],
    useCases: [
      "Performance campaigns on Twitter",
      "Lead and signup tracking from content-driven traffic",
      "Audience workflows that share the same event truth as other platforms"
    ]
  },
  {
    slug: "upward",
    label: "Upward",
    title: "Upward integration",
    summary: "Track cleaner lead and conversion events into Upward without another isolated setup.",
    hero:
      "Use Upward with one reusable event model so your team can keep conversion data, optimization inputs, and reporting aligned across the broader paid media stack.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/upward",
    points: [
      "Keep Upward conversion data tied to the same source of truth as other destinations",
      "Reduce duplicated event setup across campaign workflows",
      "Improve trust in lead and conversion reporting"
    ],
    useCases: [
      "Lead generation programs using Upward",
      "Conversion reporting for niche acquisition channels",
      "Shared event logic across multiple destination types"
    ]
  },
  {
    slug: "ziprecruiter",
    label: "ZipRecruiter",
    title: "ZipRecruiter integration",
    summary: "Push cleaner hiring and applicant conversion events into ZipRecruiter for recruitment marketing measurement.",
    hero:
      "Use ZipRecruiter when hiring campaigns need dependable application and candidate conversion events from the same clean event layer used in the rest of your platform.",
    group: "Official Managed Components",
    repository: "https://github.com/managed-components/ziprecruiter",
    points: [
      "Keep recruitment funnel tracking aligned with broader acquisition reporting",
      "Reduce gaps between application starts, completions, and downstream outcomes",
      "Reuse candidate event logic across hiring media channels"
    ],
    useCases: [
      "ZipRecruiter campaign application tracking",
      "Candidate lead capture and recruitment analytics",
      "Hiring funnels measured alongside other acquisition channels"
    ]
  },
  {
    slug: "posthog",
    label: "PostHog",
    title: "PostHog integration",
    summary: "Send clean product, marketing, and lifecycle events into PostHog from the same controlled event stream.",
    hero:
      "Use the community PostHog managed component when product analytics, funnel analysis, and growth experiments should share the same event truth as your acquisition stack.",
    group: "Community Managed Components",
    repository: "https://github.com/mountainash/posthog-managed-component",
    points: [
      "Keep product analytics aligned with marketing and revenue events",
      "Reduce event naming drift between experimentation and acquisition workflows",
      "Make funnel analysis easier to compare with campaign outcomes"
    ],
    useCases: [
      "Signup and activation funnel analysis",
      "Growth experiments tied to downstream revenue signals",
      "Product analytics built from the same event source as paid media"
    ]
  },
  {
    slug: "counterscale",
    label: "Counterscale",
    title: "Counterscale integration",
    summary: "Route lightweight analytics events into Counterscale from the same clean tracking layer used elsewhere.",
    hero:
      "Use Counterscale when you want privacy-aware analytics to share the same clean event naming and routing discipline as the rest of your measurement stack.",
    group: "Community Managed Components",
    repository: "https://github.com/mackenly/counterscale-managed-component",
    points: [
      "Keep lightweight analytics aligned with broader event routing decisions",
      "Reduce separate instrumentation for simple traffic reporting",
      "Reuse one event model across privacy-focused and marketing analytics"
    ],
    useCases: [
      "Simple website analytics from the same event stream",
      "Privacy-aware reporting alongside paid media tracking",
      "Teams that want lightweight analytics without fragmented setup"
    ]
  }
] as const satisfies readonly IntegrationItem[];

export const integrationsContent = {
  eyebrow: "Integrations",
  title: "Connect the full integration catalog inside EVENTS Gateway.",
  intro:
    "EVENTS Gateway lists the full integration catalog so teams can evaluate, configure, and connect a broader destination surface from one place.",
  items
} as const;

export type IntegrationSlug = (typeof integrationsContent.items)[number]["slug"];
