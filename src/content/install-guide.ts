export const installGuideContent = {
  title: "Install EVENTS Gateway On Your Domain",
  eyebrow: "Self-Hosted Install",
  intro:
    "This guide shows a direct path from the public GitHub repository to a working EVENTS Gateway setup on your own domain. Create the required Cloudflare resources, add their real IDs and names to Wrangler, deploy the runtime, connect a collector subdomain, and install the tracker on your site.",
  preflight: [
    {
      title: "GitHub repository access",
      text: "Start from the public GitHub repository so you can clone it, fork it, or deploy from your own copy."
    },
    {
      title: "Cloudflare account",
      text: "You need a Cloudflare account with access to Workers and the domain where the collector subdomain will run. Create D1, Queues, KV namespaces, R2 buckets, and Durable Objects in your own account, keep the preset resource names, then add the generated IDs and names to Wrangler."
    },
    {
      title: "A target website",
      text: "Your site can live on any stack. EVENTS Gateway only needs a tracker install and one collector endpoint."
    },
    {
      title: "Stripe account",
      text: "If you want billing from day one, prepare your Stripe keys before filling in the private install values."
    }
  ],
  steps: [
    {
      step: "01",
      title: "Open the GitHub repository page",
      text: "Start from GitHub, review the project, and clone or fork it into your own account so you can deploy and maintain your own EVENTS Gateway instance."
    },
    {
      step: "02",
      title: "Create Cloudflare resources manually",
      text: "Create the D1 database, queue, KV namespaces, R2 ledger bucket, and Durable Object resources in your own Cloudflare account. Keep the preset project names and copy the generated IDs and names because the next step adds them to Wrangler."
    },
    {
      step: "03",
      title: "Define resources in Wrangler and deploy",
      text: "Add the Cloudflare resource IDs and names to Wrangler for the collector, API, and forwarder workers, then deploy them to Cloudflare. Smaller sites can often stay inside free-tier limits."
    },
    {
      step: "04",
      title: "Attach a collector subdomain",
      text: "Choose a subdomain such as events.example.com or edge.example.com and point it to the collector worker so every site event goes through one controlled entry point."
    },
    {
      step: "05",
      title: "Install the tracker on the site",
      text: "Add the script tag or SDK snippet to the target website and send events to your collector endpoint."
    },
    {
      step: "06",
      title: "Configure routing and destinations",
      text: "Use the dashboard to define routes, transformations, and destinations for Meta, GA4, Google Ads, TikTok, or custom webhooks."
    },
    {
      step: "07",
      title: "Verify event flow on the real domain",
      text: "Load the live site, confirm page views and custom events reach the collector, then validate routing, delivery status, and retries from the dashboard."
    },
    {
      step: "08",
      title: "Activate Stripe billing",
      text: "Set the Stripe publishable key, secret key, webhook secret, and billing return URL so payment methods, invoices, reminders, and suspension logic are ready."
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
cd EventsGateway.com`
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
  src="https://events.example.com/e/"
  data-site-id="site_alpha"
  data-api-key="pk_live_replace_me"
  data-endpoint="https://events.example.com/i/"
  async
></script>`
    }
  ],
  checklist: [
    "GitHub repository cloned or forked into your own account",
    "Cloudflare D1, Queues, KV namespaces, R2 ledger bucket, and Durable Object resources created in your own account",
    "Wrangler files updated with the real resource IDs and names before deploy",
    "Cloudflare Workers deployed for collector, API, and forwarding runtime",
    "Collector subdomain mapped on your domain",
    "Stripe publishable key, secret key, and webhook secret configured",
    "Tracker snippet added to the target site",
    "At least one destination configured in the dashboard",
    "Live events verified from the production domain"
  ]
} as const;
