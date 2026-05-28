export const whyNotDirectPixelsContent = {
  title: "Why EventsGateway Instead Of Direct Pixels",
  eyebrow: "Direct Pixels Vs Event Gateway",
  intro:
    "Direct pixels are fast when the stack has one destination and one simple goal. EventsGateway becomes the better architecture when the same site must feed Meta, Google Ads, TikTok, GA4, and custom systems without duplicating browser logic for every vendor.",
  reasons: [
    {
      title: "One event model instead of vendor-specific browser code",
      text: "With direct pixels, every platform pushes its own event naming, payload expectations, and implementation drift into your site code. EventsGateway keeps one canonical event contract and maps downstream later."
    },
    {
      title: "Add destinations without rewriting the site",
      text: "A direct-pixel approach grows messy as soon as the business needs more than one ad platform, more than one analytics tool, or more than one team touching tracking."
    },
    {
      title: "Keep routing, retries, and transformations out of the browser",
      text: "The browser should not become a fragile integration hub. EventsGateway moves routing logic, payload shaping, and retry-aware delivery into a dedicated control layer."
    },
    {
      title: "Stay neutral above vendors",
      text: "Direct pixels make the browser vendor-led. EventsGateway makes the browser product-led, because your site emits business events and the platform decides how each destination should receive them."
    }
  ],
  scorecard: [
    {
      label: "Fast single-destination setup",
      pixels: 5,
      gateway: 3,
      note: "Direct pixels are faster only when the setup is very small and vendor-specific."
    },
    {
      label: "Multi-destination scaling",
      pixels: 1,
      gateway: 5,
      note: "EventsGateway wins once the same site must feed multiple ad and analytics systems."
    },
    {
      label: "Tracking governance",
      pixels: 2,
      gateway: 5,
      note: "A central gateway makes naming, payload quality, and destination logic easier to control."
    },
    {
      label: "Vendor neutrality",
      pixels: 1,
      gateway: 5,
      note: "EventsGateway gives the site a neutral event layer rather than vendor-specific code paths."
    }
  ],
  comparisonRows: [
    ["Browser code", "Vendor-specific per platform", "One canonical event contract"],
    ["Adding Meta, TikTok, GA4, and more", "More scripts and more logic in the site", "Route the same event stream to new destinations"],
    ["Retry and delivery logic", "Mostly absent in the browser", "Handled in the event gateway"],
    ["Tracking ownership", "Platform-led", "Product-led"],
    ["Long-term maintainability", "Falls off as vendors increase", "Improves as routing centralizes"],
    ["Best fit", "One simple vendor-only setup", "Teams that want a durable tracking architecture"]
  ],
  ctaTitle: "Direct pixels are the shortest path. EventsGateway is the stronger system.",
  ctaText:
    "If the business will stay vendor-specific forever, direct pixels may be enough. If the stack will grow, EventsGateway gives you one collection layer that can keep scaling without turning the browser into a tracking patchwork."
} as const;
