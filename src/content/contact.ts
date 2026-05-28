export const contactContent = {
  title: "Contact",
  intro:
    "Tell us what you want to route, which destinations matter, and how your team plans to deploy EventsGateway.",
  responseTime: "Typical response window: within two business days for technical and partnership inquiries.",
  confidentialityNote:
    "Share the context needed for the first conversation, including tracking stack, destinations, and deployment constraints.",
  methods: [
    {
      icon: "mail",
      title: "General inquiry",
      text: "Project questions, open source usage, and implementation planning for EventsGateway.",
      actionLabel: "Contact by email",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20inquiry"
    },
    {
      icon: "spark",
      title: "Architecture discussion",
      text: "Review collection, routing, attribution, and destination strategy for your implementation.",
      actionLabel: "Discuss architecture",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20architecture%20discussion"
    },
    {
      icon: "terminal",
      title: "Technical partnership",
      text: "Explore integrations, self-hosting support, or custom event pipeline delivery needs.",
      actionLabel: "Discuss technical fit",
      href: "mailto:contact@eventsgateway.com?subject=EventsGateway%20technical%20partnership"
    }
  ],
  inquiryTypes: [
    "Meta, GA4, and Google Ads routing",
    "Custom event pipelines",
    "Self-hosted deployment planning",
    "Technical partnership"
  ],
  faq: [
    {
      question: "Is there a live contact form in this version?",
      answer: "No. The public site stays static and routes communication through email."
    },
    {
      question: "Can teams discuss self-hosting?",
      answer: "Yes. Contact covers self-hosting, Cloudflare-first deployment, and infrastructure planning."
    },
    {
      question: "Do you support destination-specific conversations?",
      answer: "Yes. We can discuss Meta, GA4, Google Ads, and custom event pipeline requirements."
    }
  ]
} as const;
