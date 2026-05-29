export const whyNotDirectPixelsContent = {
  title: "Why EVENTS Gateway Instead Of Direct Pixels",
  eyebrow: "Direct Pixels Vs Event Gateway",
  intro:
    "Direct pixels are fast only when the stack has one destination and almost no operational ambition. EVENTS Gateway becomes the stronger commercial choice the moment the same site must improve Meta Event Match Quality (EMQ), route conversions to multiple platforms, and keep signal quality high without multiplying browser-side code.",
  reasons: [
    {
      title: "One event model instead of vendor-specific browser code",
      text: "With direct pixels, every ad platform pushes its own event naming, payload expectations, and implementation drift into your site code. EVENTS Gateway keeps one commercial event model and maps downstream later."
    },
    {
      title: "Add destinations without rewriting the site",
      text: "A direct-pixel approach breaks down as soon as the business wants Meta, Google Ads, TikTok, GA4, and internal reporting to all receive the same conversion truth."
    },
    {
      title: "Keep routing, retries, and transformations out of the browser",
      text: "The browser should not become a fragile patchwork of ad scripts. EVENTS Gateway moves routing logic, payload shaping, and retry-aware delivery into one dedicated control layer."
    },
    {
      title: "Stay neutral above vendors",
      text: "Direct pixels make the browser vendor-led. EVENTS Gateway makes the browser business-led, because your site emits conversions and the platform decides how each destination should receive them."
    }
  ],
  scorecard: [
    {
      label: "Meta-only launch speed",
      pixels: 5,
      gateway: 3,
      note: "Direct pixels win only for the smallest vendor-specific setup."
    },
    {
      label: "Multi-destination scaling",
      pixels: 1,
      gateway: 5,
      note: "EVENTS Gateway wins the moment the same conversion must feed Meta, Google, TikTok, and analytics tools."
    },
    {
      label: "Event Match Quality (EMQ) posture",
      pixels: 2,
      gateway: 5,
      note: "A central gateway makes identifiers, payload quality, and destination logic easier to control for stronger matching."
    },
    {
      label: "Commercial control",
      pixels: 1,
      gateway: 5,
      note: "EVENTS Gateway gives the site one neutral event layer rather than a pile of vendor-specific code paths."
    }
  ],
  comparisonRows: [
    ["Browser code", "Vendor-specific per platform", "One canonical event contract"],
    ["Event Match Quality (EMQ) inputs", "Managed differently per vendor", "Centralized for stronger matching quality"],
    ["Adding Meta, TikTok, GA4, and more", "More scripts and more logic in the site", "Route the same event stream to new destinations"],
    ["Retry and delivery logic", "Mostly absent in the browser", "Handled in the event gateway"],
    ["Tracking ownership", "Platform-led", "Business-led"],
    ["Best fit", "One simple vendor-only setup", "Teams that want durable ad signal and multi-platform routing"]
  ],
  ctaTitle: "Direct pixels are the shortest path. EVENTS Gateway is the stronger revenue system.",
  ctaText:
    "If the business will stay vendor-specific forever, direct pixels may be enough. If performance marketing, attribution, and event quality matter, EVENTS Gateway gives you one collection layer that can keep scaling without turning the browser into a tracking patchwork."
} as const;
