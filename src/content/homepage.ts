export const homeContent = {
  eyebrow: "Event Routing Platform",
  title: "The event gateway for teams that want more purchases and&nbsp;<span style=\"color: var(--color-accent);\">less ad spend</span>.",
  description:
    "EVENTS Gateway gives teams one event layer for purchases, leads, signups, and lifecycle events. Collect data once, then route it to Meta, Google Ads, TikTok, GA4, CRM tools, and webhooks without rebuilding tracking for each destination.",
  trustMarks: [
    "One event layer for sites, funnels, and apps",
    "Fits ecommerce, lead generation, SaaS, and multi-site setups",
    "Built for teams that want simpler tracking operations"
  ],
  stats: [
    { label: "Setup model", value: "One event layer", detail: "Define events once and map destinations later" },
    { label: "Linear overage", value: "$5 / 1M", detail: "Costs grow in flat blocks instead of forcing a plan jump" },
    { label: "Best fit", value: "Ads + analytics + CRM", detail: "Send the same event stream to media, reporting, and downstream systems" }
  ],
  pricingHighlights: [
    {
      label: "Free allowance",
      value: "1M / mo",
      detail: "The Free plan includes up to 1,000,000 routed events every month before paid usage starts."
    },
    {
      label: "Overage block",
      value: "$5 / 1M",
      detail: "Every extra started block of 1,000,000 monthly events is billed at a flat $5."
    },
    {
      label: "Pricing model",
      value: "Linear",
      detail: "Costs scale in simple 1,000,000-event blocks instead of forcing a plan jump."
    },
    {
      label: "Enterprise",
      value: "$1,995+",
      detail: "Enterprise is for teams that need onboarding, support, and policy controls for larger programs."
    }
  ],
  pricingFootnote:
    "EVENTS Gateway starts free and scales in predictable blocks. The model stays simple: keep one event layer, keep naming consistent, and reuse the same data across ads, analytics, and CRM tools.",
  problems: [
    {
      icon: "spark",
      title: "The same conversion gets defined more than once",
      text: "When Meta, Google Ads, TikTok, GA4, and internal tools each use separate tracking logic, reporting drifts and debugging slows down."
    },
    {
      icon: "layers",
      title: "New destinations should not require a rebuild",
      text: "Most teams lose time every time a new platform or webhook needs the same purchase, lead, or signup event wired again."
    },
    {
      icon: "shield",
      title: "Browser tracking becomes hard to maintain",
      text: "The goal is not more scripts. The goal is cleaner delivery, fewer gaps, and less maintenance in site code."
    }
  ],
  capabilities: [
    {
      icon: "terminal",
      title: "Simple install",
      text: "Add one tracker or SDK once and stop repeating setup work for every new destination."
    },
    {
      icon: "bolt",
      title: "Canonical events",
      text: "Keep page views, leads, purchases, and lifecycle events on one naming model that stays readable over time."
    },
    {
      icon: "cloud",
      title: "Destination routing",
      text: "Send the same event stream to ads, analytics, CRM tools, and custom endpoints without duplicating browser logic."
    },
    {
      icon: "check",
      title: "Predictable operating cost",
      text: "Replace layers of plugins, scripts, and one-off integrations with one routing product and one pricing model."
    },
    {
      icon: "spark",
      title: "Operational visibility",
      text: "See routed volume, delivery health, and broken flows from one place instead of piecing the story together manually."
    },
    {
      icon: "layers",
      title: "Built for real teams",
      text: "Use the same setup across stores, lead-gen funnels, landing pages, product apps, and multi-site programs."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Install the tracker",
      text: "Add the script or SDK once and start sending events from one controlled layer."
    },
    {
      step: "02",
      title: "Name events once",
      text: "Track page views, leads, purchases, and custom milestones with stable names and cleaner payloads."
    },
    {
      step: "03",
      title: "Map destinations",
      text: "Choose how each event should flow to Meta, Google Ads, TikTok, analytics tools, CRM systems, and webhooks."
    },
    {
      step: "04",
      title: "Monitor delivery",
      text: "Use the dashboard to spot issues faster, keep routing healthy, and launch changes without touching every integration again."
    }
  ],
  controlColumns: [
    {
      icon: "shield",
      title: "Fewer reporting gaps",
      text: "A single event contract keeps tools closer to the same purchase, lead, and lifecycle story."
    },
    {
      icon: "terminal",
      title: "Less duplicate tagging",
      text: "New destinations use the same collection layer instead of forcing another browser-side implementation."
    },
    {
      icon: "cloud",
      title: "One operational view",
      text: "Routes, deliveries, retries, and destination behavior stay visible in one place."
    }
  ],
  finalCtaTitle: "Want one tracking setup that stays manageable as you grow?",
  finalCtaText:
    "Start with the hosted dashboard, collect events once, and route the same trusted data across ads, analytics, CRM tools, and custom endpoints without turning the browser into a patchwork of scripts."
} as const;
