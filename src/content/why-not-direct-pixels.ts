export const whyNotDirectPixelsContent = {
  title: "Why EVENTS Gateway Instead Of Direct Pixels",
  eyebrow: "Direct Pixels Vs Event Gateway",
  intro:
    "Direct pixels are fine when a site sends events to one platform and the setup rarely changes. EVENTS Gateway becomes useful when the same site needs one event model, multiple destinations, and less browser-side tracking logic.",
  reasons: [
    {
      title: "One event model instead of platform-specific site code",
      text: "With direct pixels, each ad platform pushes its own event names and payload rules into your site code. EVENTS Gateway keeps one canonical event model and maps destinations later."
    },
    {
      title: "Add destinations without rewriting the site",
      text: "A direct-pixel setup gets harder to manage when Meta, Google Ads, TikTok, GA4, and internal reporting all need the same conversion data."
    },
    {
      title: "Keep routing, retries, and transformations out of the browser",
      text: "The browser should not become a patchwork of ad scripts. EVENTS Gateway moves routing logic, payload shaping, and retry-aware delivery into one control layer."
    },
    {
      title: "Stay neutral above vendors",
      text: "Direct pixels make the browser follow each vendor. EVENTS Gateway keeps the site focused on business events while the platform decides how each destination should receive them."
    }
  ],
  scorecard: [
    {
      label: "Meta-only launch speed",
      pixels: 5,
      gateway: 3,
      note: "Direct pixels are quickest for a small single-platform setup."
    },
    {
      label: "Multi-destination scaling",
      pixels: 1,
      gateway: 5,
      note: "EVENTS Gateway is easier once the same conversion must feed Meta, Google, TikTok, and analytics tools."
    },
    {
      label: "Event Match Quality (EMQ) posture",
      pixels: 2,
      gateway: 5,
      note: "A central gateway makes identifiers, payload quality, and destination logic easier to control."
    },
    {
      label: "Commercial control",
      pixels: 1,
      gateway: 5,
      note: "EVENTS Gateway gives the site one neutral event layer instead of several vendor-specific code paths."
    }
  ],
  comparisonRows: [
    ["Browser code", "Vendor-specific per platform", "One canonical event contract"],
    ["Matching inputs", "Managed differently per vendor", "Centralized in one event layer"],
    ["Adding Meta, TikTok, GA4, and more", "More scripts and more logic in the site", "Route the same event stream to new destinations"],
    ["Retry and delivery logic", "Mostly absent in the browser", "Handled in the event gateway"],
    ["Tracking ownership", "Platform-led", "Business-led"],
    ["Best fit", "One simple vendor-only setup", "Teams that want durable tracking and multi-platform routing"]
  ],
  ctaTitle: "Direct pixels are quick. An event gateway is easier to maintain as complexity grows.",
  ctaText:
    "If the business will stay tied to one vendor, direct pixels may be enough. If multiple tools need the same events, EVENTS Gateway gives you one collection layer that can keep scaling without turning the browser into a tracking patchwork."
} as const;
