export const docsPlaybooks = {
  ecommerce: {
    title: "e_g Playbook For Ecommerce",
    description:
      "A canonical ecommerce event model for stores that need to route the same customer journey into Meta, Google Ads, TikTok, GA4, and custom systems.",
    summary:
      "Use a small set of canonical events and keep the payload rich. Ecommerce wins when the gateway sees product IDs, value, currency, quantity, and checkout progression clearly.",
    events: ["PageView", "ViewContent", "Search", "AddToCart", "AddToWishlist", "InitiateCheckout", "AddPaymentInfo", "Purchase"],
    code: `window.e_g("ViewContent", {
  ecommerce: {
    value: 99.99,
    currency: "USD"
  },
  properties: {
    content_ids: ["SKU-123"],
    content_type: "product",
    content_name: "Blue Running Shoe"
  }
});

window.e_g("AddToCart", {
  ecommerce: {
    value: 99.99,
    currency: "USD"
  },
  properties: {
    content_ids: ["SKU-123"],
    content_type: "product",
    quantity: 1
  }
});

window.e_g("Purchase", {
  ecommerce: {
    order_id: "ORDER-1001",
    value: 149.99,
    currency: "USD"
  },
  properties: {
    content_ids: ["SKU-123", "SKU-999"],
    contents: [
      { id: "SKU-123", quantity: 1, item_price: 99.99 },
      { id: "SKU-999", quantity: 1, item_price: 50.0 }
    ],
    num_items: 2,
    content_type: "product"
  }
});`,
    recommendations: [
      "Always send order_id, value, and currency for purchases.",
      "Use content_ids consistently across product view, cart, checkout, and purchase.",
      "Keep item IDs aligned with catalog IDs used downstream."
    ]
  },
  "lead-generation": {
    title: "e_g Playbook For Lead Generation",
    description:
      "A clean event model for forms, contact intents, booked calls, qualified applications, and ad-platform optimization.",
    summary:
      "Lead generation works best when the canonical event layer separates raw form submissions from higher-quality milestones such as booked calls or qualified applications, while every Lead event carries both value and currency for downstream optimization.",
    events: ["PageView", "ViewContent", "Lead", "Contact", "Schedule", "SubmitApplication", "CompleteRegistration"],
    code: `window.e_g("Lead", {
  value: 120,
  currency: "USD",
  properties: {
    form_id: "pricing-demo-form",
    lead_type: "demo_request",
    source_page: "/pricing/"
  }
});

window.e_g("Schedule", {
  properties: {
    appointment_type: "sales_call",
    calendar: "revenue-team"
  }
});

window.e_g("SubmitApplication", {
  properties: {
    application_type: "enterprise_onboarding",
    step: "completed"
  }
});`,
    recommendations: [
      "Always send value and currency on Lead so ad platforms can optimize and report against commercial intent.",
      "Do not collapse every form into one generic lead event if the business values differ.",
      "Use Schedule for booked calls and demos because it is stronger than a simple form submit.",
      "Map qualified milestones into Google Ads conversion actions separately when value differs."
    ]
  },
  saas: {
    title: "e_g Playbook For SaaS",
    description:
      "A canonical event model for trials, registration, pricing intent, demo requests, and paid plan conversion.",
    summary:
      "SaaS tracking should separate acquisition signals from product milestones. EVENTS Gateway lets the marketing site and the product emit a shared canonical event language.",
    events: ["PageView", "ViewContent", "Lead", "CompleteRegistration", "StartTrial", "Subscribe", "Contact"],
    code: `window.e_g("CompleteRegistration", {
  properties: {
    registration_type: "workspace_signup",
    plan_context: "starter"
  }
});

window.e_g("StartTrial", {
  properties: {
    plan_id: "pro-monthly",
    trial_days: 14
  },
  ecommerce: {
    value: 0,
    currency: "USD"
  }
});

window.e_g("Subscribe", {
  properties: {
    plan_id: "pro-monthly",
    billing_period: "monthly"
  },
  ecommerce: {
    value: 49,
    currency: "USD",
    order_id: "SUB-1001"
  }
});`,
    recommendations: [
      "Separate trial start from paid subscription clearly.",
      "Use CompleteRegistration for actual account creation, not just email capture.",
      "Send plan_id and billing_period to make downstream reporting easier."
    ]
  },
  courses: {
    title: "e_g Playbook For Courses And Info Products",
    description:
      "A practical event model for course pages, webinar funnels, lead magnets, checkout flows, and paid enrollment.",
    summary:
      "Course funnels often mix content, lead capture, webinar registration, checkout, and recurring offers. Keep them on one canonical model and route later.",
    events: ["PageView", "ViewContent", "Lead", "CompleteRegistration", "InitiateCheckout", "Purchase", "Download"],
    code: `window.e_g("ViewContent", {
  properties: {
    content_type: "course",
    content_ids: ["course-growth-101"],
    content_name: "Growth 101"
  }
});

window.e_g("CompleteRegistration", {
  properties: {
    registration_type: "webinar_signup",
    webinar_id: "growth-masterclass"
  }
});

window.e_g("Purchase", {
  ecommerce: {
    order_id: "COURSE-5001",
    value: 297,
    currency: "USD"
  },
  properties: {
    content_ids: ["course-growth-101"],
    content_type: "course"
  }
});`,
    recommendations: [
      "Track webinar signups separately from general leads when the funnel value is higher.",
      "Treat course pages as ViewContent, not only PageView.",
      "Use Purchase for the enrollment confirmation, not for checkout start."
    ]
  },
  donations: {
    title: "e_g Playbook For Donations And Nonprofits",
    description:
      "A canonical event model for donation pages, recurring giving, volunteer lead forms, and campaign attribution.",
    summary:
      "Donation funnels should keep donation intent and donation completion distinct. Send clean financial fields so attribution and campaign optimization stay trustworthy.",
    events: ["PageView", "ViewContent", "Lead", "Donate", "Subscribe", "CompleteRegistration"],
    code: `window.e_g("ViewContent", {
  properties: {
    content_type: "campaign",
    campaign_id: "winter-relief"
  }
});

window.e_g("Donate", {
  ecommerce: {
    value: 100,
    currency: "USD",
    order_id: "DON-1001"
  },
  properties: {
    campaign_id: "winter-relief"
  }
});

window.e_g("Subscribe", {
  ecommerce: {
    value: 25,
    currency: "USD",
    order_id: "DON-MONTHLY-1"
  },
  properties: {
    billing_period: "monthly",
    campaign_id: "monthly-giving"
  }
});`,
    recommendations: [
      "Use Donate for one-time giving and Subscribe for recurring giving.",
      "Keep campaign_id consistent across landing page, form, and donation confirmation.",
      "Always send value and currency for donation completion."
    ]
  }
} as const;

export type DocsPlaybookSlug = keyof typeof docsPlaybooks;
