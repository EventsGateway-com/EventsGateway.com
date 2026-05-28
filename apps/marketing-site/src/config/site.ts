export const siteConfig = {
  name: "EventsGateway",
  shortName: "EG",
  domain: "https://example.com",
  description:
    "A Cloudflare-native event gateway that installs easily on any site, routes events to analytics, ads, and custom destinations, and can stay free for many small sites within Cloudflare free-tier limits.",
  email: "contact@example.com",
  tagline: "Cloudflare-native tracking and event routing with a free-tier-friendly path for small sites.",
  footerStatus: "Built on Cloudflare services and designed so many small sites can start with free-tier-friendly tracking.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Install", href: "/install/" },
    { label: "Docs", href: "/docs/" },
    { label: "Compare", href: "/compare/" },
    { label: "Contact", href: "/contact/" }
  ],
  cta: {
    primary: { label: "Install", href: "/install/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  social: {
    github: "https://github.com/EventsGateway-com/EventsGateway.com.git",
    linkedin: "",
    x: ""
  },
  ogImage: "/og/command-lattice.svg"
} as const;

export type SiteConfig = typeof siteConfig;
