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
  }
} as const;

export type CompareSlug = keyof typeof comparePages;
