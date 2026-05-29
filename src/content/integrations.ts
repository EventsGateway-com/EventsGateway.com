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
    summary: "Push cleaner conversion actions into Microsoft Ads so bidding, reporting, and lead quality stay closer to the truth.",
    hero:
      "Use Bing when Microsoft Ads matters to pipeline or revenue and you want the same purchase, lead, and qualified funnel events that already power the rest of your paid search stack.",
    repository: "https://github.com/managed-components/bing",
    points: [
      "Keep Bing conversion totals closer to Google Ads, analytics, and CRM numbers",
      "Reuse one conversion model across branded, non-brand, and landing page campaigns",
      "Reduce the hidden cost of maintaining separate Microsoft Ads tagging"
    ],
    useCases: [
      "Lead generation programs that buy traffic on Microsoft Ads",
      "Ecommerce funnels that need clean purchase tracking for paid search",
      "Multi-engine search setups that need one shared conversion contract"
    ]
  },
  {
    slug: "branch",
    label: "Branch",
    title: "Branch integration",
    summary: "Unify app attribution, deep links, and downstream conversions so mobile growth decisions rely on cleaner data.",
    hero:
      "Use Branch when install, reopen, and in-app journeys need to stay connected to the same trusted conversion events your team already uses across web and paid media.",
    repository: "https://github.com/managed-components/branch",
    points: [
      "Keep Branch attribution closer to the same source of truth as site and app tracking",
      "Reduce drift between deep-link journeys, re-engagement flows, and paid campaign reports",
      "Make install and post-install conversion data easier to trust"
    ],
    useCases: [
      "App install and app reopen campaigns across paid channels",
      "Mobile deep-link journeys tied to ads, email, or referral traffic",
      "Teams that need clearer web-to-app attribution and reporting"
    ]
  },
  {
    slug: "facebook-pixel",
    label: "Facebook Pixel",
    title: "Facebook Pixel integration",
    summary: "Improve Meta EMQ, send stronger purchase and lead signals, and give the algorithm cleaner data to optimize on.",
    hero:
      "Use Facebook Pixel when Meta performance depends on better matching, cleaner browser and server-side tracking, and fewer wasted dollars caused by fragmented event setups.",
    repository: "https://github.com/managed-components/facebook-pixel",
    points: [
      "Improve Event Match Quality with cleaner identity, purchase, and lead events",
      "Keep Meta browser and server-side signals easier to reconcile",
      "Reduce wasted ad spend caused by duplicate tags, weak payloads, and broken event logic"
    ],
    useCases: [
      "Ecommerce purchase tracking for Meta campaigns",
      "Lead forms and qualified funnel events for performance marketing",
      "Audience building and retargeting from stronger identity and conversion signals"
    ]
  },
  {
    slug: "floodlight",
    label: "Floodlight",
    title: "Floodlight integration",
    summary: "Keep Floodlight conversion data cleaner and easier to compare with the rest of your enterprise measurement stack.",
    hero:
      "Use Floodlight when Google Marketing Platform reporting, attribution, and media operations all need to start from the same trusted conversion events used elsewhere in the business.",
    repository: "https://github.com/managed-components/floodlight",
    points: [
      "Align Floodlight activities with the same purchase and lead events used elsewhere",
      "Reduce implementation drift across ad serving, attribution, and reporting workflows",
      "Make enterprise media measurement easier to reconcile across systems and teams"
    ],
    useCases: [
      "Google Marketing Platform reporting programs",
      "Floodlight-based attribution and activity tracking",
      "Large paid media teams with agency and in-house reporting requirements"
    ]
  },
  {
    slug: "google-ads",
    label: "Google Ads",
    title: "Google Ads integration",
    summary: "Reduce mismatched totals and send Google Ads cleaner conversion actions for bidding, reporting, and remarketing.",
    hero:
      "Use Google Ads when you want conversion actions that stay cleaner across landing pages, forms, and checkout flows, without fighting constant gaps between Google Ads, GA4, and your CRM.",
    repository: "https://github.com/managed-components/google-ads",
    points: [
      "Map clean purchase and lead events into conversion actions once",
      "Keep Google Ads closer to the same conversion truth as GA4 and other channels",
      "Reduce reporting gaps caused by duplicated scripts, separate tags, and disconnected tooling"
    ],
    useCases: [
      "Lead generation funnels with multiple conversion steps",
      "Ecommerce purchase and checkout tracking",
      "Remarketing and audience building from one shared event stream"
    ]
  },
  {
    slug: "google-analytics",
    label: "Google Analytics",
    title: "Google Analytics integration",
    summary: "Keep classic Google Analytics reporting closer to the same clean events used by your marketing stack.",
    hero:
      "Use Google Analytics when legacy reporting still matters and you want analytics inputs to stay aligned with the same purchase, lead, and engagement events used across ads and downstream tools.",
    repository: "https://github.com/managed-components/google-analytics",
    points: [
      "Reuse one event model across analytics and paid media workflows",
      "Reduce manual differences between analytics tagging and ad tracking",
      "Keep reporting easier to compare during migrations and legacy support periods"
    ],
    useCases: [
      "Legacy analytics environments that still drive reporting",
      "Migration periods that need continuity with older dashboards",
      "Teams that want one measurement layer across older and newer analytics tools"
    ]
  },
  {
    slug: "google-analytics-4",
    label: "Google Analytics 4",
    title: "Google Analytics 4 integration",
    summary: "Keep GA4 reporting closer to the same events your ad platforms actually optimize on and your team actually trusts.",
    hero:
      "Use Google Analytics 4 when you want analytics, attribution, and ad performance discussions to start from the same clean purchase, lead, and lifecycle events instead of three different versions of the truth.",
    repository: "https://github.com/managed-components/google-analytics-4",
    points: [
      "Reuse the same clean event names across ads and analytics",
      "Reduce mismatches between GA4 totals and ad platform conversions",
      "Make funnel reporting easier to trust across channels, teams, and tools"
    ],
    useCases: [
      "Shared purchase and lead events across GA4 and ad tools",
      "Campaign reporting with cleaner funnel consistency",
      "Teams that want less manual reconciliation between analytics, media, and revenue reporting"
    ]
  },
  {
    slug: "google-maps-rwg",
    label: "Google Maps RWG",
    title: "Google Maps RWG integration",
    summary: "Turn bookings, reservations, and local leads into cleaner Reserve with Google signals your team can actually trust.",
    hero:
      "Use Google Maps RWG when local discovery needs to turn into booked appointments, reservations, and calls without losing the thread between Google surfaces, your site, and the rest of your reporting stack.",
    repository: "https://github.com/managed-components/google-maps-RWG",
    points: [
      "Keep booking, reservation, and call data closer to campaign, CRM, and analytics totals",
      "Reduce manual gaps between map discovery, appointment intent, and confirmed bookings",
      "Reuse one event model for calls, reservations, appointments, and local leads"
    ],
    useCases: [
      "Restaurants, clinics, salons, and services turning local search into reservations",
      "Appointment flows that start on Google surfaces and finish on your site",
      "Multi-location brands that need one local conversion model across markets"
    ]
  },
  {
    slug: "hubspot",
    label: "HubSpot",
    title: "HubSpot integration",
    summary: "Keep CRM updates, lead capture, and lifecycle automation aligned with the same conversion truth used in marketing.",
    hero:
      "Use HubSpot when sales and marketing need one trusted stream for leads, lifecycle changes, and revenue events instead of disconnected forms, automations, and CRM updates.",
    repository: "https://github.com/managed-components/hubspot",
    points: [
      "Keep CRM updates closer to the same source as ad and site conversions",
      "Reduce duplicated lead handling across forms, campaigns, and automation",
      "Make lifecycle and revenue events easier to trust across marketing and sales teams"
    ],
    useCases: [
      "Lead intake from forms, calls, and qualification steps",
      "Lifecycle updates tied to purchases and pipeline movement",
      "Teams that want a cleaner handoff from campaign click to CRM record"
    ]
  },
  {
    slug: "ihire",
    label: "iHire",
    title: "iHire integration",
    summary: "Track cleaner application and candidate conversions for recruitment programs running through iHire.",
    hero:
      "Use iHire when hiring campaigns need dependable application events, candidate milestones, and clearer reporting across recruitment landing pages, media sources, and internal hiring teams.",
    repository: "https://github.com/managed-components/iHire",
    points: [
      "Keep recruitment conversions aligned with the rest of your acquisition reporting",
      "Reduce noise between ad clicks, applications, and candidate journeys",
      "Reuse one cleaner event setup across hiring funnels instead of patching multiple tools together"
    ],
    useCases: [
      "Application completion tracking for job campaigns",
      "Candidate lead capture from recruitment pages",
      "Hiring funnels measured alongside the rest of paid acquisition"
    ]
  },
  {
    slug: "impact-radius",
    label: "Impact Radius",
    title: "Impact Radius integration",
    summary: "Keep affiliate and partner conversion data closer to the same purchase and lead truth used everywhere else in the business.",
    hero:
      "Use Impact Radius when partner programs, affiliate payouts, and internal reporting all need to start from one cleaner conversion source instead of multiple hand-built tracking paths.",
    repository: "https://github.com/managed-components/impact-radius",
    points: [
      "Align partner conversions with core ad and analytics data",
      "Reduce discrepancies between affiliate reporting and internal numbers",
      "Reuse one event model across direct, affiliate, partner, and marketplace channels"
    ],
    useCases: [
      "Affiliate revenue tracking for ecommerce brands",
      "Partner lead attribution programs",
      "Performance teams that need cleaner payout and commission signals"
    ]
  },
  {
    slug: "indeed",
    label: "Indeed",
    title: "Indeed integration",
    summary: "Measure job applications and candidate conversions on Indeed with cleaner, more reusable recruitment signals.",
    hero:
      "Use Indeed when hiring teams need application milestones and candidate events to stay consistent across career pages, recruitment campaigns, agencies, and internal reporting.",
    repository: "https://github.com/managed-components/indeed",
    points: [
      "Keep recruitment tracking aligned with the rest of your acquisition stack",
      "Reduce manual gaps across job clicks, applications, and candidate steps",
      "Make hiring performance easier to compare across channels and sources"
    ],
    useCases: [
      "Indeed-sponsored job campaigns",
      "Application and candidate lead tracking",
      "Recruitment reporting across multiple hiring sources and job boards"
    ]
  },
  {
    slug: "linkedin-insights",
    label: "LinkedIn Insights",
    title: "LinkedIn Insights integration",
    summary: "Send cleaner lead and audience signals into LinkedIn so B2B campaigns optimize on better data, not noisier forms.",
    hero:
      "Use LinkedIn Insights when long B2B buying journeys need stronger lead signals, cleaner attribution, and less duplicated tagging between paid social, analytics, and CRM workflows.",
    repository: "https://github.com/managed-components/linkedin",
    points: [
      "Keep LinkedIn conversion data aligned with Meta, Google Ads, and analytics",
      "Improve B2B lead tracking quality across longer sales cycles",
      "Reduce separate tagging work for every destination in the funnel"
    ],
    useCases: [
      "B2B lead generation campaigns on LinkedIn",
      "Audience building from lifecycle and funnel signals",
      "Attribution across demo requests, contact forms, and pipeline milestones"
    ]
  },
  {
    slug: "mixpanel",
    label: "Mixpanel",
    title: "Mixpanel integration",
    summary: "Keep product analytics closer to the same event truth that drives acquisition, activation, and revenue decisions.",
    hero:
      "Use Mixpanel when product, growth, and marketing teams need signup, activation, purchase, and lifecycle data to stay consistent across analysis, experimentation, and campaign decisions.",
    repository: "https://github.com/managed-components/mixpanel",
    points: [
      "Keep product analytics aligned with paid media and revenue events",
      "Reduce event naming drift between product and marketing teams",
      "Make behavioral analysis easier to compare with acquisition and revenue outcomes"
    ],
    useCases: [
      "Signup and onboarding funnel analysis",
      "Feature usage tied to acquisition quality",
      "Lifecycle reporting that combines product, marketing, and revenue data"
    ]
  },
  {
    slug: "outbrain",
    label: "Outbrain",
    title: "Outbrain integration",
    summary: "Send cleaner lead and purchase signals into Outbrain so native campaigns learn from better downstream data, not shallow page events.",
    hero:
      "Use Outbrain when content discovery campaigns should optimize on cleaner leads and purchases instead of fragmented page-level tracking that hides downstream quality.",
    repository: "https://github.com/managed-components/outbrain",
    points: [
      "Keep Outbrain conversion data aligned with the rest of your paid media stack",
      "Reduce native advertising tracking drift across landing pages",
      "Make top-of-funnel to conversion reporting easier to trust and compare"
    ],
    useCases: [
      "Content discovery campaigns tied to leads or purchases",
      "Native advertising funnels with longer consideration cycles",
      "Multi-channel reporting across awareness, nurture, and conversion media"
    ]
  },
  {
    slug: "pinterest",
    label: "Pinterest",
    title: "Pinterest integration",
    summary: "Improve Pinterest conversion quality with cleaner purchase, catalog, and audience signals that support better optimization.",
    hero:
      "Use Pinterest when inspiration-led journeys need cleaner purchase data, better audience building, and less duplicated tracking across creative landing pages, product pages, and catalog flows.",
    repository: "https://github.com/managed-components/pinterest",
    points: [
      "Keep Pinterest conversions consistent with Meta and Google Ads",
      "Improve purchase and audience signal quality for visual discovery campaigns",
      "Reduce duplicated tracking code across creative, landing, and catalog pages"
    ],
    useCases: [
      "Ecommerce purchase tracking for Pinterest campaigns",
      "Audience building from catalog and content engagement",
      "Remarketing flows that reuse the same event layer used across other channels"
    ]
  },
  {
    slug: "podsights",
    label: "Podsights",
    title: "Podsights integration",
    summary: "Connect podcast attribution to cleaner downstream conversions instead of disconnected media estimates and guessed outcomes.",
    hero:
      "Use Podsights when audio campaigns need purchase and lead signals that can be tied back to the same conversion truth your team already uses across search, social, and analytics.",
    repository: "https://github.com/managed-components/podsights",
    points: [
      "Align podcast attribution with the same source of truth as other channels",
      "Reduce disconnected reporting between awareness media and conversions",
      "Make delayed conversion signals easier to interpret and defend"
    ],
    useCases: [
      "Podcast campaign attribution and lift analysis",
      "Lead or purchase tracking after audio ad exposure",
      "Cross-channel reporting that includes audio, social, and search media"
    ]
  },
  {
    slug: "quora",
    label: "Quora",
    title: "Quora integration",
    summary: "Send cleaner lead and conversion events into Quora so educational and high-intent traffic performs with better downstream data.",
    hero:
      "Use Quora when your team wants lead generation and content-driven campaigns to optimize on cleaner signals without yet another isolated tagging setup to maintain.",
    repository: "https://github.com/managed-components/quora",
    points: [
      "Keep Quora conversion tracking aligned with other demand generation channels",
      "Reduce fragmented setup between content traffic and downstream conversions",
      "Improve trust in reporting across longer consideration and education funnels"
    ],
    useCases: [
      "Lead generation from high-intent Quora traffic",
      "Top-of-funnel content campaigns tied to downstream actions",
      "B2B and education funnels with longer research and consideration paths"
    ]
  },
  {
    slug: "reddit",
    label: "Reddit",
    title: "Reddit integration",
    summary: "Keep Reddit Ads conversions cleaner and easier to compare with the rest of your paid media stack and funnel reporting.",
    hero:
      "Use Reddit when community-led acquisition needs purchase, signup, and lead events that stay consistent across campaigns, landing pages, and the rest of your downstream reporting.",
    repository: "https://github.com/managed-components/reddit",
    points: [
      "Align Reddit campaign conversions with other ad platforms",
      "Reduce event drift across community, content, and landing page experiences",
      "Make testing and iteration easier with one reusable conversion layer"
    ],
    useCases: [
      "Product launches and niche community campaigns",
      "Signup and lead tracking from discussion-driven traffic",
      "Remarketing tied to engagement signals and downstream conversions"
    ]
  },
  {
    slug: "segment",
    label: "Segment",
    title: "Segment integration",
    summary: "Feed Segment from one cleaner event stream and extend the same conversion truth into warehouses, tools, and automation.",
    hero:
      "Use Segment when your team wants one controlled source for purchase, lead, and lifecycle events before routing them deeper into warehouses, SaaS tools, and downstream automation.",
    repository: "https://github.com/managed-components/segment",
    points: [
      "Keep CDP inputs aligned with paid media and analytics tracking",
      "Reduce duplicate event collection logic across tools and teams",
      "Make downstream routing easier to scale from one source of truth instead of many"
    ],
    useCases: [
      "Warehouses and SaaS destinations fed through Segment",
      "Lifecycle and product events shared across teams",
      "Data stack consolidation around one cleaner tracking and routing model"
    ]
  },
  {
    slug: "snapchat",
    label: "Snapchat",
    title: "Snapchat integration",
    summary: "Send Snapchat cleaner conversion signals for mobile-first campaigns that need better learning, better matching, and less drift.",
    hero:
      "Use Snapchat when mobile acquisition depends on stronger purchase and lead signals, cleaner attribution, and one reusable tracking setup across paid social channels.",
    repository: "https://github.com/managed-components/snapchat",
    points: [
      "Keep Snapchat conversion data aligned with Meta, TikTok, and Google Ads",
      "Improve signal quality across mobile-heavy acquisition funnels",
      "Reduce duplicated implementation work across paid social and landing page flows"
    ],
    useCases: [
      "Mobile-first lead generation campaigns",
      "Purchase events reused across social ad platforms",
      "Broader paid social measurement from one shared conversion layer"
    ]
  },
  {
    slug: "taboola",
    label: "Taboola",
    title: "Taboola integration",
    summary: "Route cleaner conversion events into Taboola for native discovery campaigns that need better downstream visibility and fewer reporting gaps.",
    hero:
      "Use Taboola when native acquisition and advertorial flows need cleaner lead and purchase data instead of fragmented landing page tagging that breaks as pages change.",
    repository: "https://github.com/managed-components/taboola",
    points: [
      "Align native campaign tracking with the same event truth as other channels",
      "Reduce landing page tagging differences across content programs",
      "Keep reporting cleaner from discovery click to final conversion"
    ],
    useCases: [
      "Native discovery campaigns with purchase goals",
      "Lead generation funnels supported by advertorial content",
      "Cross-channel reporting across native, search, and paid social media"
    ]
  },
  {
    slug: "tatari",
    label: "Tatari",
    title: "Tatari integration",
    summary: "Bring cleaner digital conversion data into Tatari for stronger TV attribution and cross-channel budget decisions.",
    hero:
      "Use Tatari when brand, streaming, and TV campaigns need downstream purchase and lead signals that stay consistent with the rest of digital measurement instead of sitting in a silo.",
    repository: "https://github.com/managed-components/tatari",
    points: [
      "Align TV attribution workflows with the same digital conversion truth",
      "Reduce disconnected reporting between offline and online channels",
      "Make blended media optimization depend on cleaner downstream conversion data"
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
    summary: "Send TikTok cleaner purchase and lead signals without building a separate tracking setup just for one channel.",
    hero:
      "Use TikTok when campaign learning depends on stronger mobile signals, cleaner attribution, and one reusable event stream that also serves the rest of your paid media stack.",
    repository: "https://github.com/managed-components/tiktok",
    points: [
      "Keep TikTok conversion data aligned with Meta and Google Ads",
      "Improve signal consistency across mobile-heavy acquisition funnels",
      "Avoid channel-by-channel tracking drift as creative volume and campaign count scale"
    ],
    useCases: [
      "Lead generation campaigns on mobile-heavy traffic",
      "Purchase events reused across multiple paid channels",
      "Paid social setups that need one cleaner conversion layer across the board"
    ]
  },
  {
    slug: "twitter",
    label: "Twitter",
    title: "Twitter integration",
    summary: "Keep Twitter conversion and audience signals tied to the same trusted event stream as the rest of your paid channels.",
    hero:
      "Use Twitter when performance campaigns and audience workflows need cleaner conversion data without extra tagging drift between content campaigns, direct response pushes, and analytics.",
    repository: "https://github.com/managed-components/twitter",
    points: [
      "Keep Twitter conversion signals consistent with other paid social channels",
      "Reduce implementation drift across content and direct response campaigns",
      "Make audience and conversion tracking easier to reuse across campaigns"
    ],
    useCases: [
      "Performance campaigns on Twitter",
      "Lead and signup tracking from content-driven traffic",
      "Audience workflows that share the same event truth used on other platforms"
    ]
  },
  {
    slug: "upward",
    label: "Upward",
    title: "Upward integration",
    summary: "Track cleaner lead and conversion events in Upward without adding another isolated measurement workflow to maintain.",
    hero:
      "Use Upward when niche acquisition channels should receive the same trusted conversion events already used across the broader paid media stack, not their own disconnected tracking logic.",
    repository: "https://github.com/managed-components/upward",
    points: [
      "Keep Upward conversion data tied to the same source of truth as other destinations",
      "Reduce duplicated setup across campaign and reporting workflows",
      "Improve trust in lead and conversion reporting for smaller channels"
    ],
    useCases: [
      "Lead generation programs using Upward",
      "Conversion reporting for niche acquisition channels",
      "Shared event logic across primary and secondary destination types"
    ]
  },
  {
    slug: "ziprecruiter",
    label: "ZipRecruiter",
    title: "ZipRecruiter integration",
    summary: "Measure job applications and candidate funnel steps in ZipRecruiter with cleaner recruitment events and less reporting guesswork.",
    hero:
      "Use ZipRecruiter when hiring campaigns need dependable application events, clearer funnel measurement, and one reusable recruitment tracking model across channels, pages, and job sources.",
    repository: "https://github.com/managed-components/ziprecruiter",
    points: [
      "Keep recruitment funnel tracking aligned with broader acquisition reporting",
      "Reduce gaps between application starts, completions, and downstream outcomes",
      "Reuse candidate event logic across hiring media channels and career flows"
    ],
    useCases: [
      "ZipRecruiter campaign application tracking",
      "Candidate lead capture and recruitment analytics",
      "Hiring funnels measured alongside the rest of acquisition channels"
    ]
  },
  {
    slug: "posthog",
    label: "PostHog",
    title: "PostHog integration",
    summary: "Keep product analytics, experiments, and growth reporting tied to the same event truth as acquisition and revenue.",
    hero:
      "Use PostHog when product teams want funnel analysis, feature usage, and experiments to stay aligned with the same signup, revenue, and lifecycle events that marketing uses to drive growth.",
    repository: "https://github.com/mountainash/posthog-managed-component",
    points: [
      "Keep product analytics aligned with marketing and revenue events",
      "Reduce event naming drift between experimentation and acquisition workflows",
      "Make funnel analysis easier to compare with campaign outcomes and revenue quality"
    ],
    useCases: [
      "Signup and activation funnel analysis",
      "Growth experiments tied to downstream revenue signals",
      "Product analytics built from the same event source as paid media and CRM"
    ]
  },
  {
    slug: "counterscale",
    label: "Counterscale",
    title: "Counterscale integration",
    summary: "Add lightweight analytics without fragmenting the cleaner event model already used across the rest of your stack.",
    hero:
      "Use Counterscale when your team wants privacy-aware traffic reporting while keeping naming, routing, and measurement discipline consistent across marketing analytics and attribution workflows.",
    repository: "https://github.com/mackenly/counterscale-managed-component",
    points: [
      "Keep lightweight analytics aligned with broader routing decisions",
      "Reduce separate instrumentation for simple traffic reporting",
      "Reuse one event model across privacy-aware analytics and marketing analytics"
    ],
    useCases: [
      "Simple website analytics from the same event stream",
      "Privacy-aware reporting alongside paid media tracking",
      "Teams that want lighter analytics without adding fragmented setup"
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
