export const homeContent = {
  eyebrow: "Cloudflare Workers Event Gateway",
  title: "Collect events once, route them everywhere, and install in minutes on any site.",
  description:
    "EventsGateway is a Cloudflare Workers-based event gateway for Meta, GA4, Google Ads, and custom pipelines. Add one lightweight tracker to any website, send events to one endpoint, and control routing, delivery, and observability from a single dashboard.",
  trustMarks: ["Built on Cloudflare Workers", "Easy install on any site", "One event stream, many destinations"],
  stats: [
    { label: "Install path", value: "Minutes", detail: "Script tag or SDK setup for any site" },
    { label: "Runtime model", value: "Edge-first", detail: "Built on Cloudflare Workers for fast ingestion" },
    { label: "Routing posture", value: "One to many", detail: "Collect once and forward to multiple destinations" }
  ],
  problems: [
    {
      icon: "spark",
      title: "Pixels and scripts become hard to control",
      text: "Teams often spread tracking logic across plugins, tags, inline scripts, and fragile vendor-specific setups."
    },
    {
      icon: "layers",
      title: "Event delivery lacks a single control layer",
      text: "When Meta, GA4, Google Ads, and internal webhooks all run separately, routing and debugging become painful."
    },
    {
      icon: "shield",
      title: "Installation should be simple, not a project",
      text: "Most teams need a setup they can drop into any site quickly without rebuilding their entire frontend stack."
    }
  ],
  capabilities: [
    {
      icon: "terminal",
      title: "Simple tracker install",
      text: "Add EventsGateway with a small script or SDK integration and start sending events from any website."
    },
    {
      icon: "bolt",
      title: "Cloudflare Workers ingestion",
      text: "Receive and process events at the edge with a lightweight runtime built for fast request handling."
    },
    {
      icon: "cloud",
      title: "Event routing engine",
      text: "Match rules, respect consent, generate route plans, and fan out to multiple destinations from one event stream."
    },
    {
      icon: "check",
      title: "Destination delivery control",
      text: "Send events to Meta, GA4, Google Ads, or custom webhooks with observable delivery status and retries."
    },
    {
      icon: "spark",
      title: "Dashboard visibility",
      text: "Inspect recent events, routes, schemas, destinations, queues, and operational health from one dashboard."
    },
    {
      icon: "layers",
      title: "Reusable on any site",
      text: "Use the same collector and routing model across marketing sites, stores, landing pages, and product apps."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Install the tracker",
      text: "Add the script or SDK to your site and point it to the EventsGateway collector endpoint."
    },
    {
      step: "02",
      title: "Collect normalized events",
      text: "Send page views, leads, purchases, and custom events into one Cloudflare Workers-based ingestion layer."
    },
    {
      step: "03",
      title: "Define routes and destinations",
      text: "Control how events move to analytics, ads, and custom systems with explicit routing rules."
    },
    {
      step: "04",
      title: "Observe and optimize",
      text: "Use the dashboard to inspect delivery, debug event flow, and improve reliability over time."
    }
  ],
  controlColumns: [
    {
      icon: "shield",
      title: "Built on Cloudflare Workers",
      text: "The core collector and runtime are designed for edge execution with a lightweight operational footprint."
    },
    {
      icon: "terminal",
      title: "Easy to install",
      text: "The install path is intentionally simple so teams can connect any site without a long integration project."
    },
    {
      icon: "cloud",
      title: "One control center",
      text: "Routes, deliveries, schemas, and operations stay visible in one place instead of being spread across vendors."
    }
  ],
  finalCtaTitle: "Ready to add a Cloudflare Workers event gateway to your site?",
  finalCtaText:
    "Install EventsGateway quickly, collect events once, and keep delivery to analytics, ads, and custom endpoints under one control layer."
} as const;
