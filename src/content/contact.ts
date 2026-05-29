export const contactContent = {
  title: "Contact",
  intro:
    "Tell us what kind of site you run, which destinations you need, and which department should handle the conversation.",
  responseTime: "Typical response window: within two business days for product, commercial, and growth inquiries.",
  confidentialityNote:
    "Share only the business context needed for the first conversation, such as funnel type, expected event volume, main ad platforms, and required destinations.",
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
      label: "Integration",
      detail: "Tracking rollout, destinations, event mapping, and implementation requirements."
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
      actionLabel: "Use contact form",
      href: "#contact-form"
    },
    {
      icon: "spark",
      title: "Signal strategy",
      text: "Discuss Meta signal quality, Event Match Quality (EMQ) posture, conversion modeling, and multi-destination rollout.",
      actionLabel: "Use contact form",
      href: "#contact-form"
    },
    {
      icon: "terminal",
      title: "Technical integration",
      text: "Talk about Meta, GA4, Google Ads, webhooks, and custom event routing requirements.",
      actionLabel: "Use contact form",
      href: "#contact-form"
    }
  ],
  inquiryTypes: [
    "Hosted product onboarding",
    "Signal quality review",
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
      question: "Can EventsGateway improve Meta signal quality?",
      answer: "Yes. EventsGateway is designed to standardize event naming, send stronger identifiers, and keep conversion context cleaner so Meta can receive the strongest possible matching signal from your site data."
    },
    {
      question: "Is the Free plan enough to start?",
      answer: "Yes. The Free plan is designed to let teams register, log in, launch tracking quickly, and route up to 1,000,000 events per month before overage begins."
    },
    {
      question: "Can you route events to multiple destinations from one integration?",
      answer: "Yes. EventsGateway is built to collect once and route to tools such as Meta, GA4, Google Ads, and custom webhooks."
    }
  ]
} as const;
