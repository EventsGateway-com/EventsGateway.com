export const pricingContent = {
  eyebrow: "Transparent Pricing",
  title: "Start free, then pay only when routed volume grows.",
  intro:
    "EventsGateway starts with a clear commercial rule set: the Free plan includes up to 1,000,000 events per month, and every additional 1,000,000-event block is billed at $5. Create an account, log in, and start without a separate install step on the hosted product.",
  plans: [
    {
      name: "Free",
      price: "$0",
      cadence: "/ month",
      highlight: "Up to 1,000,000 events every month",
      features: [
        "Up to 1,000,000 routed events per month",
        "Register, log in, and start from the hosted dashboard",
        "Collector, API, forwarder, routing engine, and dashboard included",
        "Meta, GA4, Google Ads, TikTok, webhooks, and custom pipelines",
        "Operational visibility, retries, queues, and delivery logs"
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
      name: "Enterprise",
      price: "$1,995+",
      cadence: "/ month",
      highlight: "For large-volume, multi-team, or custom support needs",
      features: [
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
    "Hosted dashboard access without a separate install step on the Free plan",
    "Commercial billing model that starts free and scales linearly",
    "Stripe Checkout, Stripe webhooks, invoices, reminders, and routing suspension controls"
  ],
  footnotes: [
    "The free allowance covers up to 1,000,000 routed events in a calendar month.",
    "Once usage exceeds the included monthly allowance, billing adds $5 for each started extra block of 1,000,000 events.",
    "Stripe is used for payment processing and payment-method handling so card data never lives on EventsGateway servers.",
    "If an invoice remains unpaid for 15 days after due date, EventsGateway can suspend event routing automatically until payment is resolved."
  ]
} as const;
