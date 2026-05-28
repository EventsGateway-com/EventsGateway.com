export const homeContent = {
  eyebrow: "Cloudflare-Native Event Gateway",
  title: "Tracking that looks premium, installs fast, and can stay free for many small sites.",
  description:
    "EventsGateway is a Cloudflare-native event gateway for Meta, GA4, Google Ads, and custom pipelines. Add one lightweight tracker to any website, send events to one endpoint, and control routing, delivery, retries, and observability from a single dashboard. For many small sites, the runtime can stay inside Cloudflare free-tier limits before the paid plan is even needed.",
  trustMarks: [
    "Built on Cloudflare Workers",
    "Small-site free-tier friendly",
    "One event stream, many destinations"
  ],
  stats: [
    { label: "Workers Free", value: "100K/day", detail: "Requests included before the paid plan becomes relevant" },
    { label: "Queues Free", value: "10K/day", detail: "Daily operations included for lightweight delivery pipelines" },
    { label: "R2 Free", value: "10 GB", detail: "Standard storage included with free operations every month" }
  ],
  pricingHighlights: [
    {
      label: "Workers Free",
      value: "100,000/day",
      detail: "Worker requests included on the free plan, which is often enough for a small tracking setup."
    },
    {
      label: "Queues Free",
      value: "10,000/day",
      detail: "Queue operations included for retry-friendly event delivery on low-volume sites."
    },
    {
      label: "R2 Free",
      value: "10 GB",
      detail: "Standard object storage included, plus 1M Class A and 10M Class B operations per month."
    },
    {
      label: "Paid Plan",
      value: "$5/mo",
      detail: "The Workers paid plan usually matters only after your site grows beyond the free-tier envelope."
    }
  ],
  pricingFootnote:
    "Cloudflare pricing depends on real usage. Free-tier capacity, storage, and queue limits apply, so small sites can often run tracking at zero monthly runtime cost while larger workloads move naturally into paid usage.",
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
      title: "Built on Cloudflare services",
      text: "Workers, Durable Objects, D1, Queues, and R2 give the platform an edge-native stack without traditional server overhead."
    },
    {
      icon: "terminal",
      title: "Small-site cost advantage",
      text: "Many low-volume sites can keep event collection and routing inside Cloudflare free-tier limits instead of paying for a separate tracking backend."
    },
    {
      icon: "cloud",
      title: "One control center",
      text: "Routes, deliveries, schemas, retry paths, and operations stay visible in one place instead of being spread across vendors."
    }
  ],
  finalCtaTitle: "Ready to launch Cloudflare-native tracking on your site?",
  finalCtaText:
    "Install EventsGateway quickly, collect events once, and keep delivery to analytics, ads, and custom endpoints under one control layer with a cost model that stays friendly to small sites."
} as const;
