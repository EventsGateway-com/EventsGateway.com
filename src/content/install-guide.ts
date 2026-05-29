export const installGuideContent = {
  title: "Install EventsGateway On Your Domain",
  eyebrow: "GitHub To Production",
  intro:
    "This guide shows the fastest path from the GitHub repository page to a working EventsGateway setup on your own domain. The goal is simple: create the required Cloudflare resources manually using the preset project names, define their real IDs and names in Wrangler, deploy the runtime, connect a collector subdomain, install the tracker on any site you already run, and keep the setup inside free-tier limits whenever your traffic profile allows it.",
  preflight: [
    {
      title: "GitHub repository access",
      text: "Start from the public GitHub page for this project so you can clone it, fork it, or deploy from your own copy."
    },
    {
      title: "Cloudflare account",
      text: "You need a Cloudflare account with access to Workers and the domain where the collector subdomain will run. Create D1, Queues, KV namespaces, R2 buckets, and Durable Objects manually inside your own account, keep the official resource names, then define the generated IDs and names in Wrangler."
    },
    {
      title: "A target website",
      text: "Your site can live on any stack. EventsGateway only needs a small tracker install and one collector endpoint."
    },
    {
      title: "Stripe account",
      text: "If you want commercial billing from day one, prepare Stripe test and production API keys before running the private install values."
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
      title: "Create Cloudflare resources manually",
      text: "Create the D1 database, queue, KV namespaces, R2 ledger bucket, and Durable Object resources in your own Cloudflare account first. Keep the preset project names and copy the generated IDs and names because the next step defines them in Wrangler."
    },
    {
      step: "03",
      title: "Define resources in Wrangler and deploy",
      text: "Add the manual Cloudflare resource IDs and names to Wrangler for the collector, API, and forwarder workers, then deploy them to Cloudflare. For many small sites, this can stay inside the free-tier envelope."
    },
    {
      step: "04",
      title: "Attach a collector subdomain",
      text: "Choose a subdomain such as events.example.com or edge.example.com and point it to the collector worker so every site event goes through one controlled entry point."
    },
    {
      step: "05",
      title: "Install the tracker on the site",
      text: "Add the script tag or SDK snippet to the target website and send events to your collector endpoint. This is why the platform can be installed quickly on almost any site."
    },
    {
      step: "06",
      title: "Configure routing and destinations",
      text: "Use the dashboard to define routes, transformations, and destinations for Meta, GA4, Google Ads, or custom webhooks."
    },
    {
      step: "07",
      title: "Verify event flow on the real domain",
      text: "Load the live site, confirm page views and custom events reach the collector, then validate routing, delivery status, and retries from the dashboard."
    },
    {
      step: "08",
      title: "Activate Stripe billing",
      text: "Set Stripe publishable key, secret key, webhook secret, and billing return URL during installation so payment methods, invoices, reminders, and suspension logic are ready."
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
      title: "Create Cloudflare resources manually",
      code: `npx wrangler d1 create eventsgateway-control-plane
npx wrangler queues create eventsgateway-ingest-production
npx wrangler kv namespace create EVENTSGATEWAY_CACHE
npx wrangler r2 bucket create eventsgateway-ledger-production`
    },
    {
      title: "Define resources in Wrangler",
      code: `"d1_databases": [
  {
    "binding": "DB",
    "database_name": "eventsgateway-control-plane",
    "database_id": "replace-with-your-d1-database-id",
    "remote": true
  }
],
"kv_namespaces": [
  {
    "binding": "CACHE",
    "id": "replace-with-your-kv-namespace-id"
  }
],
"r2_buckets": [
  {
    "binding": "LEDGER_BUCKET",
    "bucket_name": "eventsgateway-ledger-production"
  }
],
"durable_objects": {
  "bindings": [
    {
      "name": "VISITOR_STATE_DO",
      "class_name": "VisitorStateDurableObject"
    }
  ]
},
"migrations": [
  {
    "tag": "v1",
    "new_sqlite_classes": ["VisitorStateDurableObject"]
  }
],
"queues": {
  "producers": [
    {
      "binding": "EVENTS_QUEUE",
      "queue": "eventsgateway-ingest-production"
    }
  ]
}`
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
      title: "Set Stripe billing secrets",
      code: `cd apps/api-worker
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET

cd ../dashboard
set VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me`
    },
    {
      title: "Add the tracker to your site",
      code: `<script
  src="https://events.example.com/tracker.js"
  data-site-id="site_alpha"
  data-api-key="pk_live_replace_me"
  data-endpoint="https://events.example.com/v1/collect"
  async
></script>`
    }
  ],
  checklist: [
    "GitHub repository cloned or forked into your own account",
    "Cloudflare D1, Queues, KV namespaces, R2 ledger bucket, and Durable Object resources created manually in your own account",
    "Wrangler files updated with the real resource IDs and names before deploy",
    "Cloudflare Workers deployed for collector, API, and forwarding runtime",
    "Collector subdomain mapped on your domain",
    "Stripe publishable key, secret key, and webhook secret configured",
    "Tracker snippet added to the target site",
    "At least one destination configured in the dashboard",
    "Live events verified from the production domain"
  ]
} as const;
