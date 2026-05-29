export const homeContent = {
  eyebrow: "Commercial Event Gateway",
  title: "The best-priced event gateway for teams that want more signal and less spend.",
  description:
    "EventsGateway replaces scattered pixels, server-side workarounds, and expensive tracking stacks with one lower-cost control layer for Meta, GA4, Google Ads, TikTok, and custom destinations. Install once, route everywhere, and keep pricing predictable from startup volume to enterprise scale.",
  trustMarks: [
    "Lower-cost commercial model",
    "One setup, many destinations",
    "Clear pricing from day one"
  ],
  stats: [
    { label: "Starts free", value: "1,000,000", detail: "Monthly routed events included before usage billing begins" },
    { label: "Linear overage", value: "$5 / 1M", detail: "No pricing cliff when routed volume grows" },
    { label: "Enterprise from", value: "$1,995+", detail: "Commercial support for high-volume programs and complex delivery needs" }
  ],
  pricingHighlights: [
    {
      label: "Free allowance",
      value: "1M / mo",
      detail: "The Free plan includes up to 1,000,000 routed events every month before commercial overage starts."
    },
    {
      label: "Overage block",
      value: "$5 / 1M",
      detail: "Every extra started block of 1,000,000 monthly events is billed at a flat $5."
    },
    {
      label: "Pricing model",
      value: "Linear",
      detail: "There is no hard pricing cliff. Costs scale in simple 1,000,000-event blocks."
    },
    {
      label: "Enterprise",
      value: "$1,995+",
      detail: "Enterprise plans start at $1,995 per month for high-volume and custom support needs."
    }
  ],
  pricingFootnote:
    "EventsGateway keeps pricing legible: the first 1,000,000 routed monthly events stay free, each extra started 1,000,000-event block adds $5, and Enterprise starts at $1,995 per month.",
  problems: [
    {
      icon: "spark",
      title: "Pixels and scripts become hard to control",
      text: "Teams often spread tracking logic across plugins, tags, inline scripts, and fragile vendor-specific setups."
    },
    {
      icon: "layers",
      title: "Event delivery lacks a single control layer",
      text: "When Meta, GA4, Google Ads, and internal webhooks all run separately, routing and debugging become painful."
    },
    {
      icon: "shield",
      title: "Installation should be simple, not a project",
      text: "Most teams need a setup they can drop into any site quickly without rebuilding their entire frontend stack."
    }
  ],
  capabilities: [
    {
      icon: "terminal",
      title: "Fast install",
      text: "Add one tracker or SDK once and stop repeating separate setup work for every destination."
    },
    {
      icon: "bolt",
      title: "One event stream",
      text: "Collect events once, standardize naming once, and avoid fragmented vendor-by-vendor tracking logic."
    },
    {
      icon: "cloud",
      title: "Multi-destination routing",
      text: "Route one clean event stream to Meta, GA4, Google Ads, TikTok, webhooks, and custom pipelines."
    },
    {
      icon: "check",
      title: "Lower operating cost",
      text: "Replace bloated stacks and duplicate integrations with one commercial model that stays easy to understand."
    },
    {
      icon: "spark",
      title: "Commercial visibility",
      text: "See routed volume, delivery health, and operational behavior from one dashboard instead of across multiple tools."
    },
    {
      icon: "layers",
      title: "Built for growth teams",
      text: "Use the same setup across stores, lead-gen funnels, landing pages, product apps, and multi-site programs."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Install the tracker",
      text: "Add the script or SDK to your site and point it to the EventsGateway collector endpoint."
    },
    {
      step: "02",
      title: "Collect clean events",
      text: "Send page views, leads, purchases, and custom events into one normalized collection layer."
    },
    {
      step: "03",
      title: "Define routes and destinations",
      text: "Control how events move to analytics, ads, and custom systems with explicit routing rules."
    },
    {
      step: "04",
      title: "Observe and optimize",
      text: "Use the dashboard to inspect delivery, debug event flow, and improve reliability over time."
    }
  ],
  controlColumns: [
    {
      icon: "shield",
      title: "Lower total cost",
      text: "Pay for one event gateway instead of stacking separate tools, plugins, and duplicated tracking setups."
    },
    {
      icon: "terminal",
      title: "Cleaner commercial signal",
      text: "Keep routing, naming, and conversion logic centralized so ad platforms and analytics tools receive better input."
    },
    {
      icon: "cloud",
      title: "One control center",
      text: "Routes, deliveries, retry logic, and operational visibility stay in one product instead of being spread across vendors."
    }
  ],
  finalCtaTitle: "Ready to cut tracking cost without losing control?",
  finalCtaText:
    "Start with the hosted dashboard, collect once, route everywhere, and keep a commercial model that stays clearer and cheaper than heavier alternatives."
} as const;
