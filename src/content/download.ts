export const downloadContent = {
  title: "Download",
  status: "Open source distribution",
  intro:
    "Get the public site package, review the architecture, and prepare self-hosted deployment paths for the full EventsGateway platform.",
  version: "Version channel: public foundation release",
  platforms: [
    { name: "Marketing Site", detail: "Static Astro site for eventsgateway.com with Cloudflare deployment flow", status: "Available" },
    { name: "Gateway Docs", detail: "Technical guidance for collector, routing, attribution, and destination architecture", status: "Available" },
    { name: "Self-hosting Path", detail: "Cloudflare-first deployment model for public site and gateway services", status: "In progress" }
  ],
  releaseNotes: [
    "The public site positions EventsGateway as an open source tracking and event routing platform.",
    "Download guidance focuses on self-hosting, source review, and architecture visibility rather than closed beta access.",
    "Future releases will expand with dashboard, collector, forwarder, and destination-specific packages."
  ],
  requirements: [
    "Node.js 22+ for local development and build verification",
    "Cloudflare account for production deployment of the static public site",
    "Technical familiarity with event routing, analytics destinations, or self-hosted infrastructure"
  ]
} as const;
