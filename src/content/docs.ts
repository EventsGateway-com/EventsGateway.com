export const docsContent = {
  title: "EventsGateway Documentation",
  eyebrow: "Commercial Documentation",
  intro:
    "Use this documentation to configure EventsGateway on your sites, standardize event naming, improve Meta Event Match Quality (EMQ) inputs, map commercial conversions, and roll out routing cleanly from the hosted product.",
  quickStart: `window.e_g = function (eventName, payload = {}) {
  window.EventsGateway?.track({
    type: eventName,
    properties: payload.properties ?? payload,
    ecommerce: payload.ecommerce,
    page: payload.page
  });
};`,
  pageviewExample: `window.e_g("PageView", {
  properties: {
    page_type: "product"
  }
});`,
  purchaseExample: `window.e_g("Purchase", {
  ecommerce: {
    order_id: "ORD-1001",
    value: 149.99,
    currency: "USD"
  },
  properties: {
    content_ids: ["SKU-1", "SKU-2"],
    contents: [
      { id: "SKU-1", quantity: 1, item_price: 99.99 },
      { id: "SKU-2", quantity: 1, item_price: 50.0 }
    ],
    content_type: "product",
    num_items: 2
  }
});`,
  identifyExample: `window.e_g("Identify", {
  properties: {
    canonical_user_id: "user_12345",
    email: "customer@example.com",
    phone: "+40123456789"
  }
});`,
  notes: [
    "Use one canonical event name in the browser and let EventsGateway route and transform per destination.",
    "Pass value, currency, content IDs, and transaction identifiers whenever they exist.",
    "For Meta advertisers, send the strongest possible identifiers and conversion context so Event Match Quality (EMQ) can stay at the maximum posture supported by your site data.",
    "For Lead events, send both value and currency so downstream ad platforms receive commercial context, not only a generic form completion.",
    "For Google Ads, EventsGateway maps canonical events to conversion actions and remarketing-friendly payloads because Google Ads does not use one single standard event list across all use cases.",
    "For Meta and TikTok, prefer standard events whenever possible because ad platforms optimize and report better on recognized event names."
  ],
  playbooks: [
    {
      slug: "ecommerce",
      title: "Ecommerce",
      text: "Track product views, cart intent, checkout steps, and purchase with catalog-friendly payloads."
    },
    {
      slug: "lead-generation",
      title: "Lead Generation",
      text: "Separate lead submits, contact intent, booked calls, and qualified application milestones."
    },
    {
      slug: "saas",
      title: "SaaS",
      text: "Track signup, trial start, pricing intent, demo requests, and paid subscription milestones."
    },
    {
      slug: "courses",
      title: "Courses",
      text: "Model webinar signups, course views, checkout, enrollment, and downloadable assets cleanly."
    },
    {
      slug: "donations",
      title: "Donations",
      text: "Track one-time donations, recurring giving, campaign IDs, and nonprofit lead flows."
    }
  ],
  billingGuides: [
    {
      slug: "stripe-billing",
      title: "Billing Operations",
      text: "Configure Checkout, Billing Portal, invoice flow, reminders, and suspension behavior for commercial rollout."
    }
  ],
  sections: [
    {
      title: "Playbooks",
      text: "See concrete event modeling patterns for ecommerce, lead generation, SaaS, courses, and donations.",
      href: "/docs/playbooks/",
      action: "Browse playbooks"
    },
    {
      title: "Billing",
      text: "Read the commercial billing guide for subscriptions, invoices, reminders, and account protection flows.",
      href: "/docs/stripe-billing/",
      action: "Open billing guide"
    },
    {
      title: "Compare",
      text: "Review side-by-side evaluations against analytics, CDP, tag-manager, ad-pixel, and privacy tools.",
      href: "/compare/",
      action: "Open compare pages"
    }
  ],
  communityResources: {
    title: "Open source and self-hosted resources live in Community.",
    text: "Use Community for GitHub, self-hosted installation, and the public status board.",
    links: [
      { label: "Open Source", href: "/open-source/" },
      { label: "Install", href: "/install/" },
      { label: "Status", href: "/status/" }
    ]
  },
  eventFields: [
    {
      name: "value",
      description: "Monetary value of the event. Send for purchases, leads with known worth, donations, and subscriptions."
    },
    {
      name: "currency",
      description: "ISO currency code such as USD, EUR, or GBP. Required whenever value is sent."
    },
    {
      name: "content_ids",
      description: "Array of product, SKU, or catalog identifiers used for commerce and remarketing scenarios."
    },
    {
      name: "content_type",
      description: "Usually product or product_group. Helps downstream catalog-based matching."
    },
    {
      name: "search_string",
      description: "Recommended for search events so ad platforms understand the search intent."
    },
    {
      name: "order_id",
      description: "Deduplication and reconciliation key for purchase events."
    }
  ],
  eventCatalog: [
    {
      category: "Core",
      event: "PageView",
      trigger: "Every page load or route change.",
      payload: "page_type, page_category, template_name",
      meta: "PageView",
      google: "Audience seed or base page signal",
      tiktok: "Page view baseline signal"
    },
    {
      category: "Commerce",
      event: "ViewContent",
      trigger: "Product, offer, or key landing page view.",
      payload: "content_ids, content_type, value, currency",
      meta: "ViewContent",
      google: "view_item or remarketing item view",
      tiktok: "ViewContent"
    },
    {
      category: "Commerce",
      event: "Search",
      trigger: "User performs a site search.",
      payload: "search_string, content_ids",
      meta: "Search",
      google: "Search intent audience or site-search conversion",
      tiktok: "Search"
    },
    {
      category: "Commerce",
      event: "AddToCart",
      trigger: "User adds an item to cart.",
      payload: "content_ids, contents, value, currency",
      meta: "AddToCart",
      google: "add_to_cart or remarketing cart signal",
      tiktok: "AddToCart"
    },
    {
      category: "Commerce",
      event: "AddToWishlist",
      trigger: "User saves or favorites an item.",
      payload: "content_ids, value, currency",
      meta: "AddToWishlist",
      google: "Wishlist audience or soft intent conversion",
      tiktok: "AddToWishlist"
    },
    {
      category: "Commerce",
      event: "InitiateCheckout",
      trigger: "Checkout starts.",
      payload: "value, currency, num_items, content_ids",
      meta: "InitiateCheckout",
      google: "begin_checkout",
      tiktok: "InitiateCheckout"
    },
    {
      category: "Commerce",
      event: "AddPaymentInfo",
      trigger: "Payment details are entered or chosen.",
      payload: "value, currency, payment_type",
      meta: "AddPaymentInfo",
      google: "add_payment_info",
      tiktok: "AddPaymentInfo"
    },
    {
      category: "Commerce",
      event: "Purchase",
      trigger: "Order is confirmed.",
      payload: "order_id, value, currency, content_ids, contents, num_items",
      meta: "Purchase",
      google: "Purchase conversion with transaction value",
      tiktok: "Purchase"
    },
    {
      category: "Lead Gen",
      event: "Lead",
      trigger: "Lead form or request is submitted, always with value and currency.",
      payload: "value, currency, lead_type, form_id",
      meta: "Lead",
      google: "Lead conversion",
      tiktok: "Lead"
    },
    {
      category: "Lead Gen",
      event: "CompleteRegistration",
      trigger: "Account signup or registration completes.",
      payload: "registration_type, method, value, currency",
      meta: "CompleteRegistration",
      google: "Sign_up conversion",
      tiktok: "CompleteRegistration"
    },
    {
      category: "Lead Gen",
      event: "Contact",
      trigger: "Phone, email, chat, or contact action starts.",
      payload: "contact_method, location, team",
      meta: "Contact",
      google: "Contact conversion",
      tiktok: "Contact"
    },
    {
      category: "Lead Gen",
      event: "SubmitApplication",
      trigger: "Job, loan, credit, or onboarding application is submitted.",
      payload: "application_type, step, value, currency",
      meta: "SubmitApplication",
      google: "Qualified lead or application conversion",
      tiktok: "SubmitApplication"
    },
    {
      category: "Lead Gen",
      event: "Schedule",
      trigger: "Call, demo, consultation, or appointment is booked.",
      payload: "appointment_type, team, slot",
      meta: "Schedule",
      google: "Book appointment conversion",
      tiktok: "Schedule"
    },
    {
      category: "Subscription",
      event: "Subscribe",
      trigger: "Paid or recurring subscription starts.",
      payload: "plan_id, value, currency, billing_period",
      meta: "Subscribe",
      google: "Subscribe conversion",
      tiktok: "Subscribe"
    },
    {
      category: "Subscription",
      event: "StartTrial",
      trigger: "Free trial begins.",
      payload: "plan_id, trial_days, value, currency",
      meta: "StartTrial",
      google: "Start trial conversion",
      tiktok: "StartTrial"
    },
    {
      category: "Local",
      event: "FindLocation",
      trigger: "User looks for a store, office, or pickup point.",
      payload: "location_id, city, region",
      meta: "FindLocation",
      google: "Store visit intent or local action signal",
      tiktok: "FindLocation"
    },
    {
      category: "Custom Commerce",
      event: "CustomizeProduct",
      trigger: "User customizes a product before buying.",
      payload: "content_ids, option_set, value, currency",
      meta: "CustomizeProduct",
      google: "Product customization step",
      tiktok: "CustomizeProduct"
    },
    {
      category: "Nonprofit",
      event: "Donate",
      trigger: "Donation completes.",
      payload: "value, currency, campaign_id",
      meta: "Donate",
      google: "Donation conversion",
      tiktok: "Donate"
    },
    {
      category: "Forms",
      event: "SubmitForm",
      trigger: "Non-lead generic form is submitted.",
      payload: "form_id, form_type, status",
      meta: "Custom or Lead depending on use case",
      google: "Form completion conversion",
      tiktok: "SubmitForm"
    },
    {
      category: "Utility",
      event: "Download",
      trigger: "User downloads a file, app asset, or brochure.",
      payload: "asset_id, asset_type, file_name",
      meta: "Custom or CompleteRegistration depending on use case",
      google: "Download conversion",
      tiktok: "Download"
    },
    {
      category: "Utility",
      event: "ApplicationApproval",
      trigger: "Application becomes approved or qualified.",
      payload: "application_type, approved_value, currency",
      meta: "Custom or SubmitApplication follow-up",
      google: "Qualified lead or offline import stage",
      tiktok: "ApplicationApproval"
    }
  ]
} as const;
