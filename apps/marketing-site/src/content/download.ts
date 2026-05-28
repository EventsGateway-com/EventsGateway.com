export const downloadContent = {
  title: "Install",
  status: "Cloudflare Workers ready",
  intro:
    "EventsGateway is designed to install quickly on any site. Use the browser tracker, point it to the collector, and run the event gateway on Cloudflare Workers.",
  version: "Deployment model: tracker plus Cloudflare Workers runtime",
  platforms: [
    { name: "Script tag", detail: "Fast install path for marketing sites, landing pages, and stores", status: "Ready" },
    { name: "JavaScript SDK", detail: "Use the tracker package for custom event collection flows", status: "Ready" },
    { name: "Cloudflare Workers runtime", detail: "Deploy collector, API, and forwarding logic on the edge", status: "Ready" }
  ],
  releaseNotes: [
    "Install the tracker on any site and send events to one endpoint.",
    "Run routing and delivery logic through a Cloudflare Workers-based event gateway.",
    "Control routing, schemas, destinations, and operations from the dashboard."
  ],
  requirements: [
    "A website where a small script or SDK snippet can be added",
    "A Cloudflare Workers deployment for the collector and event routing runtime",
    "Destination credentials for tools such as Meta, GA4, Google Ads, or custom webhooks"
  ]
} as const;
