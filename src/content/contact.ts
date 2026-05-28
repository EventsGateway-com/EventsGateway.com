export const contactContent = {
  title: "Contact",
  intro:
    "Tell us what kind of site you run, which event destinations you need, and how you want to deploy EventsGateway on Cloudflare Workers.",
  responseTime: "Typical response window: within two business days for technical and installation inquiries.",
  confidentialityNote:
    "Share only the technical context needed for the first conversation, such as site stack, expected event volume, and required destinations.",
  methods: [
    {
      icon: "mail",
      title: "Installation help",
      text: "Questions about tracker setup, collector deployment, or installing EventsGateway on your site.",
      actionLabel: "Contact by email",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20installation%20help"
    },
    {
      icon: "spark",
      title: "Cloudflare Workers deployment",
      text: "Discuss edge deployment, routing architecture, and how the platform fits into your Cloudflare setup.",
      actionLabel: "Discuss deployment",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20Cloudflare%20deployment"
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
    "Tracker installation",
    "Cloudflare Workers deployment",
    "Destination routing setup",
    "Technical integration"
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
