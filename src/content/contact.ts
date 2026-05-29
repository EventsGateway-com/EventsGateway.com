export const contactContent = {
  title: "Contact",
  intro:
    "Tell us what kind of site you run, which destinations you need, and which department should handle the conversation.",
  responseTime: "Typical response window: within two business days for product, commercial, and technical inquiries.",
  confidentialityNote:
    "Share only the technical context needed for the first conversation, such as site stack, expected event volume, and required destinations.",
  departments: [
    {
      value: "sales",
      label: "Sales",
      detail: "Commercial questions, Enterprise plans, and buying process."
    },
    {
      value: "support",
      label: "Support",
      detail: "Hosted product help, dashboard questions, and account issues."
    },
    {
      value: "technical",
      label: "Technical",
      detail: "Collector, routing, API, and integration requirements."
    },
    {
      value: "partnerships",
      label: "Partnerships",
      detail: "Agencies, resellers, implementation partners, and collaborations."
    }
  ],
  methods: [
    {
      icon: "mail",
      title: "Sales and plans",
      text: "Questions about Free, usage expansion, Enterprise scope, or commercial fit.",
      actionLabel: "Contact sales",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20sales"
    },
    {
      icon: "spark",
      title: "Cloudflare deployment",
      text: "Discuss edge deployment, routing architecture, and how the platform fits into your Cloudflare setup.",
      actionLabel: "Discuss deployment",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20deployment"
    },
    {
      icon: "terminal",
      title: "Technical integration",
      text: "Talk about Meta, GA4, Google Ads, webhooks, and custom event routing requirements.",
      actionLabel: "Discuss technical fit",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20technical%20integration"
    }
  ],
  inquiryTypes: [
    "Hosted product onboarding",
    "Cloudflare Workers deployment",
    "Destination routing setup",
    "Technical integration",
    "Enterprise planning"
  ],
  faq: [
    {
      question: "Can EventsGateway be installed on any site?",
      answer: "Yes. The platform is designed to work with a lightweight tracker or SDK so installation stays simple across many site stacks."
    },
    {
      question: "Is the event gateway built on Cloudflare Workers?",
      answer: "Yes. The collector and routing runtime are designed around Cloudflare Workers for edge deployment."
    },
    {
      question: "Can small sites run EventsGateway for free?",
      answer: "Often, yes. Many small sites can stay within Cloudflare free-tier limits for Workers, Queues, and storage, so the runtime cost can remain at zero until traffic or storage grows."
    },
    {
      question: "Can you route events to multiple destinations from one integration?",
      answer: "Yes. EventsGateway is built to collect once and route to tools such as Meta, GA4, Google Ads, and custom webhooks."
    }
  ]
} as const;
