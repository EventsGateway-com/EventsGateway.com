export const pricingContent = {
  eyebrow: "Simple Pricing",
  title: "Start free. Pay for routed volume when you grow.",
  intro:
    "The Free plan includes up to 1,000,000 routed events per month. After that, usage is billed in flat 1,000,000-event blocks at $5 each. Enterprise is available for teams that need onboarding, support, or policy controls.",
  plans: [
    {
      name: "Free",
      price: "$0",
      cadence: "/ month",
      highlight: "Up to 1,000,000 events every month",
      features: [
        "Up to 1,000,000 routed events per month",
        "Start from the hosted dashboard without a separate install step",
        "Collector, API, forwarder, routing engine, and dashboard included",
        "Meta, GA4, Google Ads, TikTok, webhooks, and custom pipelines",
        "Delivery visibility, retries, queues, and logs",
        "Built for teams that want one event layer from day one"
      ]
    },
    {
      name: "Usage Expansion",
      price: "$5",
      cadence: " per extra 1M events",
      highlight: "Linear overage, no plan cliff",
      features: [
        "Each additional 1,000,000-event block adds $5",
        "Scale from small volumes to large monthly routing programs",
        "Keep the same product setup as volume grows",
        "Enterprise is only for support, onboarding, and custom operating needs",
        "Fits ecommerce, lead generation, SaaS, and multi-site installs"
      ]
    },
    {
      name: "Enterprise",
      price: "$1,995+",
      cadence: "/ month",
      highlight: "For large-volume, multi-team, or supported rollouts",
      features: [
        "Architecture support for larger routing programs",
        "Enterprise onboarding and architecture support",
        "Advanced billing support and invoice workflows",
        "Multi-user administration and operational policies",
        "Priority support for complex event routing programs"
      ]
    }
  ],
  included: [
    "One event collection layer that can fan out to multiple destinations",
    "Routing rules, transformations, consent-aware delivery, and retries",
    "Hosted dashboard access on the Free plan",
    "A pricing model that starts free and scales linearly",
    "Stripe Checkout, Stripe webhooks, invoices, reminders, and routing suspension controls",
    "Tools for teams that want cleaner event operations without extra platform sprawl"
  ],
  footnotes: [
    "The free allowance covers up to 1,000,000 routed events in a calendar month.",
    "Once usage exceeds the included monthly allowance, billing adds $5 for each started extra block of 1,000,000 events.",
    "The same pricing model applies whether you route events to one destination or many.",
    "Stripe is used for payment processing and payment-method handling so card data never lives on EVENTS Gateway servers.",
    "If an invoice remains unpaid for 15 days after due date, EVENTS Gateway can suspend event routing automatically until payment is resolved."
  ]
} as const;
