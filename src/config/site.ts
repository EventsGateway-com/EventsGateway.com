export const siteConfig = {
  name: "EVENTS Gateway",
  shortName: "EG",
  domain: "https://eventsgateway.com",
  description:
    "Open source tracking and event routing platform for Meta, GA4, Google Ads, and custom event pipelines.",
  tagline: "Open source event routing for cleaner conversions, stronger targeting, and higher Event Match Quality (EMQ).",
  footerStatus: "Open source event routing for cleaner signals, better attribution, and stronger campaign performance.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing/" },
    { label: "Docs", href: "/docs/" },
    { label: "Compare", href: "/compare/" }
  ],
  cta: {
    primary: { label: "Install", href: "/install/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  auth: {
    login: { label: "Login", href: "https://dash.eventsgateway.com/login" },
    register: { label: "Register", href: "https://dash.eventsgateway.com/register" }
  },
  social: {
    github: "https://github.com/EventsGateway-com/EventsGateway.com",
    linkedin: "",
    x: ""
  },
  ogImage: "/og/command-lattice.svg"
} as const;

export type SiteConfig = typeof siteConfig;
