export const homeContent = {
  eyebrow: "Open Source Event Gateway",
  title: "Collect events once, route them everywhere, and keep attribution under control.",
  description:
    "EventsGateway is an open source tracking and event routing platform for Meta, GA4, Google Ads, and custom event pipelines, built for teams that need visibility, control, and reliable delivery.",
  trustMarks: ["Open source", "Cloudflare-ready", "Built for Meta, GA4, Google Ads"],
  stats: [
    { label: "Event truth", value: "One envelope", detail: "Normalize once before routing to every destination" },
    { label: "Delivery model", value: "Multi-destination", detail: "Forward to ad platforms, analytics, and custom webhooks" },
    { label: "Control surface", value: "Full trace", detail: "Inspect validation, routing, attribution, and delivery status" }
  ],
  problems: [
    {
      icon: "spark",
      title: "Browser pixels are fragile",
      text: "Client-only tracking breaks under blockers, consent complexity, and browser restrictions."
    },
    {
      icon: "layers",
      title: "Event routing is hard to audit",
      text: "Teams often send the same conversion to multiple tools without a clear route plan or delivery trace."
    },
    {
      icon: "shield",
      title: "Attribution needs identity context",
      text: "Reliable conversion analysis depends on sessions, stitched identity, and reproducible touchpoint history."
    }
  ],
  capabilities: [
    {
      icon: "terminal",
      title: "Edge collector",
      text: "Receive browser and server events through a normalized collection layer built for strong validation."
    },
    {
      icon: "bolt",
      title: "Identity stitching",
      text: "Connect anonymous, session, and hashed user identifiers into a cleaner event history."
    },
    {
      icon: "cloud",
      title: "Attribution engine",
      text: "Attach touchpoints and conversion context before events leave the gateway."
    },
    {
      icon: "check",
      title: "Routing rules",
      text: "Define explicit conditions, consent gates, and destination delivery modes for every event flow."
    },
    {
      icon: "spark",
      title: "Destination adapters",
      text: "Send events to Meta, GA4, Google Ads, and custom event pipelines with transformed payloads."
    },
    {
      icon: "layers",
      title: "Debug and replay",
      text: "Inspect route traces, failed deliveries, and replay jobs without losing the raw event source of truth."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Install the tracker",
      text: "Add the script tag, package, or snippet to collect events from your site or application."
    },
    {
      step: "02",
      title: "Collect once",
      text: "Validate, normalize, enrich, and persist raw events before any delivery happens."
    },
    {
      step: "03",
      title: "Define routes",
      text: "Choose which event types go to which destinations, under which rules, with which transformations."
    },
    {
      step: "04",
      title: "Forward, debug, and improve",
      text: "Track delivery status, investigate failures, and replay or backfill with a full audit trail."
    }
  ],
  controlColumns: [
    {
      icon: "shield",
      title: "Privacy by default",
      text: "Hash identifiers, gate sensitive forwarding by consent, and avoid raw PII storage by default."
    },
    {
      icon: "terminal",
      title: "Explicit routing",
      text: "Keep route logic readable through match conditions, delivery plans, and transformation previews."
    },
    {
      icon: "cloud",
      title: "Self-hosted operations",
      text: "Deploy the public site and event gateway stack with Cloudflare-native primitives and open documentation."
    }
  ],
  finalCtaTitle: "Ready to centralize tracking, routing, and attribution in one gateway?",
  finalCtaText:
    "Download the project, review the architecture, and start routing events to Meta, GA4, Google Ads, and your own pipelines with more control."
} as const;
