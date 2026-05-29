export const homeContent = {
  eyebrow: "Commercial Event Gateway",
  title: "The best-priced event gateway for marketers who want less spend and better performance.",
  description:
    "EVENTS Gateway is built for advertisers who care about Meta signal quality, Event Match Quality (EMQ), cleaner conversion routing, stronger targeting, and lower tracking cost. Replace scattered pixels and expensive stacks with one event gateway that helps Meta receive the strongest possible data while the same event stream also feeds GA4, Google Ads, TikTok, and custom destinations, with cleaner mobile tracking and far better resilience on iOS devices.",
  trustMarks: [
    "Maximum Event Match Quality (EMQ) posture",
    "One setup, many destinations",
    "More reliable on mobile and iOS"
  ],
  stats: [
    { label: "Event Match Quality (EMQ)", value: "Max", detail: "Built to help Meta receive the strongest matching signal your site can send" },
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
    "EVENTS Gateway is positioned for advertisers who want stronger Meta signal quality and cleaner attribution without accepting the cost of bloated tracking stacks: the first 1,000,000 routed monthly events stay free, each extra started 1,000,000-event block adds $5, and Enterprise starts at $1,995 per month.",
  problems: [
    {
      icon: "spark",
      title: "Meta signal quality drops when tracking is fragmented",
      text: "Advertisers lose matching quality when browser logic is spread across plugins, pixels, tags, and inconsistent event payloads."
    },
    {
      icon: "layers",
      title: "Direct pixels make attribution harder to trust",
      text: "When Meta, GA4, Google Ads, and internal systems all collect separately, campaign data becomes harder to trust and wasted spend grows faster."
    },
    {
      icon: "shield",
      title: "Advertising teams need stronger data without a longer setup",
      text: "Most teams need a setup they can install fast, keep readable, and use to improve match quality across desktop, mobile, and iOS-heavy traffic without a long implementation project."
    }
  ],
  capabilities: [
    {
      icon: "terminal",
      title: "Fast install",
      text: "Add one tracker or SDK once and stop repeating separate setup work for Meta, Google Ads, GA4, TikTok, and every new destination."
    },
    {
      icon: "bolt",
      title: "One event stream",
      text: "Send events once, keep naming clean, and avoid fragmented vendor-by-vendor tracking that weakens campaign performance."
    },
    {
      icon: "cloud",
      title: "Multi-destination routing",
      text: "Send one clean event stream to Meta, GA4, Google Ads, TikTok, webhooks, and custom tools without duplicating your tracking setup."
    },
    {
      icon: "check",
      title: "Lower operating cost",
      text: "Replace bloated stacks and duplicate integrations with one commercial model that stays cheaper and easier to understand."
    },
    {
      icon: "spark",
      title: "Commercial visibility",
      text: "See volume, delivery health, and the quality of the data your campaigns depend on from one dashboard instead of across multiple tools."
    },
    {
      icon: "layers",
      title: "Built for growth teams",
      text: "Use the same setup across stores, lead-gen funnels, landing pages, product apps, and multi-site programs while keeping Meta-focused event quality high, especially on mobile and iOS traffic."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Install the tracker",
      text: "Add the script or SDK to your site once and start sending cleaner events from one place."
    },
    {
      step: "02",
      title: "Collect clean events",
      text: "Send page views, leads, purchases, and custom events into one normalized collection layer built for stronger ad-platform matching and more reliable mobile measurement."
    },
    {
      step: "03",
      title: "Define routes and destinations",
      text: "Control how events move to Meta, Google Ads, TikTok, analytics tools, and custom systems without rebuilding tracking each time."
    },
    {
      step: "04",
      title: "Observe and optimize",
      text: "Use the dashboard to see what is working, spot broken flows faster, and improve campaign data over time."
    }
  ],
  controlColumns: [
    {
      icon: "shield",
      title: "Lower total cost",
      text: "Pay for one event gateway instead of stacking separate tools, plugins, agencies, and duplicated tracking setups."
    },
    {
      icon: "terminal",
      title: "Cleaner commercial signal",
      text: "Keep routing, naming, identifiers, and conversion logic centralized so Meta and other platforms receive stronger matching input and better targeting signals."
    },
    {
      icon: "cloud",
      title: "One control center",
      text: "Tracking rules, deliveries, and visibility stay in one product instead of being spread across plugins, tags, and disconnected vendors."
    }
  ],
  finalCtaTitle: "Ready to improve Event Match Quality (EMQ) without paying for a heavier stack?",
  finalCtaText:
    "Start with the hosted dashboard, collect once, route everywhere, and give Meta, Google Ads, and TikTok stronger conversion signal while keeping the commercial model clearer and cheaper than heavier alternatives."
} as const;
