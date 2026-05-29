export const downloadContent = {
  title: "Download",
  status: "Open source distribution",
  intro:
    "Get the public source, review the architecture, and prepare a self-hosted deployment path for EVENTS Gateway.",
  version: "Version channel: public foundation release",
  platforms: [
    { name: "Marketing Site", detail: "Static Astro site for eventsgateway.com with a Cloudflare deployment flow", status: "Available" },
    { name: "Gateway Docs", detail: "Technical guidance for the collector, routing, attribution, and destination setup", status: "Available" },
    { name: "Self-hosting Path", detail: "Cloudflare-first deployment model for the public site and gateway services", status: "In progress" }
  ],
  releaseNotes: [
    "The public release focuses on source access, architecture visibility, and deployment clarity.",
    "Download guidance is centered on self-hosting and source review rather than private access.",
    "Future releases can expand with dashboard, collector, forwarder, and destination-specific packages."
  ],
  requirements: [
    "Node.js 22+ for local development and build verification",
    "Cloudflare account for production deployment of the static public site",
    "Basic familiarity with event routing, analytics destinations, or self-hosted infrastructure"
  ]
} as const;
