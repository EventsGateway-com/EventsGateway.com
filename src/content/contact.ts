export const contactContent = {
  title: "Contact",
  intro:
    "Tell us what you run, which destinations you need, and what you want to improve. We will route the message to the right team.",
  responseTime: "Typical response time: within two business days for product, commercial, and integration questions.",
  confidentialityNote:
    "Share only the context needed for the first conversation, such as funnel type, expected event volume, main platforms, and required destinations.",
  departments: [
    {
      value: "sales",
      label: "Sales",
      detail: "Pricing questions, Enterprise plans, and buying process."
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
      title: "Plans and pricing",
      text: "Questions about the Free plan, usage expansion, Enterprise scope, or commercial fit.",
      actionLabel: "Use contact form",
      href: "#contact-form"
    },
    {
      icon: "spark",
      title: "Tracking strategy",
      text: "Discuss event modeling, destination setup, signal quality, and rollout planning.",
      actionLabel: "Use contact form",
      href: "#contact-form"
    },
    {
      icon: "terminal",
      title: "Technical integration",
      text: "Talk about Meta, GA4, Google Ads, TikTok, webhooks, and custom routing requirements.",
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
      question: "Can EVENTS Gateway be installed on any site?",
      answer: "Yes. The platform works with a lightweight tracker or SDK, so installation stays simple across many site stacks."
    },
    {
      question: "Can one setup route events to multiple tools?",
      answer: "Yes. EVENTS Gateway is built to collect once and route the same event stream to tools such as Meta, GA4, Google Ads, TikTok, and custom webhooks."
    },
    {
      question: "Is the Free plan enough to start?",
      answer: "Yes. The Free plan lets teams launch tracking quickly and route up to 1,000,000 events per month before overage begins."
    },
    {
      question: "What helps you answer faster?",
      answer: "Share your site type, main destinations, expected event volume, and the part of tracking that feels unclear or broken."
    }
  ]
} as const;
