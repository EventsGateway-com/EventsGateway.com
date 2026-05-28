export const siteConfig = {
  name: "EventsGateway",
  shortName: "EG",
  domain: "https://eventsgateway.com",
  description:
    "Open source tracking and event routing platform for Meta, GA4, Google Ads, and custom event pipelines.",
  email: "contact@eventsgateway.com",
  tagline: "Open source tracking and event routing with a Cloudflare-native delivery path.",
  footerStatus: "Open source event infrastructure for collection, routing, delivery, and observability.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Install", href: "/install/" },
    { label: "Docs", href: "/docs/" },
    { label: "Playbooks", href: "/docs/playbooks/" },
    { label: "Comparisons", href: "/compare/" },
    { label: "Contact", href: "/contact/" }
  ],
  cta: {
    primary: { label: "Install", href: "/install/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  social: {
    github: "https://github.com/EventsGateway-com/EventsGateway.com",
    linkedin: "",
    x: ""
  },
  ogImage: "/og/command-lattice.svg"
} as const;

export type SiteConfig = typeof siteConfig;
