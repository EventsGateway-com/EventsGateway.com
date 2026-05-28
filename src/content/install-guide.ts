export const installGuideContent = {
  title: "Install EventsGateway On Your Domain",
  eyebrow: "GitHub To Production",
  intro:
    "This guide shows the fastest path from the GitHub repository page to a working EventsGateway setup on your own domain. The goal is simple: deploy the Cloudflare runtime, connect a collector subdomain, install the tracker on any site you already run, and keep the setup inside free-tier limits whenever your traffic profile allows it.",
  preflight: [
    {
      title: "GitHub repository access",
      text: "Start from the public GitHub page for this project so you can clone it, fork it, or deploy from your own copy."
    },
    {
      title: "Cloudflare account",
      text: "You need a Cloudflare account with access to Workers and the domain where the collector subdomain will run. Many small sites can start on Cloudflare free tiers before the paid plan is needed."
    },
    {
      title: "A target website",
      text: "Your site can live on any stack. EventsGateway only needs a small tracker install and one collector endpoint."
    }
  ],
  steps: [
    {
      step: "01",
      title: "Open the GitHub repository page",
      text: "Start from GitHub, review the project, and clone or fork it into your own account so you can deploy and maintain your own EventsGateway instance."
    },
    {
      step: "02",
      title: "Deploy the Workers runtime",
      text: "Install dependencies, configure Wrangler for the collector, API, and forwarder workers, then deploy them to Cloudflare. For many small sites, this can stay inside the free-tier envelope."
    },
    {
      step: "03",
      title: "Attach a collector subdomain",
      text: "Choose a subdomain such as events.example.com or edge.example.com and point it to the collector worker so every site event goes through one controlled entry point."
    },
    {
      step: "04",
      title: "Install the tracker on the site",
      text: "Add the script tag or SDK snippet to the target website and send events to your collector endpoint. This is why the platform can be installed quickly on almost any site."
    },
    {
      step: "05",
      title: "Configure routing and destinations",
      text: "Use the dashboard to define routes, transformations, and destinations for Meta, GA4, Google Ads, or custom webhooks."
    },
    {
      step: "06",
      title: "Verify event flow on the real domain",
      text: "Load the live site, confirm page views and custom events reach the collector, then validate routing, delivery status, and retries from the dashboard."
    }
  ],
  domainExample: {
    appDomain: "www.example.com",
    collectorDomain: "events.example.com",
    apiDomain: "api.example.com"
  },
  commandBlocks: [
    {
      title: "Clone from GitHub",
      code: `git clone https://github.com/EventsGateway-com/EventsGateway.com.git
cd eventsgateway`
    },
    {
      title: "Install dependencies",
      code: `npm install
cd apps/api-worker && npm install
cd ../collector-worker && npm install
cd ../forwarder-worker && npm install`
    },
    {
      title: "Deploy the Workers runtime",
      code: `cd apps/api-worker
npx wrangler deploy

cd ../collector-worker
npx wrangler deploy

cd ../forwarder-worker
npx wrangler deploy`
    },
    {
      title: "Add the tracker to your site",
      code: `<script>
  window.eventsGatewayEndpoint = "https://events.example.com/v1/collect";
</script>
<script src="https://cdn.example.com/eventsgateway/tracker.js"></script>`
    }
  ],
  checklist: [
    "GitHub repository cloned or forked into your own account",
    "Cloudflare Workers deployed for collector, API, and forwarding runtime",
    "Collector subdomain mapped on your domain",
    "Tracker snippet added to the target site",
    "At least one destination configured in the dashboard",
    "Live events verified from the production domain"
  ]
} as const;
