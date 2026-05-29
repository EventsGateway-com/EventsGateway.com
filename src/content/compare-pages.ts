export const comparePages = {
  "cloudflare-zaraz": {
    title: "EVENTS Gateway vs Cloudflare Zaraz",
    description:
      "Zaraz is useful when the main goal is tag governance. EVENTS Gateway is stronger when the real goal is cleaner conversion data, higher Event Match Quality (EMQ) posture, better targeting inputs, and one event layer that feeds Meta, Google Ads, TikTok, and analytics tools together.",
    winner: "Use EVENTS Gateway when you want stronger ad signal and one event model. Use Zaraz when your main problem is tag orchestration.",
    points: [
      {
        title: "What Zaraz does best",
        text: "Zaraz helps centralize scripts and reduce browser clutter for teams focused mainly on tag governance."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps purchases, leads, and other conversion events clean, consistent, and ready to route across paid-media and analytics channels."
      },
      {
        title: "Best fit",
        text: "Choose Zaraz for tag management. Choose EVENTS Gateway for cleaner ad-platform signal, better EMQ posture, and more control over the revenue event stream."
      }
    ],
    table: [
      ["Primary value", "Tag governance", "Conversion signal quality"],
      ["Meta and TikTok readiness", "Indirect", "Built into the product story"],
      ["Event Match Quality (EMQ) posture", "Secondary benefit", "Core advantage"],
      ["Multi-platform routing", "Limited", "Primary capability"],
      ["Mobile and iOS resilience", "Mixed by tag setup", "Stronger because one event layer stays consistent"],
      ["Best for", "Teams cleaning up scripts", "Teams improving ad signal and targeting"]
    ]
  },
  rudderstack: {
    title: "EVENTS Gateway vs RudderStack",
    description:
      "RudderStack is broader and more CDP-like. EVENTS Gateway is stronger when the paid-media team wants cleaner events, faster launch, clearer cost, and one routing layer focused on better signal for Meta, Google Ads, and TikTok.",
    winner: "Use EVENTS Gateway for faster ad-signal routing. Use RudderStack when warehouse workflows are more important than media performance.",
    points: [
      {
        title: "What RudderStack does best",
        text: "RudderStack is stronger for larger warehouse-centric data programs with wider activation and governance needs."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway gives marketers one cleaner conversion layer without paying for a broader data stack they may not need."
      },
      {
        title: "Best fit",
        text: "Choose RudderStack for larger data pipeline programs. Choose EVENTS Gateway for signal quality, EMQ gains, and lower friction in paid-media measurement."
      }
    ],
    table: [
      ["Primary value", "Broad customer data movement", "Cleaner event routing for ads and analytics"],
      ["Cost clarity", "Usually broader and heavier", "Much easier to explain and forecast"],
      ["Signal quality focus", "Shared with other CDP goals", "Central promise"],
      ["Time to value", "Longer", "Faster"],
      ["Mobile and iOS tracking", "Depends on broader setup", "Positioned as a direct strength"],
      ["Best for", "Warehouse-led teams", "Growth and performance teams"]
    ]
  },
  segment: {
    title: "EVENTS Gateway vs Segment",
    description:
      "Segment is a classic CDP choice. EVENTS Gateway is stronger when the team wants one clean event stream, better purchase and lead quality, stronger Meta matching posture, and a simpler bill than a full CDP commitment.",
    winner: "Use EVENTS Gateway when you want cleaner routing and lower software weight. Use Segment when a full CDP is the real buying goal.",
    points: [
      {
        title: "What Segment does best",
        text: "Segment is good for large integration ecosystems, governance-heavy workflows, and established CDP operating models."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps the promise simpler: cleaner events, cleaner identifiers, better routing, and stronger signal for the ad stack."
      },
      {
        title: "Best fit",
        text: "Choose Segment for a broader CDP program. Choose EVENTS Gateway when you mainly want ad-platform signal quality and clearer commercial value."
      }
    ],
    table: [
      ["Primary value", "CDP breadth", "Signal quality and routing clarity"],
      ["Commercial fit", "Broader than many teams need", "Focused and easier to justify"],
      ["Meta Event Match Quality (EMQ) posture", "Possible but indirect", "Direct positioning advantage"],
      ["Multi-platform routing", "Strong", "Strong and more focused"],
      ["Targeting inputs", "Part of a larger system", "Core benefit"],
      ["Best for", "Large CDP programs", "Marketers who need cleaner conversion data"]
    ]
  },
  posthog: {
    title: "EVENTS Gateway vs PostHog",
    description:
      "PostHog is excellent for product analytics. EVENTS Gateway is stronger when the performance team wants better signal for campaigns, cleaner conversion routing, and one event stream that improves delivery to Meta, Google Ads, TikTok, and analytics tools together.",
    winner: "Use EVENTS Gateway for ad-signal routing. Use PostHog for deep product analytics and user-behavior work.",
    points: [
      {
        title: "What PostHog does best",
        text: "PostHog shines in product analytics, session replay, funnels, and product experimentation."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway is built for clean conversion tracking, routing control, and stronger downstream ad-platform data quality."
      },
      {
        title: "Best fit",
        text: "Choose PostHog for product intelligence. Choose EVENTS Gateway when revenue tracking and ad performance matter more than replay and product UX tooling."
      }
    ],
    table: [
      ["Primary value", "Product analytics depth", "Ad-signal quality and routing"],
      ["Purchase and lead quality", "Secondary", "Primary"],
      ["Meta, Google, TikTok routing", "Secondary", "Core use case"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct benefit"],
      ["Mobile and iOS tracking", "Not the main message", "Explicit value"],
      ["Best for", "Product teams", "Performance teams"]
    ]
  },
  "gtm-server-side": {
    title: "EVENTS Gateway vs GTM Server-Side",
    description:
      "GTM server-side is strong for teams that think in containers and tags. EVENTS Gateway is stronger when marketers want one clear conversion layer, one cleaner signal for ad platforms, and less day-to-day dependence on tag logic.",
    winner: "Use EVENTS Gateway when you want a marketer-friendly event layer. Use GTM server-side when your team is committed to container-centric operations.",
    points: [
      {
        title: "What GTM server-side does best",
        text: "GTM server-side works well for tag-container teams that already manage a mature Google-oriented setup."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway turns the story into business terms: clean events, better routing, better EMQ posture, and fewer tracking regressions."
      },
      {
        title: "Best fit",
        text: "Choose GTM server-side for tag-container workflows. Choose EVENTS Gateway when the business wants cleaner attribution, better targeting inputs, and simpler control."
      }
    ],
    table: [
      ["Primary value", "Container control", "Cleaner ad-platform signal"],
      ["Learning curve", "Higher for non-technical teams", "Lower for performance teams"],
      ["Meta Event Match Quality (EMQ) posture", "Depends on setup quality", "Part of the product promise"],
      ["Multi-platform routing", "Possible through tag logic", "Built in"],
      ["Mobile and iOS resilience", "Depends on implementation discipline", "Designed as a core advantage"],
      ["Best for", "Google-tagging teams", "Advertisers who want cleaner conversions"]
    ]
  },
  jentis: {
    title: "EVENTS Gateway vs JENTIS",
    description:
      "JENTIS is positioned around privacy-heavy enterprise measurement. EVENTS Gateway is stronger when the goal is cleaner ad signal, one event contract across platforms, and a more direct path to better targeting and better attribution.",
    winner: "Use EVENTS Gateway for cleaner paid-media routing. Use JENTIS when privacy governance is the main buying driver.",
    points: [
      {
        title: "What JENTIS does best",
        text: "JENTIS is strong for enterprise buyers who lead with privacy governance and consent-heavy measurement programs."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps the promise closer to revenue: one clean event stream, stronger identifiers, better EMQ posture, and wider paid-media routing."
      },
      {
        title: "Best fit",
        text: "Choose JENTIS for privacy-led programs. Choose EVENTS Gateway when signal quality and campaign performance are the main decision factors."
      }
    ],
    table: [
      ["Primary value", "Privacy governance", "Paid-media signal quality"],
      ["Open flexibility", "Lower", "Higher"],
      ["Event Match Quality (EMQ) posture", "Not the lead message", "Lead advantage"],
      ["Targeting improvement", "Secondary", "Primary"],
      ["Commercial clarity", "Enterprise-heavy", "Simpler"],
      ["Best for", "Privacy-led enterprise teams", "Growth and performance teams"]
    ]
  },
  "stape-gtm-ss": {
    title: "EVENTS Gateway vs Stape + GTM Server-Side",
    description:
      "Stape plus GTM server-side is attractive for teams already committed to GTM server containers. EVENTS Gateway is stronger when the business wants a cleaner event model, less tag complexity, and one direct path to better ad-platform signal quality.",
    winner: "Use EVENTS Gateway for a cleaner measurement product. Use Stape plus GTM server-side if GTM containers are already the chosen operating model.",
    points: [
      {
        title: "What Stape plus GTM server-side does best",
        text: "This path reduces hosting friction for teams already invested in GTM server-side."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps the event model explicit, the routing clearer, and the performance-marketing story much easier to defend commercially."
      },
      {
        title: "Best fit",
        text: "Choose Stape plus GTM server-side for managed GTM operations. Choose EVENTS Gateway for cleaner conversions, stronger matching inputs, and less platform sprawl."
      }
    ],
    table: [
      ["Primary value", "Managed GTM workflow", "Cleaner signal and simpler routing"],
      ["Event model clarity", "Indirect", "Direct"],
      ["Meta and TikTok readiness", "Depends on container quality", "Core use case"],
      ["Commercial simplicity", "Container-first", "Marketer-first"],
      ["Mobile and iOS tracking", "Varies by setup", "Direct product benefit"],
      ["Best for", "Teams already standardized on GTM", "Teams wanting cleaner ad data"]
    ]
  },
  plausible: {
    title: "EVENTS Gateway vs Plausible",
    description:
      "Plausible is excellent for simple website analytics. EVENTS Gateway is stronger when the business needs purchases, leads, and other conversion events to improve Meta, Google Ads, and TikTok performance, not only reporting.",
    winner: "Use EVENTS Gateway for campaign signal and routing. Use Plausible for lightweight traffic reporting.",
    points: [
      {
        title: "What Plausible does best",
        text: "Plausible is simple, clean, and privacy-friendly when the main goal is website reporting."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway turns traffic into usable ad-platform signal by keeping event naming, identifiers, and routing clean."
      },
      {
        title: "Best fit",
        text: "Choose Plausible for traffic analytics. Choose EVENTS Gateway when performance marketing depends on better purchases, leads, and audience signals."
      }
    ],
    table: [
      ["Primary value", "Traffic analytics", "Conversion quality for ads and analytics"],
      ["Meta Event Match Quality (EMQ) posture", "Not a core topic", "Core advantage"],
      ["Paid-media routing", "Limited", "Primary"],
      ["Targeting impact", "Low", "High"],
      ["Mobile and iOS tracking", "Not the focus", "Explicit value"],
      ["Best for", "Simple reporting", "Signal-driven advertisers"]
    ]
  },
  matomo: {
    title: "EVENTS Gateway vs Matomo",
    description:
      "Matomo is strong for analytics ownership and reporting depth. EVENTS Gateway is stronger when clean event delivery to ad platforms matters more than owning the reporting layer.",
    winner: "Use EVENTS Gateway for ad-signal routing. Use Matomo for owned analytics and reporting depth.",
    points: [
      {
        title: "What Matomo does best",
        text: "Matomo is compelling for teams that want owned analytics, privacy control, and mature reporting."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway focuses on what improves campaign performance: cleaner identifiers, better conversion context, and multi-platform delivery."
      },
      {
        title: "Best fit",
        text: "Choose Matomo for analytics ownership. Choose EVENTS Gateway when better attribution and better targeting are more important than building a reporting destination."
      }
    ],
    table: [
      ["Primary value", "Owned analytics", "Paid-media signal quality"],
      ["Reporting depth", "Strong", "Secondary"],
      ["Meta, Google, TikTok routing", "Secondary", "Primary"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Targeting and audience inputs", "Secondary", "Primary"],
      ["Best for", "Reporting-led teams", "Advertisers and growth teams"]
    ]
  },
  "ga4-gtm": {
    title: "EVENTS Gateway vs GA4 + GTM",
    description:
      "GA4 plus GTM is the default stack many teams start with. EVENTS Gateway becomes stronger when the business wants cleaner conversion data, one event model above vendor tags, and better signal for Meta, Google Ads, TikTok, mobile, and iOS traffic.",
    winner: "Use EVENTS Gateway when the default Google stack is no longer enough for paid-media control. Use GA4 plus GTM for basic analytics and tagging.",
    points: [
      {
        title: "What GA4 plus GTM does best",
        text: "The Google stack is familiar and useful for baseline analytics and tag management."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway removes the need to let each platform define its own browser logic by giving the business one clean conversion layer."
      },
      {
        title: "Best fit",
        text: "Choose GA4 plus GTM for a default analytics baseline. Choose EVENTS Gateway when performance marketing needs cleaner signal, cleaner attribution, and broader routing."
      }
    ],
    table: [
      ["Primary value", "Default analytics and tags", "Clean conversion routing across platforms"],
      ["Vendor neutrality", "Google-centered", "Multi-platform by design"],
      ["Meta Event Match Quality (EMQ) posture", "Depends on extra work", "Built into the value story"],
      ["Targeting improvement", "Limited", "Stronger"],
      ["Mobile and iOS resilience", "Varies by tag setup", "Direct advantage"],
      ["Best for", "Baseline measurement", "Growth teams that need better signal"]
    ]
  },
  mixpanel: {
    title: "EVENTS Gateway vs Mixpanel",
    description:
      "Mixpanel is built for product analytics and behavior analysis. EVENTS Gateway is stronger when the team wants to improve campaign signal, route conversions everywhere, and keep purchase and lead data cleaner for paid-media optimization.",
    winner: "Use EVENTS Gateway for cleaner campaign signal. Use Mixpanel for product analytics depth.",
    points: [
      {
        title: "What Mixpanel does best",
        text: "Mixpanel is excellent for funnels, retention, and product-growth reporting."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps the event stream focused on revenue outcomes, cleaner identifiers, and better delivery to ad platforms."
      },
      {
        title: "Best fit",
        text: "Choose Mixpanel when product analytics is the core need. Choose EVENTS Gateway when better attribution and campaign optimization are the bigger opportunity."
      }
    ],
    table: [
      ["Primary value", "Product analytics", "Ad-signal quality and routing"],
      ["Revenue-event focus", "Secondary", "Primary"],
      ["Meta, Google, TikTok delivery", "Secondary", "Core use case"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Targeting inputs", "Limited", "Stronger"],
      ["Best for", "Product teams", "Performance teams"]
    ]
  },
  amplitude: {
    title: "EVENTS Gateway vs Amplitude",
    description:
      "Amplitude is one of the strongest tools for behavioral analytics. EVENTS Gateway is stronger when the paid-media team wants cleaner events, better conversion routing, and stronger audience and optimization data instead of a larger analytics suite.",
    winner: "Use EVENTS Gateway for signal quality and routing. Use Amplitude for analytics depth and experimentation analysis.",
    points: [
      {
        title: "What Amplitude does best",
        text: "Amplitude shines in behavior analysis, cohorts, and product analytics sophistication."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps the commercial promise simpler: cleaner events, better EMQ posture, stronger delivery, and one conversion layer across channels."
      },
      {
        title: "Best fit",
        text: "Choose Amplitude when analytics depth drives the purchase. Choose EVENTS Gateway when better paid-media signal is the main business win."
      }
    ],
    table: [
      ["Primary value", "Behavior analytics", "Clean ad-platform signal"],
      ["Campaign-routing strength", "Secondary", "Primary"],
      ["Meta Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Targeting improvement", "Secondary", "Primary"],
      ["Commercial simplicity", "Heavier", "Lighter"],
      ["Best for", "Analytics-led teams", "Advertisers and growth operators"]
    ]
  },
  heap: {
    title: "EVENTS Gateway vs Heap",
    description:
      "Heap is attractive when automatic product analytics capture is the main requirement. EVENTS Gateway is stronger when the business wants explicit control over purchases, leads, and the data quality that actually reaches ad platforms.",
    winner: "Use EVENTS Gateway for explicit conversion control. Use Heap for product analytics teams that value auto-capture.",
    points: [
      {
        title: "What Heap does best",
        text: "Heap is known for automatic capture and retroactive product analysis."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway gives advertisers deliberate control over event names, identifiers, and routing so campaign systems receive cleaner input."
      },
      {
        title: "Best fit",
        text: "Choose Heap for exploratory product analytics. Choose EVENTS Gateway when signal quality and routing accuracy matter more than auto-capture."
      }
    ],
    table: [
      ["Primary value", "Automatic analytics capture", "Explicit conversion quality control"],
      ["Purchase and lead governance", "Secondary", "Primary"],
      ["Meta, Google, TikTok routing", "Secondary", "Primary"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Targeting inputs", "Limited", "Stronger"],
      ["Best for", "Product analytics teams", "Performance teams"]
    ]
  },
  snowplow: {
    title: "EVENTS Gateway vs Snowplow",
    description:
      "Snowplow is powerful for analytics-engineering and modeled event pipelines. EVENTS Gateway is stronger when the business wants a faster path to cleaner campaign signal, better routing, and clearer value for marketers.",
    winner: "Use EVENTS Gateway for faster signal quality wins. Use Snowplow when analytics engineering depth is the main priority.",
    points: [
      {
        title: "What Snowplow does best",
        text: "Snowplow is excellent for deep event modeling and warehouse-centric programs."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway is easier to position around revenue: cleaner conversions, stronger matching inputs, and multi-platform routing without engineering-heavy overhead."
      },
      {
        title: "Best fit",
        text: "Choose Snowplow for data-engineering depth. Choose EVENTS Gateway when you want cleaner paid-media measurement faster."
      }
    ],
    table: [
      ["Primary value", "Modeled event pipelines", "Cleaner signal for ad platforms"],
      ["Time to business value", "Longer", "Faster"],
      ["Meta Event Match Quality (EMQ) posture", "Possible but indirect", "Direct advantage"],
      ["Targeting and optimization inputs", "Secondary", "Primary"],
      ["Commercial clarity", "Heavier", "Simpler"],
      ["Best for", "Analytics engineering teams", "Growth and performance teams"]
    ]
  },
  "adobe-analytics": {
    title: "EVENTS Gateway vs Adobe Analytics",
    description:
      "Adobe Analytics is built for large enterprise analytics programs. EVENTS Gateway is stronger when the team wants a cleaner and lighter way to improve campaign signal, route events across platforms, and avoid buying a heavyweight analytics suite just to fix ad tracking.",
    winner: "Use EVENTS Gateway for cleaner signal and lighter execution. Use Adobe Analytics for deep enterprise analytics programs.",
    points: [
      {
        title: "What Adobe Analytics does best",
        text: "Adobe Analytics is strong in enterprise reporting, governance, and large ecosystem integration."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway focuses directly on cleaner purchases, leads, audience inputs, and routing for ad and analytics channels."
      },
      {
        title: "Best fit",
        text: "Choose Adobe Analytics for enterprise reporting depth. Choose EVENTS Gateway when the goal is better paid-media measurement without enterprise-suite weight."
      }
    ],
    table: [
      ["Primary value", "Enterprise analytics depth", "Paid-media signal quality and routing"],
      ["Commercial weight", "Heavy", "Lighter"],
      ["Meta, Google, TikTok routing", "Secondary", "Primary"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Targeting improvement", "Secondary", "Primary"],
      ["Best for", "Large enterprise analytics teams", "Growth-focused advertisers"]
    ]
  },
  "simple-analytics": {
    title: "EVENTS Gateway vs Simple Analytics",
    description:
      "Simple Analytics is compelling for lightweight privacy-friendly reporting. EVENTS Gateway is stronger when the business needs one event stream that improves campaign quality, feeds multiple ad platforms, and keeps conversion tracking usable beyond simple analytics.",
    winner: "Use EVENTS Gateway for campaign signal and routing. Use Simple Analytics for lightweight reporting.",
    points: [
      {
        title: "What Simple Analytics does best",
        text: "Simple Analytics keeps reporting minimal, clean, and easy to read."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway turns the same events into better ad-platform data, stronger audience signals, and cleaner optimization inputs."
      },
      {
        title: "Best fit",
        text: "Choose Simple Analytics for privacy-friendly reporting. Choose EVENTS Gateway when the same event stream must improve acquisition performance."
      }
    ],
    table: [
      ["Primary value", "Simple analytics", "Signal quality and routing"],
      ["Paid-media usefulness", "Limited", "High"],
      ["Meta Event Match Quality (EMQ) posture", "Not the focus", "Core benefit"],
      ["Targeting improvement", "Low", "Strong"],
      ["Mobile and iOS tracking", "Not the focus", "Direct value"],
      ["Best for", "Simple reporting needs", "Advertisers and growth teams"]
    ]
  },
  fathom: {
    title: "EVENTS Gateway vs Fathom",
    description:
      "Fathom is known for clean privacy-friendly analytics. EVENTS Gateway is stronger when the business wants the same events to improve Meta, Google Ads, and TikTok performance instead of only generating reporting.",
    winner: "Use EVENTS Gateway for conversion quality and routing. Use Fathom for lightweight analytics.",
    points: [
      {
        title: "What Fathom does best",
        text: "Fathom is excellent for simple site analytics with a clean reporting experience."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway makes those same events more valuable by improving ad-platform delivery, event consistency, and campaign optimization inputs."
      },
      {
        title: "Best fit",
        text: "Choose Fathom for privacy-first reporting. Choose EVENTS Gateway when the same event stream must influence paid-media performance."
      }
    ],
    table: [
      ["Primary value", "Simple analytics", "Ad-signal quality and routing"],
      ["Campaign usefulness", "Secondary", "Primary"],
      ["Meta Event Match Quality (EMQ) posture", "Not the focus", "Direct benefit"],
      ["Targeting improvement", "Low", "Stronger"],
      ["Mobile and iOS tracking", "Not the focus", "Explicit value"],
      ["Best for", "Lightweight reporting", "Advertisers and growth teams"]
    ]
  },
  "piwik-pro": {
    title: "EVENTS Gateway vs Piwik PRO",
    description:
      "Piwik PRO is positioned around privacy governance and owned analytics. EVENTS Gateway is stronger when the business wants a lighter path to cleaner events, better ad-platform matching, and stronger routing across paid-media and analytics channels.",
    winner: "Use EVENTS Gateway for cleaner paid-media signal. Use Piwik PRO when governance-heavy analytics is the main requirement.",
    points: [
      {
        title: "What Piwik PRO does best",
        text: "Piwik PRO is strong for privacy-sensitive organizations that lead with governance and owned reporting."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway focuses more directly on cleaner event quality, better EMQ posture, and better targeting inputs for campaigns."
      },
      {
        title: "Best fit",
        text: "Choose Piwik PRO for governance-heavy analytics. Choose EVENTS Gateway when the business wants cleaner signal and better paid-media outcomes."
      }
    ],
    table: [
      ["Primary value", "Governance and owned analytics", "Signal quality and routing"],
      ["Meta, Google, TikTok usefulness", "Secondary", "Primary"],
      ["Event Match Quality (EMQ) posture", "Indirect", "Direct"],
      ["Commercial simplicity", "Broader", "Lighter"],
      ["Targeting improvement", "Secondary", "Primary"],
      ["Best for", "Governance-led teams", "Growth and performance teams"]
    ]
  },
  "meta-pixel-direct": {
    title: "EVENTS Gateway vs Meta Pixel Direct",
    description:
      "Meta Pixel direct is the quickest way to send events only to Meta. EVENTS Gateway is stronger when the business wants higher Event Match Quality (EMQ) posture, cleaner purchase and lead data, more stable mobile and iOS measurement, and one event stream that also feeds Google Ads, TikTok, and analytics tools.",
    winner: "Use EVENTS Gateway when Meta is part of a broader growth stack. Use Meta Pixel direct only for the smallest Meta-only setup.",
    points: [
      {
        title: "What Meta Pixel direct does best",
        text: "It is fast for very small Meta-only browser tracking when the business does not need anything beyond basic setup."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway gives Meta cleaner identifiers and cleaner conversion context while also making the same events usable for every other platform in the stack."
      },
      {
        title: "Best fit",
        text: "Choose Meta Pixel direct for the most basic setup. Choose EVENTS Gateway when you want better EMQ posture, better targeting signals, and more durable mobile tracking."
      }
    ],
    table: [
      ["Primary value", "Fast Meta-only setup", "Cleaner signal across the whole stack"],
      ["Event Match Quality (EMQ) posture", "Limited by direct setup quality", "Stronger by design"],
      ["Google Ads and TikTok reuse", "No", "Yes"],
      ["Mobile and iOS resilience", "More fragile", "Stronger and more consistent"],
      ["Targeting quality", "Limited to one vendor path", "Broader and cleaner"],
      ["Best for", "Small Meta-only setups", "Advertisers who want stronger revenue signal"]
    ]
  },
  "tiktok-pixel-direct": {
    title: "EVENTS Gateway vs TikTok Pixel Direct",
    description:
      "TikTok Pixel direct is fine when the site only needs TikTok browser tracking. EVENTS Gateway is stronger when TikTok is only one part of the acquisition stack and the business wants cleaner events, better routing, stronger mobile and iOS consistency, and the same event stream shared with Meta, Google Ads, and analytics tools.",
    winner: "Use EVENTS Gateway when TikTok is one channel inside a bigger growth stack. Use TikTok Pixel direct only for the smallest TikTok-only setup.",
    points: [
      {
        title: "What TikTok Pixel direct does best",
        text: "It is simple for straightforward TikTok-only tracking with minimal complexity."
      },
      {
        title: "What EVENTS Gateway does best",
        text: "EVENTS Gateway keeps TikTok events aligned with the rest of the ad stack so purchases, leads, and audience signals stay clean everywhere."
      },
      {
        title: "Best fit",
        text: "Choose TikTok Pixel direct for a narrow TikTok-only use case. Choose EVENTS Gateway when cleaner cross-platform signal drives better campaign performance."
      }
    ],
    table: [
      ["Primary value", "Fast TikTok-only setup", "Clean signal across all paid channels"],
      ["Cross-platform reuse", "No", "Yes"],
      ["Event quality control", "Limited", "High"],
      ["Mobile and iOS resilience", "More fragile", "Stronger and more consistent"],
      ["Targeting inputs", "TikTok-only", "Broader and cleaner"],
      ["Best for", "Small TikTok-only setups", "Advertisers who want one event stream everywhere"]
    ]
  }
} as const;

export type CompareSlug = keyof typeof comparePages;
