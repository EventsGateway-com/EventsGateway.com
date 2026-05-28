export const downloadContent = {
  title: "Install",
  status: "Cloudflare-native and small-site friendly",
  intro:
    "EventsGateway is designed to install quickly on any site. Use the browser tracker, point it to the collector, and run the event gateway on Cloudflare services with a pricing model that can stay free for many small sites.",
  version: "Deployment model: tracker plus Cloudflare-native runtime",
  platforms: [
    { name: "Script tag", detail: "Fast install path for marketing sites, landing pages, and stores", status: "Ready" },
    { name: "JavaScript SDK", detail: "Use the tracker package for custom event collection flows", status: "Ready" },
    { name: "Cloudflare Workers runtime", detail: "Deploy collector, API, and forwarding logic on the edge", status: "Ready" }
  ],
  releaseNotes: [
    "Install the tracker on any site and send events to one endpoint.",
    "Run routing and delivery logic through a Cloudflare Workers-based event gateway.",
    "Keep many small-site setups inside Cloudflare free-tier limits before the $5/month paid plan is needed.",
    "Control routing, schemas, destinations, and operations from the dashboard."
  ],
  requirements: [
    "A website where a small script or SDK snippet can be added",
    "A Cloudflare Workers deployment for the collector and event routing runtime",
    "Destination credentials for tools such as Meta, GA4, Google Ads, or custom webhooks",
    "Traffic and storage volume that match the Cloudflare free tier if you want to keep runtime cost at zero"
  ]
} as const;
