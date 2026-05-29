export const pricingContent = {
  eyebrow: "Transparent Pricing",
  title: "Start free, then pay only when routed volume grows.",
  intro:
    "EventsGateway starts with a clear commercial rule set: the Free plan includes up to 1,000,000 events per month, and every additional 1,000,000-event block is billed at $5. The page below explains the limits, what is included, and how monthly overage works without hidden wording.",
  plans: [
    {
      name: "Free",
      price: "$0",
      cadence: "/ month",
      highlight: "Up to 1,000,000 events every month",
      features: [
        "Up to 1,000,000 routed events per month",
        "Collector, API, forwarder, routing engine, dashboard, and install flow",
        "Meta, GA4, Google Ads, TikTok, webhooks, and custom pipelines",
        "Operational visibility, retries, queues, and delivery logs",
        "Stripe-ready billing foundation for future paid growth"
      ]
    },
    {
      name: "Usage Expansion",
      price: "$5",
      cadence: " per extra 1M events",
      highlight: "Linear overage, no plan cliff",
      features: [
        "Each additional 1,000,000-event block adds $5",
        "Billing stays transparent as volume grows",
        "No forced migration to a separate enterprise-only runtime",
        "Designed for product, ecommerce, growth, and multi-site installs"
      ]
    },
    {
      name: "Commercial",
      price: "Custom",
      cadence: "",
      highlight: "For large-volume, multi-team, or custom support needs",
      features: [
        "Custom billing support and invoice workflows",
        "Advanced payment recovery and account controls",
        "Multi-user administration and operational policies",
        "Priority support for complex event routing programs"
      ]
    }
  ],
  included: [
    "One event collection layer that can fan out to multiple destinations",
    "Routing rules, transformations, consent-aware delivery, and retries",
    "Install guidance for Cloudflare Workers, dashboard, and collector domains",
    "Commercial billing model that starts free and scales linearly"
  ],
  footnotes: [
    "The free allowance covers up to 1,000,000 routed events in a calendar month.",
    "Once usage exceeds the included monthly allowance, billing adds $5 for each started extra block of 1,000,000 events.",
    "Stripe is used for payment processing and payment-method handling so card data never lives on EventsGateway servers."
  ]
} as const;
