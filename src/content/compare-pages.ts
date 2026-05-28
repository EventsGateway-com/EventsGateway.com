export const comparePages = {
  "cloudflare-zaraz": {
    title: "EventsGateway vs Cloudflare Zaraz",
    description:
      "Cloudflare Zaraz is strong for tag loading and third-party script governance. EventsGateway is stronger when you want a canonical event layer, routing rules, retries, destination fan-out, and a tracker contract you control directly.",
    winner: "Use EventsGateway when you want one event contract and one routing layer. Use Zaraz when your main problem is client-side tag management.",
    points: [
      {
        title: "What Zaraz does best",
        text: "Zaraz helps move third-party tooling and tag execution away from the browser. It is great when the primary goal is performance, tag governance, and lower client-side tag load."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway acts like a real event gateway: collect once, normalize once, route once, retry once, and deliver to multiple destinations with explicit routing logic."
      },
      {
        title: "Best fit",
        text: "Choose Zaraz for tag orchestration. Choose EventsGateway for destination routing, canonical naming, dashboard visibility, and event delivery control."
      }
    ],
    table: [
      ["Primary model", "Tag orchestration", "Event gateway and routing layer"],
      ["Canonical browser API", "Limited and tag-oriented", "Explicit canonical event contract"],
      ["Destination fan-out", "More tag-centric", "Core product capability"],
      ["Routing rules", "Basic compared with dedicated gateways", "First-class feature"],
      ["Cloudflare-native runtime", "Yes", "Yes"],
      ["Best for", "Tag cleanup and performance", "Tracking control and event distribution"]
    ]
  },
  rudderstack: {
    title: "EventsGateway vs RudderStack",
    description:
      "RudderStack is broader and more CDP-like. EventsGateway is narrower, faster to position, and stronger when you want a lightweight Cloudflare-native event gateway rather than a full customer data infrastructure layer.",
    winner: "Use EventsGateway for a focused Cloudflare-native routing layer. Use RudderStack when warehouse activation and broader CDP workflows are the main requirement.",
    points: [
      {
        title: "What RudderStack does best",
        text: "RudderStack is stronger for enterprise-grade data pipeline patterns, source coverage, and broader warehouse-centric workflows."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is easier to explain and deploy when your need is web event collection, multi-destination routing, and direct control over event semantics."
      },
      {
        title: "Best fit",
        text: "Choose RudderStack for a broader data movement stack. Choose EventsGateway when you want a smaller, clearer, Cloudflare-first tracking control layer."
      }
    ],
    table: [
      ["Primary model", "CDP and event pipeline", "Cloudflare-native event gateway"],
      ["Deployment complexity", "Broader platform footprint", "Smaller runtime footprint"],
      ["Canonical event control", "Strong", "Strong and simpler to reason about"],
      ["Small-site cost posture", "Usually broader than needed", "Often more attractive for smaller sites"],
      ["Best for", "Warehouse-heavy data teams", "Direct tracking and routing teams"],
      ["Cloudflare-native positioning", "No", "Yes"]
    ]
  },
  segment: {
    title: "EventsGateway vs Segment",
    description:
      "Segment is a widely known CDP with deep ecosystem reach. EventsGateway focuses on the simpler promise many teams actually need: one event contract, one collector, and one routing layer on Cloudflare.",
    winner: "Use EventsGateway when you want a leaner event gateway. Use Segment when your team specifically needs a broad CDP, workspace governance, and larger ecosystem workflows.",
    points: [
      {
        title: "What Segment does best",
        text: "Segment is strong for broad integrations, identity use cases, governance workflows, and established CDP processes."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway reduces the stack to the parts many teams really need: collection, routing, transformations, retries, and Cloudflare-native runtime."
      },
      {
        title: "Best fit",
        text: "Choose Segment when your buying center wants a classic CDP. Choose EventsGateway when you want a smaller, more deployable routing-first product."
      }
    ],
    table: [
      ["Primary model", "CDP", "Event gateway"],
      ["Install story", "Powerful but broader", "Smaller and easier to position"],
      ["Cloudflare-first deployment", "No", "Yes"],
      ["Canonical event layer", "Yes", "Yes"],
      ["Routing-first product story", "Secondary", "Primary"],
      ["Best for", "Larger CDP programs", "Focused event routing control"]
    ]
  },
  posthog: {
    title: "EventsGateway vs PostHog",
    description:
      "PostHog is excellent for product analytics, feature flags, session replay, and product teams. EventsGateway is better positioned as the event collection and routing layer that feeds ad platforms, analytics tools, and custom endpoints.",
    winner: "Use EventsGateway for destination routing control. Use PostHog for product analytics depth and user behavior tooling.",
    points: [
      {
        title: "What PostHog does best",
        text: "PostHog shines in product analytics, funnels, session replay, experimentation, and in-product behavior visibility."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is purpose-built for event collection, transformations, routing rules, delivery retries, and one-to-many destination fan-out."
      },
      {
        title: "Best fit",
        text: "Choose PostHog for product intelligence. Choose EventsGateway when your key problem is event collection and routing to ad and analytics destinations."
      }
    ],
    table: [
      ["Primary model", "Product analytics platform", "Event gateway and routing platform"],
      ["Ad destination focus", "Secondary", "Primary"],
      ["Session replay and product UX tooling", "Strong", "Not the core goal"],
      ["Canonical browser event API", "Possible", "Core story"],
      ["Best for", "Product teams", "Tracking and growth teams"],
      ["Cloudflare-native runtime", "No", "Yes"]
    ]
  },
  "gtm-server-side": {
    title: "EventsGateway vs GTM Server-Side",
    description:
      "GTM server-side is powerful when your team already lives inside the Google tag ecosystem. EventsGateway is better when you want a dedicated product around canonical event collection, routing clarity, and Cloudflare-native deployment.",
    winner: "Use EventsGateway when you want a productized event gateway. Use GTM server-side when your team prefers container-centric tag operations and mostly Google-oriented workflows.",
    points: [
      {
        title: "What GTM server-side does best",
        text: "GTM server-side works well for teams that already manage a mature tagging workflow and want server-side control inside familiar Google tooling."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway gives you a clearer event model, easier product messaging, and a cleaner routing-first stack that is not centered on container management."
      },
      {
        title: "Best fit",
        text: "Choose GTM server-side for container governance. Choose EventsGateway when you want a dedicated tracking product, not a tagging workspace."
      }
    ],
    table: [
      ["Primary model", "Server-side tag container", "Dedicated event gateway"],
      ["UI metaphor", "Container and tags", "Routes, destinations, transformations"],
      ["Cloudflare-native runtime", "Not native by default", "Native positioning"],
      ["Canonical event layer", "Possible but not central", "Central"],
      ["Best for", "Google-centered tagging teams", "Routing-first teams"],
      ["Small-site positioning", "Depends on host stack", "Very strong when kept in Cloudflare free tiers"]
    ]
  },
  jentis: {
    title: "EventsGateway vs JENTIS",
    description:
      "JENTIS is built around server-side tracking, consent-aware collection, and privacy-heavy enterprise setups. EventsGateway is better when you want a more deployable Cloudflare-native event gateway with a simpler product story and more explicit routing control.",
    winner: "Use EventsGateway for a clearer Cloudflare-native routing layer. Use JENTIS when privacy governance and enterprise server-side collection workflows are the main requirement.",
    points: [
      {
        title: "What JENTIS does best",
        text: "JENTIS is strong in privacy-aware server-side collection, governance, and enterprise measurement setups where consent and data ownership are major buying criteria."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is easier to understand as an open-source event gateway: collect once, route once, retry once, and deploy the whole stack on Cloudflare."
      },
      {
        title: "Best fit",
        text: "Choose JENTIS for privacy-led measurement programs. Choose EventsGateway when you want more explicit event routing, open-source flexibility, and a smaller deployment posture."
      }
    ],
    table: [
      ["Primary model", "Enterprise server-side tracking platform", "Open-source event gateway"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Privacy-led positioning", "Primary", "Strong but not the only story"],
      ["Routing-first product story", "Secondary", "Primary"],
      ["Open-source posture", "No", "Yes"],
      ["Best for", "Enterprise privacy programs", "Flexible routing control"]
    ]
  },
  "stape-gtm-ss": {
    title: "EventsGateway vs Stape + GTM Server-Side",
    description:
      "Stape plus GTM server-side is attractive when teams want managed hosting around an existing GTM server-side workflow. EventsGateway is stronger when you want a dedicated tracking product and canonical event layer instead of a managed container setup.",
    winner: "Use EventsGateway for a productized event gateway. Use Stape plus GTM server-side if your team is already standardized on GTM server containers and wants easier hosting.",
    points: [
      {
        title: "What Stape plus GTM server-side does best",
        text: "This setup reduces operational burden for teams already committed to GTM server-side, especially when the main need is hosted infrastructure rather than a new event model."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway gives you a canonical event API, routing rules, destination management, and Cloudflare-native deployment without centering the whole product around tag containers."
      },
      {
        title: "Best fit",
        text: "Choose Stape plus GTM server-side for managed GTM operations. Choose EventsGateway when you want a cleaner tracking architecture and an easier product story."
      }
    ],
    table: [
      ["Primary model", "Managed GTM server-side hosting", "Dedicated event gateway"],
      ["Canonical event contract", "Possible but indirect", "Core feature"],
      ["Cloudflare-native positioning", "No", "Yes"],
      ["Routing and transformations", "Via container logic", "Via explicit product logic"],
      ["Open-source posture", "No", "Yes"],
      ["Best for", "Teams already invested in GTM server-side", "Teams wanting a cleaner event stack"]
    ]
  },
  plausible: {
    title: "EventsGateway vs Plausible",
    description:
      "Plausible is excellent for simple, privacy-friendly website analytics. EventsGateway is designed for a different job: collecting canonical events and routing them to multiple destinations such as Meta, Google Ads, TikTok, GA4, and custom endpoints.",
    winner: "Use EventsGateway for multi-destination routing. Use Plausible for lightweight website analytics and simple reporting.",
    points: [
      {
        title: "What Plausible does best",
        text: "Plausible is simple, fast, and privacy-friendly. It is ideal when your main need is lightweight website analytics rather than cross-destination event routing."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway handles the richer routing layer: standard events, transformations, retries, destination fan-out, and controlled delivery to ad and analytics systems."
      },
      {
        title: "Best fit",
        text: "Choose Plausible for clean traffic analytics. Choose EventsGateway when one event stream needs to feed many destinations with rules and delivery control."
      }
    ],
    table: [
      ["Primary model", "Website analytics", "Event gateway and routing platform"],
      ["Ad destination delivery", "Not the core goal", "Primary use case"],
      ["Canonical event API", "Limited compared with gateway products", "Core feature"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Traffic reporting", "Tracking and routing control"],
      ["Small-site cost story", "Strong", "Strong when kept in free-tier limits"]
    ]
  },
  matomo: {
    title: "EventsGateway vs Matomo",
    description:
      "Matomo is strong when your main goal is analytics ownership, privacy, and self-hosted reporting. EventsGateway is stronger when you need one collection layer that forwards clean events to multiple ad and analytics destinations.",
    winner: "Use EventsGateway for routing and delivery control. Use Matomo for analytics ownership and reporting depth on your own infrastructure.",
    points: [
      {
        title: "What Matomo does best",
        text: "Matomo is compelling for organizations that want self-hosted analytics, privacy control, and a mature reporting environment."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway focuses on collection, transformations, routing, retries, and multi-destination delivery rather than being the final reporting product."
      },
      {
        title: "Best fit",
        text: "Choose Matomo for owned analytics. Choose EventsGateway when your main need is to normalize once and distribute everywhere."
      }
    ],
    table: [
      ["Primary model", "Analytics platform", "Event gateway"],
      ["Self-hosted reporting", "Strong", "Not the core goal"],
      ["Destination routing", "Limited compared with gateway products", "Primary use case"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Analytics ownership", "Tracking orchestration"],
      ["Ad platform integration story", "Secondary", "Primary"]
    ]
  },
  "ga4-gtm": {
    title: "EventsGateway vs GA4 + GTM",
    description:
      "GA4 plus GTM is the default stack many teams start with. EventsGateway becomes more compelling when the team outgrows one-vendor analytics and wants a canonical event layer that also routes reliably to ad platforms and custom systems.",
    winner: "Use EventsGateway when GTM and GA4 are no longer enough as the single control layer. Use GA4 plus GTM when your current requirement is basic analytics and tag management.",
    points: [
      {
        title: "What GA4 plus GTM does best",
        text: "The Google stack is familiar, widely documented, and effective for baseline analytics and tag management, especially in simple deployments."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway adds what the default stack lacks: an explicit canonical event contract, routing logic, transformations, retries, and a neutral layer above vendors."
      },
      {
        title: "Best fit",
        text: "Choose GA4 plus GTM for default analytics needs. Choose EventsGateway when you want a real event gateway rather than an accumulation of tags and triggers."
      }
    ],
    table: [
      ["Primary model", "Analytics plus tag management", "Dedicated event gateway"],
      ["Vendor neutrality", "Google-centered", "Multi-destination by design"],
      ["Canonical event contract", "Possible but often implicit", "Explicit and central"],
      ["Routing rules", "Via tag logic and triggers", "Via dedicated routing engine"],
      ["Cloudflare-native runtime", "No", "Yes"],
      ["Best for", "Default analytics setups", "Teams that need control above vendor tags"]
    ]
  },
  mixpanel: {
    title: "EventsGateway vs Mixpanel",
    description:
      "Mixpanel is built for product analytics, user behavior analysis, funnels, and retention reporting. EventsGateway is stronger when your core problem is neutral event collection and routing to ad platforms, analytics tools, and custom endpoints from one canonical layer.",
    winner: "Use EventsGateway for routing and delivery control. Use Mixpanel for product analytics depth and user behavior analysis.",
    points: [
      {
        title: "What Mixpanel does best",
        text: "Mixpanel is excellent for event analytics, funnels, retention, and product growth analysis inside product teams."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway gives you a vendor-neutral event collection layer with transformations, routing rules, retries, and multi-destination delivery."
      },
      {
        title: "Best fit",
        text: "Choose Mixpanel when reporting and user behavior analysis are the center of the stack. Choose EventsGateway when the stack needs a routing-first collection layer above vendors."
      }
    ],
    table: [
      ["Primary model", "Product analytics", "Event gateway"],
      ["Product funnels and retention", "Strong", "Not the core goal"],
      ["Ad platform delivery", "Secondary", "Primary"],
      ["Canonical event contract", "Possible", "Central"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Product teams", "Tracking orchestration teams"]
    ]
  },
  amplitude: {
    title: "EventsGateway vs Amplitude",
    description:
      "Amplitude is one of the strongest platforms for product analytics and behavior analysis. EventsGateway is better when the team needs a simpler Cloudflare-native routing layer rather than a full product analytics platform.",
    winner: "Use EventsGateway for collection and routing. Use Amplitude for product analytics depth and experimentation-friendly analysis.",
    points: [
      {
        title: "What Amplitude does best",
        text: "Amplitude shines in product analytics, cohort analysis, user journeys, and behavior-driven decision making."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway focuses on the event gateway layer: collect once, normalize once, and route reliably to many destinations."
      },
      {
        title: "Best fit",
        text: "Choose Amplitude when the main buyer is the product analytics team. Choose EventsGateway when the main problem is collection architecture and multi-destination delivery."
      }
    ],
    table: [
      ["Primary model", "Product analytics platform", "Event gateway and routing layer"],
      ["Behavior analysis depth", "Strong", "Secondary"],
      ["Ad and analytics fan-out", "Secondary", "Primary"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Canonical browser API", "Possible", "Core feature"],
      ["Best for", "Product analytics programs", "Tracking control programs"]
    ]
  },
  heap: {
    title: "EventsGateway vs Heap",
    description:
      "Heap is attractive when automatic product analytics capture is the main requirement. EventsGateway is better when the team wants explicit event naming, canonical routing, and one-to-many destination control rather than automatic analytics capture.",
    winner: "Use EventsGateway for explicit routing control. Use Heap for product analytics teams that value automatic capture and retroactive analysis.",
    points: [
      {
        title: "What Heap does best",
        text: "Heap is known for automatic capture, exploratory analysis, and product analytics workflows that reduce manual event planning."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway gives you a deliberate, explicit event model and stronger control over downstream routing, payload quality, and delivery."
      },
      {
        title: "Best fit",
        text: "Choose Heap for auto-capture-heavy analytics teams. Choose EventsGateway when event quality, control, and destination routing matter more than retroactive exploration."
      }
    ],
    table: [
      ["Primary model", "Auto-capture product analytics", "Explicit event gateway"],
      ["Automatic capture", "Strong", "Not the core story"],
      ["Canonical event design", "Less central", "Core principle"],
      ["Ad destination routing", "Secondary", "Primary"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Exploratory analytics teams", "Tracking architecture teams"]
    ]
  },
  snowplow: {
    title: "EventsGateway vs Snowplow",
    description:
      "Snowplow is powerful for data engineering teams that want highly modeled behavioral data pipelines. EventsGateway is stronger when the team wants a lighter Cloudflare-native event gateway with a simpler install and a clearer product story.",
    winner: "Use EventsGateway for a lighter routing-first stack. Use Snowplow when your organization needs a data-engineering-heavy event pipeline.",
    points: [
      {
        title: "What Snowplow does best",
        text: "Snowplow is excellent for data ownership, deep event modeling, and warehouse-centric pipelines operated by analytics engineering teams."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is easier to deploy and explain when your need is browser-side collection, transformation, routing, and delivery to multiple platforms."
      },
      {
        title: "Best fit",
        text: "Choose Snowplow for analytics engineering depth. Choose EventsGateway for a smaller event routing stack that can move faster on Cloudflare."
      }
    ],
    table: [
      ["Primary model", "Behavioral data pipeline", "Cloudflare-native event gateway"],
      ["Warehouse-heavy workflows", "Strong", "Secondary"],
      ["Install complexity", "Higher", "Lower"],
      ["Open-source posture", "Yes", "Yes"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Analytics engineering teams", "Tracking and growth teams"]
    ]
  },
  "adobe-analytics": {
    title: "EventsGateway vs Adobe Analytics",
    description:
      "Adobe Analytics is aimed at large enterprise analytics programs with deep reporting and ecosystem integration. EventsGateway is better when the team needs a focused open-source event gateway rather than a heavyweight enterprise analytics suite.",
    winner: "Use EventsGateway for a lighter open-source routing layer. Use Adobe Analytics for deep enterprise analytics and reporting programs.",
    points: [
      {
        title: "What Adobe Analytics does best",
        text: "Adobe Analytics is strong in enterprise reporting, segmentation, governance, and integration inside larger Adobe-centered ecosystems."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is easier to deploy, easier to understand, and more directly focused on collection, routing, retries, and multi-destination delivery."
      },
      {
        title: "Best fit",
        text: "Choose Adobe Analytics for large enterprise analytics programs. Choose EventsGateway when you need an open-source Cloudflare-native control layer above vendor platforms."
      }
    ],
    table: [
      ["Primary model", "Enterprise analytics suite", "Open-source event gateway"],
      ["Enterprise reporting depth", "Strong", "Secondary"],
      ["Multi-destination routing", "Secondary", "Primary"],
      ["Open-source posture", "No", "Yes"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Large enterprise analytics teams", "Flexible routing teams"]
    ]
  },
  "simple-analytics": {
    title: "EventsGateway vs Simple Analytics",
    description:
      "Simple Analytics is compelling for privacy-first website analytics with a lightweight UI and minimal complexity. EventsGateway is designed for teams that need routing, transformations, and delivery to multiple destinations from one canonical event stream.",
    winner: "Use EventsGateway for multi-destination event control. Use Simple Analytics for lightweight privacy-friendly site analytics.",
    points: [
      {
        title: "What Simple Analytics does best",
        text: "Simple Analytics keeps site analytics clean, minimal, and privacy-friendly for teams that do not need a larger data movement layer."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway is much stronger when a site needs to send events to ad platforms, analytics tools, and custom systems with explicit routing logic."
      },
      {
        title: "Best fit",
        text: "Choose Simple Analytics for lightweight reporting. Choose EventsGateway when one canonical event stream must feed many systems."
      }
    ],
    table: [
      ["Primary model", "Privacy-friendly website analytics", "Event gateway and routing platform"],
      ["Lightweight reporting", "Strong", "Secondary"],
      ["Destination fan-out", "Not the core goal", "Core use case"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Simple site analytics", "Tracking control and routing"],
      ["Small-site cost posture", "Strong", "Strong"]
    ]
  },
  fathom: {
    title: "EventsGateway vs Fathom",
    description:
      "Fathom is known for clean privacy-friendly analytics and a simple reporting story. EventsGateway is stronger when the site needs one canonical event layer that also feeds ad platforms and custom destinations.",
    winner: "Use EventsGateway for routing and collection control. Use Fathom for lightweight analytics and privacy-first reporting.",
    points: [
      {
        title: "What Fathom does best",
        text: "Fathom is excellent for clean, easy-to-understand website analytics without heavy implementation overhead."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway adds the missing routing layer: transformations, retries, destination fan-out, and a canonical browser-side event contract."
      },
      {
        title: "Best fit",
        text: "Choose Fathom for simple analytics. Choose EventsGateway when the same event stream must drive ads, analytics, and custom endpoints."
      }
    ],
    table: [
      ["Primary model", "Lightweight analytics", "Event gateway and routing platform"],
      ["Reporting simplicity", "Strong", "Secondary"],
      ["Multi-destination delivery", "Secondary", "Primary"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Simple privacy analytics", "Broader tracking orchestration"],
      ["Canonical event API", "Limited", "Core feature"]
    ]
  },
  "piwik-pro": {
    title: "EventsGateway vs Piwik PRO",
    description:
      "Piwik PRO is positioned for privacy, governance, and analytics ownership. EventsGateway is stronger when the team wants a lighter open-source Cloudflare-native collection and routing layer rather than a broader analytics suite.",
    winner: "Use EventsGateway for a lean routing-first architecture. Use Piwik PRO when privacy governance and owned analytics suites are the main requirement.",
    points: [
      {
        title: "What Piwik PRO does best",
        text: "Piwik PRO is strong for privacy-sensitive organizations that want governance, consent-aware analytics, and owned reporting environments."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway keeps the story simpler: collect events once, transform once, route everywhere, and stay Cloudflare-native."
      },
      {
        title: "Best fit",
        text: "Choose Piwik PRO for governance-heavy analytics programs. Choose EventsGateway for a more deployable, routing-first open-source stack."
      }
    ],
    table: [
      ["Primary model", "Privacy and governance analytics suite", "Open-source event gateway"],
      ["Owned analytics reporting", "Strong", "Secondary"],
      ["Multi-destination routing", "Secondary", "Primary"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Open-source posture", "Limited compared with EventsGateway", "Yes"],
      ["Best for", "Governance-heavy analytics teams", "Routing-first teams"]
    ]
  },
  "meta-pixel-direct": {
    title: "EventsGateway vs Meta Pixel Direct",
    description:
      "Meta Pixel direct is the simplest way to send events only to Meta. EventsGateway is better when Meta is just one destination among several and the team wants one canonical event contract instead of vendor-specific browser logic.",
    winner: "Use EventsGateway when Meta is only one part of a bigger tracking stack. Use Meta Pixel direct when the only requirement is basic Meta browser-side tracking.",
    points: [
      {
        title: "What Meta Pixel direct does best",
        text: "It is fast to set up when the business only needs browser-side Meta tracking and does not need a broader event architecture."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway lets the same canonical event feed Meta, Google Ads, TikTok, GA4, and custom systems without rewriting browser logic per destination."
      },
      {
        title: "Best fit",
        text: "Choose Meta Pixel direct for the most basic Meta-only setup. Choose EventsGateway when Meta should be one destination inside a broader routing model."
      }
    ],
    table: [
      ["Primary model", "Vendor-direct browser tag", "Canonical event gateway"],
      ["Meta-only tracking", "Strong", "Strong"],
      ["Multi-destination routing", "No", "Primary"],
      ["Vendor neutrality", "No", "Yes"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "Meta-only setups", "Broader ad and analytics stacks"]
    ]
  },
  "tiktok-pixel-direct": {
    title: "EventsGateway vs TikTok Pixel Direct",
    description:
      "TikTok Pixel direct is appropriate when the site only needs TikTok browser-side tracking. EventsGateway becomes stronger when TikTok is one destination among several and the business wants one neutral event layer across the stack.",
    winner: "Use EventsGateway when TikTok is one destination inside a multi-platform stack. Use TikTok Pixel direct when the setup is small and TikTok-only.",
    points: [
      {
        title: "What TikTok Pixel direct does best",
        text: "It is simple for straightforward TikTok tracking when the business does not need a broader routing or transformation layer."
      },
      {
        title: "What EventsGateway does best",
        text: "EventsGateway gives the site one canonical event model and lets TikTok receive mapped standard events alongside other destinations."
      },
      {
        title: "Best fit",
        text: "Choose TikTok Pixel direct for the smallest TikTok-only deployments. Choose EventsGateway for vendor-neutral collection and broader routing control."
      }
    ],
    table: [
      ["Primary model", "Vendor-direct browser tag", "Canonical event gateway"],
      ["TikTok-only tracking", "Strong", "Strong"],
      ["Multi-destination routing", "No", "Primary"],
      ["Vendor neutrality", "No", "Yes"],
      ["Cloudflare-native deployment", "No", "Yes"],
      ["Best for", "TikTok-only setups", "Broader ad and analytics stacks"]
    ]
  }
} as const;

export type CompareSlug = keyof typeof comparePages;
