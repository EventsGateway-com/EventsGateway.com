import type { EventGatewayEvent } from "../../schemas/src/index";

export type ManagedDestinationKind =
  | "facebook-pixel"
  | "google-analytics-4"
  | "google-ads"
  | "tiktok"
  | "segment"
  | "ziprecruiter"
  | "upward"
  | "tatari"
  | "taboola"
  | "snapchat";

type ManagedDestinationConfig = {
  kind?: ManagedDestinationKind | "meta" | "ga4" | "google_ads";
  pixel_id?: string;
  property?: string;
  access_token?: string;
  test_event_code?: string;
  measurement_id?: string;
  api_secret?: string;
  conversion_id?: string;
  conversion_label?: string;
  ga_account?: string;
  pixel_code?: string;
  write_key?: string;
  hostname?: string;
  key?: string;
  id?: string;
  pid?: string;
  tid?: string;
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

function aliasDestinationKind(input?: string): ManagedDestinationKind | undefined {
  switch (input) {
    case "meta":
      return "facebook-pixel";
    case "ga4":
      return "google-analytics-4";
    case "google_ads":
      return "google-ads";
    case "facebook-pixel":
    case "google-analytics-4":
    case "google-ads":
    case "tiktok":
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

function buildRequests(input: DispatchInput, kind: ManagedDestinationKind, config: ManagedDestinationConfig): DestinationRequest[] {
  switch (kind) {
    case "facebook-pixel":
      return [createFacebookPixelRequest(input.event, config)];
    case "google-analytics-4":
      return [createGa4Request(input.event, config)];
    case "google-ads":
      return [createGoogleAdsRequest(input.event, config)];
    case "tiktok":
      return [createTikTokRequest(input.event, config)];
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
