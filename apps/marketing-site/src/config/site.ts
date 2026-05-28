export const siteConfig = {
  name: "EventsGateway",
  shortName: "EG",
  domain: "https://example.com",
  description:
    "A Cloudflare Workers-based event gateway that installs easily on any site and routes events to analytics, ads, and custom destinations.",
  email: "contact@example.com",
  tagline: "A Cloudflare Workers event gateway for easy site installation and controlled event routing.",
  footerStatus: "Built on Cloudflare Workers and designed for fast site installation.",
  nav: [
    { label: "Home", href: "/" },
    { label: "Install", href: "/download/" },
    { label: "Contact", href: "/contact/" }
  ],
  cta: {
    primary: { label: "Install", href: "/download/" },
    secondary: { label: "Contact", href: "/contact/" }
  },
  social: {
    github: "",
    linkedin: "",
    x: ""
  },
  ogImage: "/og/command-lattice.svg"
} as const;

export type SiteConfig = typeof siteConfig;
