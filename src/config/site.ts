export const siteConfig = {
  name: "EventsGateway",
  shortName: "EG",
  domain: "https://eventsgateway.com",
  description:
    "Open source tracking and event routing platform for Meta, GA4, Google Ads, and custom event pipelines.",
  email: "contact@eventsgateway.com",
  tagline: "Open source tracking and event routing platform.",
  footerStatus: "Open source event infrastructure for collection, routing, and attribution.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Download", href: "/download/" },
    { label: "Contact", href: "/contact/" }
  ],
  cta: {
    primary: { label: "Download", href: "/download/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  social: {
    github: "https://github.com/eventsgateway",
    linkedin: "",
    x: ""
  },
  ogImage: "/og/eventsgateway.svg"
} as const;

export type SiteConfig = typeof siteConfig;
