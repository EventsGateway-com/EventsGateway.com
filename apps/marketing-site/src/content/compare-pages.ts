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
  }
} as const;

export type CompareSlug = keyof typeof comparePages;
