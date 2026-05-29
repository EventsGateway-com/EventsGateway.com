import type { EventGatewayEvent } from "../../schemas/src/index";

export type ManagedDestinationKind =
  | "bing"
  | "branch"
  | "facebook-pixel"
  | "floodlight"
  | "google-analytics"
  | "google-analytics-4"
  | "google-ads"
  | "google-maps-rwg"
  | "hubspot"
  | "ihire"
  | "impact-radius"
  | "indeed"
  | "linkedin"
  | "mixpanel"
  | "outbrain"
  | "pinterest"
  | "podsights"
  | "quora"
  | "reddit"
  | "twitter"
  | "tiktok"
  | "posthog"
  | "counterscale"
  | "segment"
  | "ziprecruiter"
  | "upward"
  | "tatari"
  | "taboola"
  | "snapchat";

type ManagedDestinationConfig = {
  kind?: ManagedDestinationKind | "meta" | "ga4" | "google_ads" | "webhook";
  ti?: string;
  branch_key?: string;
  pixel_id?: string;
  property?: string;
  access_token?: string;
  test_event_code?: string;
  advertiser_id?: string;
  group_tag?: string;
  activity_tag?: string;
  base_domain?: string;
  measurement_id?: string;
  api_secret?: string;
  conversion_id?: string;
  conversion_label?: string;
  ga_account?: string;
  account_id?: string;
  domain_name?: string;
  region_prefix?: string;
  form_id?: string;
  tracking_domain?: string;
  campaign_id?: string;
  partner_id?: string;
  marketer_id?: string;
  pixel_code?: string;
  write_key?: string;
  hostname?: string;
  key?: string;
  id?: string;
  pid?: string;
  tid?: string;
  token?: string;
  api_key?: string;
  api_url?: string;
  site_id?: string;
  method?: string;
  url?: string;
  event_id?: string;
  headers?: Record<string, unknown>;
  ga_audiences?: boolean;
  ga_doubleclick?: boolean;
  is_eu?: boolean;
  domains?: string[];
};

type ManagedDestinationRegistry = Record<string, unknown>;

type DispatchInput = {
  siteId: string;
  destinationId: string;
  event: EventGatewayEvent;
  configSource?: string;
  configOverride?: Record<string, unknown> | null;
};

type DestinationRequest = {
  url: string;
  init?: RequestInit;
  mode: "edge" | "browser" | "hybrid";
};

export type ManagedDispatchResult = {
  ok: boolean;
  status?: number;
  mode: DestinationRequest["mode"];
  endpoint: string;
  error?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

function pickString(config: ManagedDestinationConfig, ...keys: string[]) {
  const record = config as Record<string, unknown>;
  for (const key of keys) {
    const resolved = asString(record[key]);
    if (resolved) return resolved;
  }
  return undefined;
}

function pickBoolean(config: ManagedDestinationConfig, ...keys: string[]) {
  const record = config as Record<string, unknown>;
  for (const key of keys) {
    const resolved = asBoolean(record[key]);
    if (typeof resolved === "boolean") return resolved;
  }
  return undefined;
}

function aliasDestinationKind(input?: string): ManagedDestinationKind | undefined {
  switch (input) {
    case "meta":
      return "facebook-pixel";
    case "ga4":
      return "google-analytics-4";
    case "google_ads":
      return "google-ads";
    case "webhook":
      return "webhook";
    case "bing":
    case "branch":
    case "facebook-pixel":
    case "floodlight":
    case "google-analytics":
    case "google-analytics-4":
    case "google-ads":
    case "google-maps-rwg":
    case "hubspot":
    case "ihire":
    case "impact-radius":
    case "indeed":
    case "linkedin":
    case "mixpanel":
    case "outbrain":
    case "pinterest":
    case "podsights":
    case "quora":
    case "reddit":
    case "twitter":
    case "tiktok":
    case "posthog":
    case "counterscale":
    case "segment":
    case "ziprecruiter":
    case "upward":
    case "tatari":
    case "taboola":
    case "snapchat":
      return input;
    default:
      return undefined;
  }
}

function normalizeEventName(input: string) {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function titleCaseEventName(input: string) {
  const normalized = normalizeEventName(input);
  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function base64Encode(value: string) {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  throw new Error("Base64 encoding is not available in the current runtime.");
}

function readRegistry(configSource?: string): ManagedDestinationRegistry {
  if (!configSource) return {};

  try {
    const parsed = JSON.parse(configSource) as unknown;
    return asRecord(parsed) ?? {};
  } catch {
    return {};
  }
}

function resolveConfigFromPayload(event: EventGatewayEvent, destinationId: string): ManagedDestinationConfig | null {
  const properties = asRecord(event.properties);
  const integrations = asRecord(properties?.integrations) ?? asRecord((event as unknown as Record<string, unknown>).integrations);
  const direct = integrations ? asRecord(integrations[destinationId]) ?? asRecord(integrations[aliasDestinationKind(destinationId) ?? ""]) : null;
  return direct as ManagedDestinationConfig | null;
}

function resolveRegistryConfig(siteId: string, destinationId: string, registry: ManagedDestinationRegistry): ManagedDestinationConfig | null {
  const rootSites = asRecord(registry.sites);
  const siteConfig =
    (rootSites ? asRecord(rootSites[siteId]) : null) ??
    asRecord(registry[siteId]) ??
    asRecord(registry.default);
  const destinations =
    (siteConfig ? asRecord(siteConfig.destinations) : null) ??
    asRecord(registry.destinations);

  if (!destinations) {
    return null;
  }

  return (
    (asRecord(destinations[destinationId]) as ManagedDestinationConfig | null) ??
    (asRecord(destinations[aliasDestinationKind(destinationId) ?? ""]) as ManagedDestinationConfig | null)
  );
}

function resolveDestinationConfig(input: DispatchInput): { kind: ManagedDestinationKind; config: ManagedDestinationConfig } | null {
  const registry = readRegistry(input.configSource);
  const registryConfig = resolveRegistryConfig(input.siteId, input.destinationId, registry);
  const payloadConfig = resolveConfigFromPayload(input.event, input.destinationId);
  const overrideConfig = (input.configOverride ?? null) as ManagedDestinationConfig | null;
  const merged = {
    ...(registryConfig ?? {}),
    ...(payloadConfig ?? {}),
    ...(overrideConfig ?? {})
  };
  const kind = aliasDestinationKind(
    merged.kind ??
    input.destinationId
  );

  if (!kind) {
    return null;
  }

  return {
    kind,
    config: merged
  };
}

function getClientId(event: EventGatewayEvent) {
  return event.anonymous_id || event.session_id || event.user_id_hash || event.event_id;
}

function getCommonProperties(event: EventGatewayEvent) {
  return {
    page_location: event.page?.url,
    page_path: event.page?.path,
    page_title: event.page?.title,
    page_referrer: event.page?.referrer,
    currency: event.ecommerce?.currency,
    value: event.ecommerce?.value,
    transaction_id: event.ecommerce?.order_id
  };
}

function createFacebookPixelRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const property = config.property || config.pixel_id;
  const accessToken = config.access_token;
  if (!property || !accessToken) {
    throw new Error("facebook-pixel requires property/pixel_id and access_token.");
  }

  const url = `https://graph.facebook.com/v21.0/${property}/events`;
  const payload = {
    data: [
      {
        event_name: titleCaseEventName(event.type),
        event_time: Math.floor((event.timestamp || Date.now()) / 1000),
        event_id: event.event_id,
        action_source: "website",
        event_source_url: event.page?.url,
        user_data: {
          em: event.email_hmac,
          external_id: event.user_id_hash || event.canonical_user_id,
          client_user_agent: event.device?.browser,
          fbc: event.click_ids?.fbc || event.click_ids?.fbclid,
          fbp: event.click_ids?.fbp
        },
        custom_data: {
          currency: event.ecommerce?.currency,
          value: event.ecommerce?.value,
          order_id: event.ecommerce?.order_id,
          property,
          accessToken,
          ...asRecord(event.properties)
        }
      }
    ],
    access_token: accessToken,
    ...(config.test_event_code ? { test_event_code: config.test_event_code } : {})
  };

  return {
    url,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createGa4Request(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const measurementId = config.measurement_id;
  const apiSecret = config.api_secret;
  if (!measurementId || !apiSecret) {
    throw new Error("google-analytics-4 requires measurement_id and api_secret.");
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
  const params = {
    ...getCommonProperties(event),
    engagement_time_msec: 1,
    session_id: event.session_id,
    campaign_source: event.campaign?.source,
    campaign_medium: event.campaign?.medium,
    campaign_name: event.campaign?.campaign,
    ...asRecord(event.properties)
  };
  const payload = {
    client_id: getClientId(event),
    user_id: event.canonical_user_id,
    timestamp_micros: String((event.timestamp || Date.now()) * 1000),
    events: [
      {
        name: normalizeEventName(event.type) || "custom_event",
        params
      }
    ]
  };

  return {
    url,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    },
    mode: "hybrid"
  };
}

function createGoogleAdsRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const conversionId = config.conversion_id;
  if (!conversionId) {
    throw new Error("google-ads requires conversion_id.");
  }

  const params = new URLSearchParams({
    guid: "ON",
    rnd: `${Date.now() + Math.floor(Math.random() * 100000)}`,
    fst: `${Date.now()}`,
    cv: "9",
    sendb: "1",
    num: "1",
    u_java: "false",
    url: event.page?.url || "",
    tiba: event.page?.title || "",
    u_tz: "0",
    u_his: "10",
    u_h: `${event.device?.screen_height ?? 0}`,
    u_w: `${event.device?.screen_width ?? 0}`,
    u_ah: `${event.device?.screen_height ?? 0}`,
    u_aw: `${event.device?.screen_width ?? 0}`,
    ig: "1",
    value: `${event.ecommerce?.value ?? 0}`,
    currency_code: event.ecommerce?.currency ?? "USD",
    label: config.conversion_label ?? "",
    gclid: event.click_ids?.gclid ?? "",
    ...(event.page?.referrer ? { ref: event.page.referrer } : {})
  });

  return {
    url: `https://www.googleadservices.com/pagead/conversion/${conversionId}/?${params.toString()}`,
    init: {
      method: "GET"
    },
    mode: "browser"
  };
}

function createBingRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const tagId = pickString(config, "ti");
  if (!tagId) {
    throw new Error("bing requires ti.");
  }

  const params = new URLSearchParams({
    ti: tagId,
    Ver: "2",
    mid: getClientId(event),
    evt: normalizeEventName(event.type) || "custom",
    ea: titleCaseEventName(event.type),
    ec: asString(asRecord(event.properties)?.category) ?? "engagement",
    el: event.page?.path ?? event.page?.url ?? "",
    ev: `${event.ecommerce?.value ?? 0}`,
    gv: `${event.ecommerce?.value ?? 0}`,
    gc: event.ecommerce?.currency ?? "USD",
    ...(event.page?.url ? { uet_url: event.page.url } : {})
  });

  return {
    url: `https://bat.bing.com/action/0?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createBranchRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const branchKey = pickString(config, "branch_key", "branchKey");
  if (!branchKey) {
    throw new Error("branch requires branch_key.");
  }

  const normalizedEvent = normalizeEventName(event.type);
  const payload = {
    branch_key: branchKey,
    name: titleCaseEventName(event.type),
    custom_data: {
      event_id: event.event_id,
      order_id: event.ecommerce?.order_id,
      value: event.ecommerce?.value,
      currency: event.ecommerce?.currency,
      ...asRecord(event.properties)
    },
    user_data: {
      developer_identity: event.canonical_user_id,
      anonymous_id: event.anonymous_id,
      session_id: event.session_id,
      email: event.email_hmac
    },
    content_items: event.ecommerce?.items ?? []
  };

  const endpoint =
    normalizedEvent === "page_view"
      ? "https://api2.branch.io/v1/pageview"
      : normalizedEvent === "identify"
        ? "https://api2.branch.io/v1/profile"
        : normalizedEvent === "logout"
          ? "https://api2.branch.io/v1/logout"
          : "https://api2.branch.io/v2/event/custom";

  return {
    url: endpoint,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createFloodlightRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const advertiserId = pickString(config, "advertiser_id", "advertiserId");
  const groupTag = pickString(config, "group_tag", "groupTag") ?? asString(asRecord(event.properties)?.groupTag);
  const activityTag = pickString(config, "activity_tag", "activityTag") ?? asString(asRecord(event.properties)?.activityTag);
  if (!advertiserId || !groupTag || !activityTag) {
    throw new Error("floodlight requires advertiser_id, group_tag, and activity_tag.");
  }

  const suffix = new URLSearchParams({
    ord: event.event_id || `${Date.now()}`,
    value: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    ...(event.page?.url ? { u1: event.page.url } : {})
  });

  return {
    url: `https://ad.doubleclick.net/activity;src=${encodeURIComponent(advertiserId)};type=${encodeURIComponent(groupTag)};cat=${encodeURIComponent(activityTag)};ord=${encodeURIComponent(event.event_id || `${Date.now()}`)}?${suffix.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createGoogleAnalyticsRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest[] {
  const trackingId = pickString(config, "tid");
  if (!trackingId) {
    throw new Error("google-analytics requires tid.");
  }

  const normalizedEvent = normalizeEventName(event.type);
  const baseParams = new URLSearchParams({
    v: "1",
    tid: trackingId,
    cid: getClientId(event),
    uid: event.canonical_user_id ?? "",
    dl: event.page?.url ?? "",
    dh: event.page?.url ? new URL(event.page.url).hostname : "",
    dp: event.page?.path ?? "",
    dt: event.page?.title ?? "",
    dr: event.page?.referrer ?? ""
  });

  if (normalizedEvent === "page_view") {
    baseParams.set("t", "pageview");
  } else {
    baseParams.set("t", "event");
    baseParams.set("ec", asString(asRecord(event.properties)?.category) ?? "engagement");
    baseParams.set("ea", titleCaseEventName(event.type));
    baseParams.set("el", event.page?.path ?? event.page?.url ?? "");
    baseParams.set("ev", `${Math.round(event.ecommerce?.value ?? 0)}`);
  }

  const requests: DestinationRequest[] = [
    {
      url: `https://www.google-analytics.com/collect?${baseParams.toString()}`,
      init: { method: "GET" },
      mode: "browser"
    }
  ];

  if (pickBoolean(config, "ga_doubleclick", "gaDoubleclick")) {
    requests.push({
      url: `https://stats.g.doubleclick.net/j/collect?${baseParams.toString()}`,
      init: { method: "GET" },
      mode: "browser"
    });
  }

  if (pickBoolean(config, "ga_audiences", "gaAudiences")) {
    requests.push({
      url: `https://www.google.com/ads/ga-audiences?${baseParams.toString()}`,
      init: { method: "GET" },
      mode: "browser"
    });
  }

  return requests;
}

function createGoogleMapsRwgRequest(config: ManagedDestinationConfig): DestinationRequest {
  const baseDomain = pickString(config, "base_domain", "baseDomain");
  if (!baseDomain) {
    throw new Error("google-maps-rwg requires base_domain.");
  }

  return {
    url: `noop:google-maps-rwg:${baseDomain}`,
    mode: "browser"
  };
}

function normalizeRegionPrefix(value?: string) {
  if (!value) return "";
  const normalized = value.trim();
  if (!normalized) return "";
  return normalized.startsWith("-") ? normalized : `-${normalized}`;
}

function createHubspotRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const accountId = pickString(config, "account_id", "accountId");
  if (!accountId) {
    throw new Error("hubspot requires account_id.");
  }

  const region = normalizeRegionPrefix(pickString(config, "region_prefix", "regionPrefix"));
  const formId = pickString(config, "form_id", "formId");
  const eventId = pickString(config, "event_id", "eventId") ?? normalizeEventName(event.type);

  if (formId) {
    const body = {
      submittedAt: event.timestamp || Date.now(),
      fields: [
        { name: "event_name", value: titleCaseEventName(event.type) },
        { name: "event_id", value: event.event_id },
        { name: "page_url", value: event.page?.url ?? "" },
        { name: "order_id", value: event.ecommerce?.order_id ?? "" },
        { name: "value", value: `${event.ecommerce?.value ?? 0}` }
      ],
      context: {
        pageUri: event.page?.url ?? "",
        pageName: event.page?.title ?? ""
      }
    };

    return {
      url: `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(accountId)}/${encodeURIComponent(formId)}`,
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      },
      mode: "edge"
    };
  }

  const params = new URLSearchParams({
    a: accountId,
    k: eventId,
    n: titleCaseEventName(event.type),
    u: event.page?.url ?? "",
    v: `${event.ecommerce?.value ?? 0}`
  });

  return {
    url: `https://track${region}.hubspot.com/__ptq.gif?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createIHireRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const id = pickString(config, "id");
  if (!id) {
    throw new Error("ihire requires id.");
  }

  const params = new URLSearchParams({
    event: normalizeEventName(event.type),
    value: `${event.ecommerce?.value ?? 0}`,
    order_id: event.ecommerce?.order_id ?? ""
  });

  return {
    url: `https://api.ihire.com/v1/track/apply-${encodeURIComponent(id)}.gif?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createImpactRadiusRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const trackingDomain = pickString(config, "tracking_domain", "td");
  const campaignId = pickString(config, "campaign_id", "id");
  const eventId = pickString(config, "event_id", "eventId") ?? normalizeEventName(event.type);
  if (!trackingDomain || !campaignId) {
    throw new Error("impact-radius requires tracking_domain and campaign_id.");
  }

  const params = new URLSearchParams({
    amount: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    order_id: event.ecommerce?.order_id ?? "",
    customer_id: event.canonical_user_id ?? event.user_id_hash ?? "",
    ...(pickString(config, "account_id", "accountId") ? { account_id: pickString(config, "account_id", "accountId") as string } : {}),
    ...(pickString(config, "iw") ? { iw: pickString(config, "iw") as string } : {})
  });

  return {
    url: `${trackingDomain.replace(/\/$/, "")}/xconv/${encodeURIComponent(eventId)}/${encodeURIComponent(campaignId)}?${params.toString()}`,
    init: { method: "POST" },
    mode: "edge"
  };
}

function createIndeedRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const conversionId = pickString(config, "conversion_id");
  if (!conversionId) {
    throw new Error("indeed requires conversion_id.");
  }

  const params = new URLSearchParams({
    script: "0",
    rand: `${Date.now()}`,
    label: normalizeEventName(event.type),
    value: `${event.ecommerce?.value ?? 0}`
  });

  return {
    url: `https://conv.indeed.com/pagead/conv/${encodeURIComponent(conversionId)}/?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createLinkedInRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const partnerId = pickString(config, "partner_id", "pid");
  if (!partnerId) {
    throw new Error("linkedin requires partner_id.");
  }

  const params = new URLSearchParams({
    fmt: "js",
    v: "2",
    pid: partnerId,
    time: `${Date.now()}`,
    url: event.page?.url ?? "",
    ...(pickString(config, "conversion_id", "conversionId") ? { conversionId: pickString(config, "conversion_id", "conversionId") as string } : {}),
    ...(event.anonymous_id ? { li_fat_id: event.anonymous_id } : {})
  });

  return {
    url: `https://px.ads.linkedin.com/collect/?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createMixpanelRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const token = pickString(config, "token");
  if (!token) {
    throw new Error("mixpanel requires token.");
  }

  const host = pickBoolean(config, "is_eu", "isEU") ? "https://api-eu.mixpanel.com" : "https://api.mixpanel.com";
  const payload = {
    event: titleCaseEventName(event.type),
    properties: {
      token,
      distinct_id: event.canonical_user_id || event.anonymous_id || event.session_id,
      time: Math.floor((event.timestamp || Date.now()) / 1000),
      $current_url: event.page?.url,
      $referrer: event.page?.referrer,
      value: event.ecommerce?.value,
      currency: event.ecommerce?.currency,
      order_id: event.ecommerce?.order_id,
      ...asRecord(event.properties)
    }
  };

  return {
    url: `${host}/track?verbose=1`,
    init: {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: JSON.stringify(payload) }).toString()
    },
    mode: "edge"
  };
}

function createOutbrainRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const marketerId = pickString(config, "marketer_id", "marketerId");
  if (!marketerId) {
    throw new Error("outbrain requires marketer_id.");
  }

  const params = new URLSearchParams({
    marketerId,
    mid: marketerId,
    name: titleCaseEventName(event.type),
    orderId: event.ecommerce?.order_id ?? "",
    orderValue: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    clickId: event.click_ids?.ob_click_id ?? event.click_ids?.gclid ?? ""
  });

  return {
    url: `https://tr.outbrain.com/unifiedPixel?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createPinterestRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const tid = pickString(config, "tid");
  if (!tid) {
    throw new Error("pinterest requires tid.");
  }

  const params = new URLSearchParams({
    tid,
    event: titleCaseEventName(event.type),
    value: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    order_id: event.ecommerce?.order_id ?? "",
    url: event.page?.url ?? ""
  });

  return {
    url: `https://ct.pinterest.com/v3/?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createPodsightsRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const key = pickString(config, "key");
  if (!key) {
    throw new Error("podsights requires key.");
  }

  const payload = {
    key,
    PDST_name: titleCaseEventName(event.type),
    event_id: event.event_id,
    url: event.page?.url,
    referrer: event.page?.referrer,
    order_id: event.ecommerce?.order_id,
    value: event.ecommerce?.value,
    currency: event.ecommerce?.currency,
    ...asRecord(event.properties)
  };

  return {
    url: "https://us-central1-adaptive-growth.cloudfunctions.net/pdst-events-prod-sink",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createQuoraRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const pixelId = pickString(config, "pixel_id", "pixelId");
  if (!pixelId) {
    throw new Error("quora requires pixel_id.");
  }

  const params = new URLSearchParams({
    tag: titleCaseEventName(event.type),
    noscript: "1",
    value: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    ...(event.email_hmac ? { email: event.email_hmac } : {})
  });

  return {
    url: `https://q.quora.com/_/ad/${encodeURIComponent(pixelId)}/pixel?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createRedditRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const id = pickString(config, "id");
  if (!id) {
    throw new Error("reddit requires id.");
  }

  const params = new URLSearchParams({
    id,
    evt: normalizeEventName(event.type),
    value: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    transactionId: event.ecommerce?.order_id ?? "",
    url: event.page?.url ?? ""
  });

  return {
    url: `https://alb.reddit.com/rp.gif?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createTwitterRequests(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest[] {
  const txnId = pickString(config, "pixel_id", "txn_id") ?? event.event_id;
  if (!txnId) {
    throw new Error("twitter requires pixel_id or txn_id.");
  }

  const params = new URLSearchParams({
    txn_id: txnId,
    p_id: "Twitter",
    tw_sale_amount: `${event.ecommerce?.value ?? 0}`,
    tw_order_quantity: `${event.ecommerce?.items?.length ?? 0}`,
    tw_iframe_status: "0",
    ...(event.email_hmac ? { email_address: event.email_hmac } : {})
  });

  return [
    {
      url: `https://analytics.twitter.com/i/adsct?${params.toString()}`,
      init: { method: "GET" },
      mode: "browser"
    },
    {
      url: `https://t.co/i/adsct?${params.toString()}`,
      init: { method: "GET" },
      mode: "browser"
    }
  ];
}

function createTikTokRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const pixelCode = config.pixel_code;
  const accessToken = config.access_token;
  if (!pixelCode || !accessToken) {
    throw new Error("tiktok requires pixel_code and access_token.");
  }

  const payload = {
    event_source: "web",
    event_source_id: pixelCode,
    ...(config.test_event_code ? { test_event_code: config.test_event_code } : {}),
    data: [
      {
        event: titleCaseEventName(event.type),
        event_id: event.event_id,
        timestamp: new Date(event.timestamp || Date.now()).toISOString(),
        context: {
          page: { url: event.page?.url, referrer: event.page?.referrer },
          user: {
            external_id: event.user_id_hash || event.canonical_user_id,
            email: event.email_hmac,
            ttclid: event.click_ids?.ttclid
          }
        },
        properties: {
          currency: event.ecommerce?.currency,
          value: event.ecommerce?.value,
          contents: event.ecommerce?.items,
          ...asRecord(event.properties)
        }
      }
    ]
  };

  return {
    url: "https://business-api.tiktok.com/open_api/v1.3/event/track/",
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Access-Token": accessToken
      },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createSegmentRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const writeKey = config.write_key;
  if (!writeKey) {
    throw new Error("segment requires write_key.");
  }

  const eventType =
    normalizeEventName(event.type) === "page_view"
      ? "page"
      : normalizeEventName(event.type) === "identify"
        ? "identify"
        : "track";
  const payload: Record<string, unknown> = {
    anonymousId: event.anonymous_id,
    userId: event.canonical_user_id,
    context: {
      page: {
        url: event.page?.url,
        title: event.page?.title,
        referrer: event.page?.referrer,
        path: event.page?.path
      },
      locale: event.device?.language,
      campaign: event.campaign,
      userAgent: event.device?.browser
    }
  };

  if (eventType === "page") {
    payload.properties = {
      ...getCommonProperties(event),
      ...asRecord(event.properties)
    };
  } else if (eventType === "identify") {
    payload.traits = {
      canonical_user_id: event.canonical_user_id,
      user_id_hash: event.user_id_hash,
      email_hmac: event.email_hmac,
      ...asRecord(event.properties)
    };
  } else {
    payload.event = titleCaseEventName(event.type);
    payload.properties = {
      ...getCommonProperties(event),
      ...asRecord(event.properties)
    };
  }

  const hostname = config.hostname || "api.segment.io";
  return {
    url: `https://${hostname}/v1/${eventType}`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${base64Encode(`${writeKey}:`)}`
      },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createZipRecruiterRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const key = config.key || config.conversion_label;
  if (!key) {
    throw new Error("ziprecruiter requires key or conversion_label.");
  }

  const params = new URLSearchParams({
    key,
    event: normalizeEventName(event.type),
    value: `${event.ecommerce?.value ?? 0}`,
    order_id: event.ecommerce?.order_id ?? "",
    url: event.page?.url ?? ""
  });
  return {
    url: `https://track.ziprecruiter.com/conversion?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createUpwardRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const tid = config.tid;
  if (!tid) {
    throw new Error("upward requires tid.");
  }

  const params = new URLSearchParams({
    tid,
    amount: `${event.ecommerce?.value ?? 0}`,
    order_id: event.ecommerce?.order_id ?? "",
    currency: event.ecommerce?.currency ?? "USD",
    event: normalizeEventName(event.type),
    url: event.page?.url ?? ""
  });

  return {
    url: `https://www.upward.net/search/u_convert.fsn?${params.toString()}`,
    init: { method: "GET" },
    mode: "edge"
  };
}

function createTatariRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const key = config.key;
  if (!key) {
    throw new Error("tatari requires key.");
  }

  const data = new URLSearchParams({
    version: "1.2.9",
    cookieSupport: "PERSIST",
    token: key,
    sessionId: event.session_id || event.anonymous_id || event.event_id,
    event: titleCaseEventName(event.type),
    $currentUrl: event.page?.url ?? "",
    $referrer: event.page?.referrer ?? "",
    ...(event.canonical_user_id ? { userId: event.canonical_user_id } : {}),
    ...(event.properties ? { arg: JSON.stringify(event.properties) } : {})
  });

  const queryString = new URLSearchParams({
    data: base64Encode(data.toString()),
    date: `${Date.now()}`
  }).toString();

  return {
    url: `https://d1lu3pmaz2ilpx.cloudfront.net/5a28e627?${queryString}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createTaboolaRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const id = config.id;
  if (!id) {
    throw new Error("taboola requires id.");
  }

  const params = new URLSearchParams({
    tim: `${Date.now()}`,
    cv: "20230105-3-RELEASE",
    ref: event.page?.referrer ?? "",
    en: normalizeEventName(event.type) === "page_view" ? "page_view" : normalizeEventName(event.type),
    "item-url": event.page?.url ?? "",
    revenue: `${event.ecommerce?.value ?? 0}`,
    currency: event.ecommerce?.currency ?? "USD",
    orderid: event.ecommerce?.order_id ?? ""
  });

  return {
    url: `https://trc.taboola.com/${id}/log/3/unip?${params.toString()}`,
    init: { method: "GET" },
    mode: "browser"
  };
}

function createSnapchatRequests(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest[] {
  const pid = config.pid;
  if (!pid) {
    throw new Error("snapchat requires pid.");
  }

  const scid = event.anonymous_id || event.session_id || event.event_id;
  const requestBody = new URLSearchParams({
    v: "1.5",
    if: "false",
    ts: `${Date.now()}`,
    rf: event.page?.referrer ?? "",
    pl: event.page?.url ?? "",
    bt: "__LIVE__",
    ev: normalizeEventName(event.type) === "page_view" ? "PAGE_VIEW" : titleCaseEventName(event.type).toUpperCase(),
    m_sl: "2500",
    m_rd: "2200",
    m_pi: "1800",
    m_pl: "1850",
    m_ic: "0",
    pid,
    u_c1: scid
  }).toString();

  return [
    {
      url: `https://tr.snapchat.com/cm/i?pid=${encodeURIComponent(pid)}`,
      init: { method: "GET" },
      mode: "browser"
    },
    {
      url: "https://tr.snapchat.com/p",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: requestBody
      },
      mode: "browser"
    }
  ];
}

function createPosthogRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const apiKey = pickString(config, "api_key", "POSTHOG_API_KEY");
  if (!apiKey) {
    throw new Error("posthog requires api_key.");
  }

  const apiUrl = pickString(config, "api_url", "POSTHOG_URL") ?? "https://us.i.posthog.com";
  const payload = {
    api_key: apiKey,
    event: titleCaseEventName(event.type),
    distinct_id: event.canonical_user_id || event.anonymous_id || event.session_id || event.event_id,
    properties: {
      $current_url: event.page?.url,
      $referrer: event.page?.referrer,
      value: event.ecommerce?.value,
      currency: event.ecommerce?.currency,
      order_id: event.ecommerce?.order_id,
      ...asRecord(event.properties)
    }
  };

  return {
    url: `${apiUrl.replace(/\/$/, "")}/capture/`,
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    },
    mode: "edge"
  };
}

function createCounterscaleRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const siteId = pickString(config, "site_id", "siteId");
  const apiBaseUrl = pickString(config, "api_url", "api_base_url", "apiBaseUrl");
  if (!siteId || !apiBaseUrl) {
    throw new Error("counterscale requires site_id and api_url.");
  }

  const pageUrl = event.page?.url ? new URL(event.page.url) : null;
  const params = new URLSearchParams({
    sid: siteId,
    h: pageUrl?.hostname ?? "",
    p: event.page?.path ?? pageUrl?.pathname ?? "",
    r: event.page?.referrer ?? ""
  });

  return {
    url: `${apiBaseUrl.replace(/\/$/, "")}/collect?${params.toString()}`,
    init: { method: "POST" },
    mode: "edge"
  };
}

function createWebhookRequest(event: EventGatewayEvent, config: ManagedDestinationConfig): DestinationRequest {
  const url = pickString(config, "url");
  if (!url) {
    throw new Error("webhook requires url.");
  }

  const method = (pickString(config, "method") ?? "POST").toUpperCase();
  const headers = {
    "content-type": "application/json",
    ...(asRecord((config as Record<string, unknown>).headers) ?? {})
  };

  if (method === "GET") {
    const params = new URLSearchParams({
      event: normalizeEventName(event.type),
      event_id: event.event_id,
      value: `${event.ecommerce?.value ?? 0}`,
      currency: event.ecommerce?.currency ?? "",
      order_id: event.ecommerce?.order_id ?? ""
    });
    return {
      url: `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`,
      init: { method: "GET" },
      mode: "edge"
    };
  }

  return {
    url,
    init: {
      method,
      headers,
      body: JSON.stringify({
        event_name: titleCaseEventName(event.type),
        event
      })
    },
    mode: "edge"
  };
}

function buildRequests(input: DispatchInput, kind: ManagedDestinationKind, config: ManagedDestinationConfig): DestinationRequest[] {
  switch (kind) {
    case "bing":
      return [createBingRequest(input.event, config)];
    case "branch":
      return [createBranchRequest(input.event, config)];
    case "facebook-pixel":
      return [createFacebookPixelRequest(input.event, config)];
    case "floodlight":
      return [createFloodlightRequest(input.event, config)];
    case "google-analytics":
      return createGoogleAnalyticsRequest(input.event, config);
    case "google-analytics-4":
      return [createGa4Request(input.event, config)];
    case "google-ads":
      return [createGoogleAdsRequest(input.event, config)];
    case "google-maps-rwg":
      return [createGoogleMapsRwgRequest(config)];
    case "hubspot":
      return [createHubspotRequest(input.event, config)];
    case "ihire":
      return [createIHireRequest(input.event, config)];
    case "impact-radius":
      return [createImpactRadiusRequest(input.event, config)];
    case "indeed":
      return [createIndeedRequest(input.event, config)];
    case "linkedin":
      return [createLinkedInRequest(input.event, config)];
    case "mixpanel":
      return [createMixpanelRequest(input.event, config)];
    case "outbrain":
      return [createOutbrainRequest(input.event, config)];
    case "pinterest":
      return [createPinterestRequest(input.event, config)];
    case "podsights":
      return [createPodsightsRequest(input.event, config)];
    case "quora":
      return [createQuoraRequest(input.event, config)];
    case "reddit":
      return [createRedditRequest(input.event, config)];
    case "twitter":
      return createTwitterRequests(input.event, config);
    case "tiktok":
      return [createTikTokRequest(input.event, config)];
    case "posthog":
      return [createPosthogRequest(input.event, config)];
    case "counterscale":
      return [createCounterscaleRequest(input.event, config)];
    case "segment":
      return [createSegmentRequest(input.event, config)];
    case "ziprecruiter":
      return [createZipRecruiterRequest(input.event, config)];
    case "upward":
      return [createUpwardRequest(input.event, config)];
    case "tatari":
      return [createTatariRequest(input.event, config)];
    case "taboola":
      return [createTaboolaRequest(input.event, config)];
    case "snapchat":
      return createSnapchatRequests(input.event, config);
    case "webhook":
      return [createWebhookRequest(input.event, config)];
  }
}

export async function dispatchManagedDestination(input: DispatchInput): Promise<ManagedDispatchResult> {
  const resolved = resolveDestinationConfig(input);
  if (!resolved) {
    return {
      ok: input.destinationId === "forwarder_default",
      endpoint: input.destinationId,
      mode: "edge",
      error: input.destinationId === "forwarder_default" ? undefined : `Unsupported destination: ${input.destinationId}`
    };
  }

  const requests = buildRequests(input, resolved.kind, resolved.config);
  let lastStatus: number | undefined;
  for (const request of requests) {
    if (request.url.startsWith("noop:")) {
      lastStatus = 204;
      continue;
    }
    const response = await fetch(request.url, request.init);
    lastStatus = response.status;
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        endpoint: request.url,
        mode: request.mode,
        error: `Upstream returned HTTP ${response.status} for ${resolved.kind}.`
      };
    }
  }

  const finalRequest = requests[requests.length - 1];
  return {
    ok: true,
    status: lastStatus,
    endpoint: finalRequest.url,
    mode: finalRequest.mode
  };
}
