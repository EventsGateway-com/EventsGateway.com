export const pricingContent = {
  eyebrow: "Transparent Pricing",
  title: "Start free, then pay only when routed volume grows.",
  intro:
    "EventsGateway is priced for performance teams that want stronger Meta signal quality, higher Event Match Quality (EMQ) posture, cleaner mobile and iOS tracking, and lower software cost. The Free plan includes up to 1,000,000 events per month, and every additional 1,000,000-event block is billed at $5.",
  plans: [
    {
      name: "Free",
      price: "$0",
      cadence: "/ month",
      highlight: "Up to 1,000,000 events every month",
      features: [
        "Up to 1,000,000 routed events per month",
        "Register, log in, and start from the hosted dashboard",
        "Built for stronger Meta signal quality, cleaner Event Match Quality (EMQ) inputs, and better targeting data",
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
        "No forced migration to a separate enterprise-only setup",
        "Designed for advertisers, ecommerce teams, lead generation, mobile funnels, and multi-site installs"
      ]
    },
    {
      name: "Enterprise",
      price: "$1,995+",
      cadence: "/ month",
      highlight: "For large-volume, multi-team or support",
      features: [
        "Support for advanced Meta signal strategy and performance measurement programs",
        "Enterprise onboarding and architecture support",
        "Advanced billing support and invoice workflows",
        "Multi-user administration and operational policies",
        "Priority support for complex event routing programs"
      ]
    }
  ],
  included: [
    "One event collection layer that can fan out to multiple destinations",
    "Signal quality posture designed for stronger Meta matching and better conversion routing",
    "Routing rules, transformations, consent-aware delivery, and retries",
    "Hosted dashboard access without a separate install step on the Free plan",
    "Commercial billing model that starts free and scales linearly",
    "Stripe Checkout, Stripe webhooks, invoices, reminders, and routing suspension controls"
  ],
  footnotes: [
    "The free allowance covers up to 1,000,000 routed events in a calendar month.",
    "Once usage exceeds the included monthly allowance, billing adds $5 for each started extra block of 1,000,000 events.",
    "EventsGateway is positioned to help performance teams send cleaner identifiers and conversion context to Meta for maximum Event Match Quality (EMQ) posture and more reliable mobile measurement.",
    "Stripe is used for payment processing and payment-method handling so card data never lives on EventsGateway servers.",
    "If an invoice remains unpaid for 15 days after due date, EventsGateway can suspend event routing automatically until payment is resolved."
  ]
} as const;
