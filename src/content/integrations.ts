type IntegrationItem = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  hero: string;
  repository: string;
  points: [string, string, string];
  useCases: [string, string, string];
};

const items = [
  {
    slug: "bing",
    label: "Bing",
    title: "Bing integration",
    summary: "Keep Microsoft Ads conversion tracking aligned with the same purchase and lead events used across the rest of your stack.",
    hero:
      "Use EVENTS Gateway with Bing when you want Microsoft Ads to optimize on cleaner conversion inputs without rebuilding search tracking for every funnel or landing page.",
    repository: "https://github.com/managed-components/bing",
    points: [
      "Send the same lead and purchase truth to Bing, Google Ads, and analytics tools",
      "Reduce duplicated tracking logic across search campaigns and landing pages",
      "Give paid search optimization cleaner inputs for smarter bidding"
    ],
    useCases: [
      "Lead generation programs running on Microsoft Ads",
      "Ecommerce conversion tracking for paid search traffic",
      "Multi-search-channel setups that need one shared event model"
    ]
  },
  {
    slug: "branch",
    label: "Branch",
    title: "Branch integration",
    summary: "Keep mobile attribution, deep links, and downstream conversions tied to one cleaner event stream.",
    hero:
      "Use Branch with EVENTS Gateway when your team needs app install, re-engagement, and mobile conversion data to stay consistent with the same events used across web and paid media.",
    repository: "https://github.com/managed-components/branch",
    points: [
      "Keep Branch attribution closer to the same source of truth as web tracking",
      "Reduce drift between deep-link journeys and paid campaign reporting",
      "Make mobile conversion data easier to trust across install and re-engagement flows"
    ],
    useCases: [
      "App install and re-engagement campaigns",
      "Mobile deep-link journeys tied to paid traffic",
      "Brands that need cleaner web-to-app attribution"
    ]
  },
  {
    slug: "facebook-pixel",
    label: "Facebook Pixel",
    title: "Facebook Pixel integration",
    summary: "Improve Meta EMQ, send stronger purchase and lead signals, and help the algorithm optimize with better data.",
    hero:
      "Use the Facebook Pixel integration when Meta performance depends on better matching, cleaner browser and server-side tracking, and less wasted ad spend from fragmented implementations.",
    repository: "https://github.com/managed-components/facebook-pixel",
    points: [
      "Improve Event Match Quality with cleaner identity, purchase, and lead events",
      "Keep Meta browser and server-side signals easier to reconcile",
      "Reduce wasted ad spend caused by duplicate tags and broken event logic"
    ],
    useCases: [
      "Ecommerce purchase tracking for Meta campaigns",
      "Lead forms and qualified funnel events for performance marketing",
      "Audience building from stronger identity and conversion signals"
    ]
  },
  {
    slug: "floodlight",
    label: "Floodlight",
    title: "Floodlight integration",
    summary: "Keep Floodlight conversion data cleaner and easier to compare with the rest of your measurement stack.",
    hero:
      "Use Floodlight with EVENTS Gateway when your team needs Google Marketing Platform reporting and attribution to rely on the same event truth used across ads, analytics, and internal reporting.",
    repository: "https://github.com/managed-components/floodlight",
    points: [
      "Align Floodlight activities with the same purchase and lead events used elsewhere",
      "Reduce implementation drift across ad serving, attribution, and reporting workflows",
      "Make enterprise media measurement easier to compare across systems"
    ],
    useCases: [
      "Google Marketing Platform reporting programs",
      "Floodlight-based attribution and activity tracking",
      "Large paid media teams with centralized measurement needs"
    ]
  },
  {
    slug: "google-ads",
    label: "Google Ads",
    title: "Google Ads integration",
    summary: "Reduce mismatched conversion totals and send Google Ads cleaner actions for bidding, reporting, and remarketing.",
    hero:
      "Use Google Ads with EVENTS Gateway when you want cleaner conversion actions, fewer gaps between GA4 and Google Ads, and one reusable event model across every funnel.",
    repository: "https://github.com/managed-components/google-ads",
    points: [
      "Map clean purchase and lead events into conversion actions once",
      "Keep Google Ads closer to the same conversion truth as GA4 and other channels",
      "Reduce reporting gaps caused by duplicated scripts and disconnected tooling"
    ],
    useCases: [
      "Lead generation funnels with multiple conversion steps",
      "Ecommerce purchase and checkout tracking",
      "Remarketing and audience signals from one shared event stream"
    ]
  },
  {
    slug: "google-analytics",
    label: "Google Analytics",
    title: "Google Analytics integration",
    summary: "Keep classic analytics reporting closer to the same clean events used by your marketing stack.",
    hero:
      "Use Google Analytics with EVENTS Gateway when older reporting workflows still matter and you want analytics inputs to stay aligned with the same purchase, lead, and engagement events used elsewhere.",
    repository: "https://github.com/managed-components/google-analytics",
    points: [
      "Reuse one event model across analytics and paid media workflows",
      "Reduce manual differences between analytics tagging and ad tracking",
      "Keep reporting easier to compare during migrations or legacy support"
    ],
    useCases: [
      "Legacy analytics environments that still drive reporting",
      "Migration periods that need continuity with older dashboards",
      "Teams that want one measurement layer across older and newer tools"
    ]
  },
  {
    slug: "google-analytics-4",
    label: "Google Analytics 4",
    title: "Google Analytics 4 integration",
    summary: "Keep GA4 reporting closer to the same events your ad platforms actually optimize on.",
    hero:
      "Use Google Analytics 4 with EVENTS Gateway when your team wants analytics, attribution, and ad performance discussions to start from the same clean purchase and lead events.",
    repository: "https://github.com/managed-components/google-analytics-4",
    points: [
      "Reuse the same clean event names across ads and analytics",
      "Reduce mismatches between GA4 totals and ad platform conversions",
      "Make funnel reporting easier to trust across marketing channels"
    ],
    useCases: [
      "Shared purchase and lead events across GA4 and ad tools",
      "Campaign reporting with cleaner funnel consistency",
      "Teams that need less manual reconciliation between analytics and media"
    ]
  },
  {
    slug: "google-maps-rwg",
    label: "Google Maps RWG",
    title: "Google Maps RWG integration",
    summary: "Send cleaner booking and reservation signals into Reserve with Google and local conversion flows.",
    hero:
      "Use Google Maps RWG when local businesses need calls, bookings, reservations, and lead events to stay consistent across Google surfaces and the rest of the marketing stack.",
    repository: "https://github.com/managed-components/google-maps-RWG",
    points: [
      "Keep booking and reservation data aligned with other marketing destinations",
      "Reduce manual differences across local discovery and appointment journeys",
      "Reuse one cleaner event model for calls, leads, and bookings"
    ],
    useCases: [
      "Local businesses driving bookings from Google surfaces",
      "Reservation flows connected to campaign traffic",
      "Service businesses measuring calls, leads, and appointments"
    ]
  },
  {
    slug: "hubspot",
    label: "HubSpot",
    title: "HubSpot integration",
    summary: "Keep CRM, lead capture, and lifecycle automation aligned with the same conversion truth used in marketing.",
    hero:
      "Use HubSpot with EVENTS Gateway when sales and marketing need one trusted stream for leads, lifecycle changes, and revenue events instead of disconnected form and CRM logic.",
    repository: "https://github.com/managed-components/hubspot",
    points: [
      "Keep CRM updates closer to the same source as ad and site conversions",
      "Reduce duplicated lead handling across forms, campaigns, and automation",
      "Make lifecycle events easier to trust across marketing and sales teams"
    ],
    useCases: [
      "Lead intake from forms, calls, and qualification steps",
      "Lifecycle updates tied to purchases and pipeline movement",
      "Teams that want cleaner handoff from campaign to CRM"
    ]
  },
  {
    slug: "ihire",
    label: "iHire",
    title: "iHire integration",
    summary: "Track cleaner application and candidate conversions for recruitment marketing programs on iHire.",
    hero:
      "Use iHire with EVENTS Gateway when hiring campaigns need dependable application events, candidate milestones, and clearer reporting across recruitment landing pages and media channels.",
    repository: "https://github.com/managed-components/iHire",
    points: [
      "Keep recruitment conversions aligned with the rest of your acquisition reporting",
      "Reduce noise between ad clicks, applications, and candidate journeys",
      "Reuse one cleaner event setup across hiring funnels"
    ],
    useCases: [
      "Application completion tracking for job campaigns",
      "Candidate lead capture from recruitment pages",
      "Hiring funnels measured alongside other paid traffic"
    ]
  },
  {
    slug: "impact-radius",
    label: "Impact Radius",
    title: "Impact Radius integration",
    summary: "Keep affiliate and partner conversion data closer to the same purchase and lead truth used everywhere else.",
    hero:
      "Use Impact Radius with EVENTS Gateway when partner programs, affiliate payouts, and internal reporting all need to start from one cleaner conversion source.",
    repository: "https://github.com/managed-components/impact-radius",
    points: [
      "Align partner conversions with core ad and analytics data",
      "Reduce discrepancies between affiliate reporting and internal numbers",
      "Reuse one event model across direct, partner, and marketplace channels"
    ],
    useCases: [
      "Affiliate revenue tracking for ecommerce brands",
      "Partner lead attribution programs",
      "Performance teams that need cleaner payout signals"
    ]
  },
  {
    slug: "indeed",
    label: "Indeed",
    title: "Indeed integration",
    summary: "Measure job applications and candidate conversions on Indeed with cleaner, more reusable recruitment events.",
    hero:
      "Use Indeed with EVENTS Gateway when hiring teams need application milestones and candidate events to stay consistent across career pages, recruitment campaigns, and internal reporting.",
    repository: "https://github.com/managed-components/indeed",
    points: [
      "Keep recruitment tracking aligned with the rest of your acquisition stack",
      "Reduce manual gaps across job clicks, applications, and candidate steps",
      "Make hiring performance easier to compare across channels"
    ],
    useCases: [
      "Indeed-sponsored job campaigns",
      "Application and candidate lead tracking",
      "Recruitment reporting across multiple hiring sources"
    ]
  },
  {
    slug: "linkedin-insights",
    label: "LinkedIn Insights",
    title: "LinkedIn Insights integration",
    summary: "Send cleaner lead and audience signals into LinkedIn so B2B campaigns optimize on better data.",
    hero:
      "Use LinkedIn Insights with EVENTS Gateway when long B2B funnels need stronger lead signals, cleaner attribution, and less duplicated tagging between campaign destinations.",
    repository: "https://github.com/managed-components/linkedin",
    points: [
      "Keep LinkedIn conversion data aligned with Meta, Google Ads, and analytics",
      "Improve B2B lead tracking quality across longer sales cycles",
      "Reduce separate tagging work for every campaign destination"
    ],
    useCases: [
      "B2B lead generation campaigns on LinkedIn",
      "Audience building from lifecycle and funnel signals",
      "Attribution across demo, contact, and pipeline milestones"
    ]
  },
  {
    slug: "mixpanel",
    label: "Mixpanel",
    title: "Mixpanel integration",
    summary: "Keep product analytics closer to the same event truth that drives acquisition and revenue decisions.",
    hero:
      "Use Mixpanel with EVENTS Gateway when product, growth, and marketing teams need signup, activation, purchase, and lifecycle data to stay consistent across analysis and campaign decisions.",
    repository: "https://github.com/managed-components/mixpanel",
    points: [
      "Keep product analytics aligned with paid media and revenue events",
      "Reduce event naming drift between product and marketing teams",
      "Make behavioral analysis easier to compare with acquisition outcomes"
    ],
    useCases: [
      "Signup and onboarding funnel analysis",
      "Feature usage tied to acquisition quality",
      "Lifecycle reporting that combines product and marketing data"
    ]
  },
  {
    slug: "outbrain",
    label: "Outbrain",
    title: "Outbrain integration",
    summary: "Send cleaner lead and purchase signals into Outbrain so native campaigns learn from better downstream data.",
    hero:
      "Use Outbrain with EVENTS Gateway when your team wants content discovery campaigns to optimize on cleaner conversions instead of fragmented page-level tracking.",
    repository: "https://github.com/managed-components/outbrain",
    points: [
      "Keep Outbrain conversion data aligned with the rest of your paid media stack",
      "Reduce native advertising tracking drift across landing pages",
      "Make top-of-funnel to conversion reporting easier to trust"
    ],
    useCases: [
      "Content discovery campaigns tied to leads or purchases",
      "Native advertising funnels with longer consideration cycles",
      "Multi-channel reporting across awareness and conversion media"
    ]
  },
  {
    slug: "pinterest",
    label: "Pinterest",
    title: "Pinterest integration",
    summary: "Improve Pinterest conversion quality with cleaner purchase, catalog, and audience signals.",
    hero:
      "Use Pinterest with EVENTS Gateway when inspiration-led journeys need cleaner purchase data, better audience building, and less duplicated tracking across landing pages and catalog flows.",
    repository: "https://github.com/managed-components/pinterest",
    points: [
      "Keep Pinterest conversions consistent with Meta and Google Ads",
      "Improve purchase and audience signal quality for visual discovery campaigns",
      "Reduce duplicated tracking code across creative and catalog pages"
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
    summary: "Connect podcast attribution to cleaner downstream conversions instead of disconnected media estimates.",
    hero:
      "Use Podsights with EVENTS Gateway when audio campaigns need purchase and lead signals that can be tied back to the same conversion truth used across the rest of your stack.",
    repository: "https://github.com/managed-components/podsights",
    points: [
      "Align podcast attribution with the same source of truth as other channels",
      "Reduce disconnected reporting between awareness media and conversions",
      "Make delayed and offline-friendly conversion signals easier to interpret"
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
    summary: "Send cleaner lead and conversion events into Quora so educational and high-intent traffic performs with better data.",
    hero:
      "Use Quora with EVENTS Gateway when your team wants lead generation and content-driven campaigns to optimize on cleaner signals without another isolated tagging setup.",
    repository: "https://github.com/managed-components/quora",
    points: [
      "Keep Quora conversion tracking aligned with other demand generation channels",
      "Reduce fragmented setup between content traffic and downstream conversions",
      "Improve trust in reporting across longer consideration funnels"
    ],
    useCases: [
      "Lead generation from high-intent Quora traffic",
      "Top-of-funnel content campaigns tied to downstream actions",
      "B2B and education funnels with longer consideration paths"
    ]
  },
  {
    slug: "reddit",
    label: "Reddit",
    title: "Reddit integration",
    summary: "Keep Reddit Ads conversions cleaner and easier to compare with the rest of your paid media stack.",
    hero:
      "Use Reddit with EVENTS Gateway when community-led acquisition needs purchase, signup, and lead events that stay consistent across campaigns, landing pages, and downstream reporting.",
    repository: "https://github.com/managed-components/reddit",
    points: [
      "Align Reddit campaign conversions with other ad platforms",
      "Reduce event drift across community, content, and landing page experiences",
      "Make testing and iteration easier with one reusable event layer"
    ],
    useCases: [
      "Product launches and niche community campaigns",
      "Signup and lead tracking from discussion-driven traffic",
      "Remarketing tied to engagement and downstream conversions"
    ]
  },
  {
    slug: "segment",
    label: "Segment",
    title: "Segment integration",
    summary: "Feed Segment from one cleaner event stream and extend the same truth into warehouses, tools, and automation.",
    hero:
      "Use Segment with EVENTS Gateway when your team wants one controlled source for purchase, lead, and lifecycle events before routing them deeper into the data stack.",
    repository: "https://github.com/managed-components/segment",
    points: [
      "Keep CDP inputs aligned with paid media and analytics tracking",
      "Reduce duplicate event collection logic across tools and teams",
      "Make downstream routing easier to scale from one source of truth"
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
    summary: "Send Snapchat cleaner conversion signals for mobile-first campaigns that need better learning and less drift.",
    hero:
      "Use Snapchat with EVENTS Gateway when mobile acquisition depends on stronger purchase and lead signals, cleaner attribution, and one reusable setup across paid social channels.",
    repository: "https://github.com/managed-components/snapchat",
    points: [
      "Keep Snapchat conversion data aligned with Meta, TikTok, and Google Ads",
      "Improve signal quality across mobile-heavy acquisition funnels",
      "Reduce duplicated implementation work across paid social channels"
    ],
    useCases: [
      "Mobile-first lead generation campaigns",
      "Purchase events reused across social ad platforms",
      "Broader paid social measurement from one shared event layer"
    ]
  },
  {
    slug: "taboola",
    label: "Taboola",
    title: "Taboola integration",
    summary: "Route cleaner conversion events into Taboola for native discovery campaigns that need better downstream visibility.",
    hero:
      "Use Taboola with EVENTS Gateway when native acquisition and advertorial flows need cleaner lead and purchase data instead of fragmented landing page tagging.",
    repository: "https://github.com/managed-components/taboola",
    points: [
      "Align native campaign tracking with the same event truth as other channels",
      "Reduce landing page tagging differences across content programs",
      "Keep reporting cleaner from discovery click to conversion"
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
    summary: "Bring cleaner digital conversion data into Tatari for stronger TV and cross-channel attribution decisions.",
    hero:
      "Use Tatari with EVENTS Gateway when brand, streaming, and TV campaigns need downstream purchase and lead signals that stay consistent with the rest of digital measurement.",
    repository: "https://github.com/managed-components/tatari",
    points: [
      "Align TV attribution workflows with the same digital conversion truth",
      "Reduce disconnected reporting between offline and online channels",
      "Make blended media optimization depend on cleaner downstream data"
    ],
    useCases: [
      "TV and streaming campaign attribution",
      "Cross-channel reporting across broadcast and digital",
      "Brand programs tied to downstream leads or purchases"
    ]
  },
  {
    slug: "tiktok",
    label: "TikTok",
    title: "TikTok integration",
    summary: "Send TikTok cleaner purchase and lead signals without creating a separate tracking setup just for one channel.",
    hero:
      "Use TikTok with EVENTS Gateway when campaign learning depends on stronger mobile signals, cleaner attribution, and one reusable event stream across the rest of paid media.",
    repository: "https://github.com/managed-components/tiktok",
    points: [
      "Keep TikTok conversion data aligned with Meta and Google Ads",
      "Improve signal consistency across mobile-heavy acquisition funnels",
      "Avoid channel-by-channel tracking drift as campaigns scale"
    ],
    useCases: [
      "Lead generation campaigns on mobile-heavy traffic",
      "Purchase events reused across multiple paid channels",
      "Paid social setups that need one cleaner event layer"
    ]
  },
  {
    slug: "twitter",
    label: "Twitter",
    title: "Twitter integration",
    summary: "Keep Twitter conversion and audience signals tied to the same trusted event stream as your other paid channels.",
    hero:
      "Use Twitter with EVENTS Gateway when performance campaigns and audience workflows need cleaner conversion data without extra tagging drift between content and direct response programs.",
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
    summary: "Track cleaner lead and conversion events in Upward without adding another isolated measurement workflow.",
    hero:
      "Use Upward with EVENTS Gateway when your team wants niche acquisition channels to receive the same trusted conversion events used across the broader paid media stack.",
    repository: "https://github.com/managed-components/upward",
    points: [
      "Keep Upward conversion data tied to the same source of truth as other destinations",
      "Reduce duplicated setup across campaign and reporting workflows",
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
    summary: "Measure job applications and candidate funnel steps in ZipRecruiter with cleaner recruitment events.",
    hero:
      "Use ZipRecruiter with EVENTS Gateway when hiring campaigns need dependable application events, clearer funnel measurement, and one reusable recruitment tracking model across channels.",
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
    summary: "Keep product analytics, experiments, and growth reporting tied to the same event truth as acquisition.",
    hero:
      "Use PostHog with EVENTS Gateway when product teams want funnel analysis, feature usage, and experiments to stay aligned with the same signup, revenue, and lifecycle events used in marketing.",
    repository: "https://github.com/mountainash/posthog-managed-component",
    points: [
      "Keep product analytics aligned with marketing and revenue events",
      "Reduce event naming drift between experimentation and acquisition workflows",
      "Make funnel analysis easier to compare with campaign outcomes"
    ],
    useCases: [
      "Signup and activation funnel analysis",
      "Growth experiments tied to downstream revenue signals",
      "Product analytics built from the same source as paid media"
    ]
  },
  {
    slug: "counterscale",
    label: "Counterscale",
    title: "Counterscale integration",
    summary: "Add lightweight analytics without fragmenting the cleaner event model used across the rest of your stack.",
    hero:
      "Use Counterscale with EVENTS Gateway when your team wants privacy-aware traffic reporting while keeping naming, routing, and measurement discipline consistent across marketing analytics.",
    repository: "https://github.com/mackenly/counterscale-managed-component",
    points: [
      "Keep lightweight analytics aligned with broader routing decisions",
      "Reduce separate instrumentation for simple traffic reporting",
      "Reuse one event model across privacy-aware and marketing analytics"
    ],
    useCases: [
      "Simple website analytics from the same event stream",
      "Privacy-aware reporting alongside paid media tracking",
      "Teams that want lighter analytics without fragmented setup"
    ]
  }
] as const satisfies readonly IntegrationItem[];

export const integrationsContent = {
  eyebrow: "Integrations",
  title: "One event stream. Every destination that matters.",
  intro:
    "Browse the full EVENTS Gateway integration catalog and connect the tools that drive acquisition, attribution, analytics, CRM, and downstream reporting. Keep one clean event model, reduce duplicate tagging, and send better data everywhere.",
  items
} as const;

export type IntegrationSlug = (typeof integrationsContent.items)[number]["slug"];
