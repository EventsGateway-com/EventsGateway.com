import {
  backfillAttribution,
  getCompiledRouting,
  getConsent,
  getDlq,
  getDestination,
  getEvent,
  getHealth,
  getInstallConfig,
  getOverview,
  getQueues,
  getRealtime,
  getRoute,
  getTransformation,
  getJourneys,
  listDeliveries,
  listDestinations,
  listEvents,
  listJobs,
  listRouteVersions,
  listRoutes,
  listSchemas,
  listTransformations,
  listUsers,
  replayDlq,
  replayEvent,
  simulateRoute
} from "../../../packages/platform-data/src/index";
import type { EventGatewayEvent } from "../../../packages/schemas/src/index";
import type { DateRangePreset } from "../../../packages/shared/src/index";

type Envelope<T> = {
  data: T;
  meta: {
    request_id: string;
    duration_ms: number;
  };
};

type ErrorEnvelope = {
  error?: {
    message?: string;
  };
};

export type CaptchaProvider = "turnstile" | "recaptcha" | "hcaptcha";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: "member" | "global_admin";
  status: "active" | "blocked";
  created_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
};

export type DashboardSession = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

export type PasswordResetRequestResult = {
  requested: boolean;
};

export type PasswordResetResult = {
  password_changed_at: string;
};

export type InstallWizardInput = {
  root_domain: string;
  dashboard_domain: string;
  api_domain: string;
  collector_domain: string;
  cloudflare_account_id: string;
  cloudflare_zone_id: string;
  control_plane_database_id: string;
  control_plane_database_name: string;
  cache_kv_namespace_id: string;
  ledger_r2_bucket_name: string;
  events_queue_name: string;
  visitor_state_do_name: string;
  captcha_provider: CaptchaProvider;
  captcha_site_key: string;
  captcha_secret_key: string;
};

export type DashboardBootstrap = {
  user: DashboardUser;
  site: {
    id: string;
    org_id: string;
    org_name: string;
    project_id: string;
    project_name: string;
    name: string;
    environment: string;
    collector_url: string;
    created_at: string;
  };
  domains: Array<{
    id: string;
    site_id: string;
    domain: string;
    kind: string;
    status: string;
    description: string | null;
    created_at: string;
  }>;
};

export type SiteDomainRecord = DashboardBootstrap["domains"][number];
export type SiteKeyRecord = {
  id: string;
  site_id: string;
  label: string;
  public_key: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
};

export type TagManagerTag = {
  id: string;
  name: string;
  template_key: string;
  delivery: "edge" | "browser" | "hybrid";
  trigger_ids: string[];
  variable_ids: string[];
  destination_ids: string[];
  consent_mode: "inherit" | "analytics" | "marketing" | "always";
  status: "active" | "draft" | "paused";
  notes: string;
};

export type TagManagerTrigger = {
  id: string;
  name: string;
  event: string;
  match: string;
  scope: "page" | "session" | "user";
  status: "active" | "draft" | "paused";
};

export type TagManagerVariable = {
  id: string;
  name: string;
  kind: "data_layer" | "cookie" | "query" | "dom" | "context";
  source: string;
  fallback: string;
  scope: "browser" | "edge";
  status: "active" | "draft";
};

export type TagManagerTemplate = {
  key: string;
  name: string;
  category: string;
  description: string;
  default_delivery: "edge" | "browser" | "hybrid";
  default_consent: "inherit" | "analytics" | "marketing" | "always";
  fields: string[];
  status: "ready" | "beta";
};

export type TagManagerScriptRule = {
  id: string;
  name: string;
  script: string;
  placement: "head" | "body-end" | "event-hook";
  strategy: "lazy" | "immediate" | "after-consent";
  consent_category: "inherit" | "analytics" | "marketing" | "functional";
  status: "active" | "blocked" | "draft";
};

export type TagManagerConsentRule = {
  id: string;
  category: "analytics" | "marketing" | "functional";
  default_state: "granted" | "denied" | "inherit";
  enforcement: "block" | "queue" | "annotate";
  scope: string;
};

export type TagManagerVersion = {
  id: string;
  version: number;
  status: "active" | "draft" | "archived";
  summary: string;
  published_by: string;
  published_at: string;
  change_count: number;
};

export type TagManagerData = {
  container_id: string;
  install_mode: "loader" | "npm" | "worker";
  loader_status: "active" | "draft";
  tags: TagManagerTag[];
  triggers: TagManagerTrigger[];
  variables: TagManagerVariable[];
  templates: TagManagerTemplate[];
  script_rules: TagManagerScriptRule[];
  consent_rules: TagManagerConsentRule[];
  versions: TagManagerVersion[];
  publish: {
    draft_version: number;
    active_version: number;
    pending_changes: number;
    last_published_at: string;
    last_published_by: string;
  };
  snippets: {
    loader: string;
    data_layer: string;
  };
};

export type AdminOverview = {
  totals: {
    users: number;
    admins: number;
    blocked_users: number;
    active_sessions: number;
    sites: number;
    domains: number;
    api_keys: number;
    collected_events: number;
  };
  recent_users: DashboardUser[];
  recent_sites: Array<DashboardBootstrap["site"]>;
};

export type AdminUserRecord = DashboardUser & {
  session_count: number;
};

export type AdminSiteRecord = DashboardBootstrap["site"] & {
  domain_count: number;
  api_key_count: number;
  collected_event_count: number;
  last_event_at: string | null;
  domains: SiteDomainRecord[];
  api_keys: SiteKeyRecord[];
};

export type BillingSubscription = {
  id: string;
  site_id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  plan_code: "free" | "growth" | "enterprise";
  status: "active" | "past_due" | "suspended" | "canceled";
  included_events: number;
  overage_block_events: number;
  overage_block_price_usd: number;
  monthly_events_used: number;
  current_period_start: string;
  current_period_end: string;
  grace_period_ends_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingCustomer = {
  id: string;
  site_id: string;
  stripe_customer_id: string | null;
  company_name: string;
  billing_name: string;
  billing_email: string;
  status: "active" | "blocked";
  payment_method_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingInvoice = {
  id: string;
  site_id: string;
  customer_id: string;
  subscription_id: string;
  stripe_invoice_id: string | null;
  invoice_number: string;
  status: "draft" | "open" | "paid" | "void" | "past_due";
  currency: string;
  subtotal_usd: number;
  overage_events: number;
  overage_blocks: number;
  total_usd: number;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
  period_start: string;
  period_end: string;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingTransaction = {
  id: string;
  site_id: string;
  invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount_usd: number;
  status: "pending" | "succeeded" | "failed";
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  created_at: string;
  paid_at: string | null;
};

export type BillingReminder = {
  id: string;
  site_id: string;
  invoice_id: string;
  days_before_due: number;
  scheduled_for: string;
  sent_at: string | null;
  status: "scheduled" | "sent" | "canceled";
  channel: "email";
  created_at: string;
};

export type SiteBillingSummary = {
  customer: BillingCustomer;
  subscription: BillingSubscription;
  invoices: BillingInvoice[];
  transactions: BillingTransaction[];
  reminders: BillingReminder[];
  suspension: {
    is_suspended: boolean;
    reason: string | null;
    grace_period_ends_at: string | null;
  };
};

export type AdminBillingOverview = {
  totals: {
    subscriptions: number;
    active_subscriptions: number;
    past_due_subscriptions: number;
    suspended_subscriptions: number;
    monthly_revenue_usd: number;
    quarterly_revenue_usd: number;
    overdue_amount_usd: number;
    successful_transactions: number;
  };
  monthly_revenue: Array<{ month: string; total_usd: number }>;
  quarterly_revenue: Array<{ quarter: string; total_usd: number }>;
};

type OverviewData = ReturnType<typeof getOverview>;
type RealtimeData = ReturnType<typeof getRealtime>;
type EventListData = ReturnType<typeof listEvents>;
type SchemaListData = ReturnType<typeof listSchemas>;
type RoutesListData = ReturnType<typeof listRoutes>;
type RouteVersionsData = ReturnType<typeof listRouteVersions>;
type CompiledRoutingData = ReturnType<typeof getCompiledRouting>;
type RouteSimulationData = ReturnType<typeof simulateRoute>;
type DeliveriesListData = ReturnType<typeof listDeliveries>;
type EventDetailData = ReturnType<typeof getEvent>;
type HealthData = ReturnType<typeof getHealth>;
type DestinationsListData = ReturnType<typeof listDestinations>;
type TransformationsListData = ReturnType<typeof listTransformations>;
type TransformationDetailData = ReturnType<typeof getTransformation>;
export type TransformationCreateInput = Omit<TransformationDetailData, "id" | "site_id" | "version">;
export type TransformationUpdateInput = Partial<Pick<TransformationDetailData, "name" | "destination_kind" | "status" | "mapping">>;
type UsersListData = ReturnType<typeof listUsers>;
type JourneysData = ReturnType<typeof getJourneys>;
type ConsentData = ReturnType<typeof getConsent>;
type InstallData = ReturnType<typeof getInstallConfig> & {
  site_id: string;
  site_name: string;
  public_key: string;
};
type TagManagerDraftInput = Omit<TagManagerData, "publish" | "versions">;
type QueuesData = ReturnType<typeof getQueues>;
type JobsData = ReturnType<typeof listJobs>;
type DestinationDetailData = ReturnType<typeof getDestination>;
export type DestinationCreateInput = Omit<DestinationDetailData, "id" | "site_id" | "secret_preview">;
export type DestinationUpdateInput = Partial<Pick<DestinationDetailData, "name" | "kind" | "status" | "config">>;
type DlqData = ReturnType<typeof getDlq>;
type RouteDetailData = ReturnType<typeof getRoute>;
export type RouteUpdateInput = Partial<RouteDetailData>;
type ReplayDlqData = ReturnType<typeof replayDlq>;
type ReplayEventData = ReturnType<typeof replayEvent>;
type BackfillAttributionData = ReturnType<typeof backfillAttribution>;

export type RoutesDashboardData = {
  routes: RoutesListData;
  versions: RouteVersionsData;
  compiledConfig: CompiledRoutingData;
  routeSimulation: RouteSimulationData;
};

export type DeliveryRow = {
  eventId: string;
  destination: string;
  status: string;
  latency: string;
  attempts: number;
  route: string;
};

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.PROD ? "https://api.eventsgateway.com" : "")
).replace(/\/$/, "");
const API_TOKEN = (import.meta.env.VITE_API_TOKEN as string | undefined) ?? "";
const CAPTCHA_PROVIDER = ((import.meta.env.VITE_CAPTCHA_PROVIDER as string | undefined)?.trim().toLowerCase() || "turnstile") as CaptchaProvider;
const CAPTCHA_SITE_KEY = (
  (import.meta.env.VITE_CAPTCHA_SITE_KEY as string | undefined) ??
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ??
  ""
).trim();
const SESSION_TOKEN_STORAGE_KEY = "eventsgateway-dashboard-session-token-v2";
const TAG_MANAGER_STORAGE_PREFIX = "eventsgateway-dashboard-tag-manager-v1";

export function readSessionToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY) ?? "";
}

export function writeSessionToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
}

export function readCaptchaSiteKey() {
  return CAPTCHA_SITE_KEY;
}

export function readCaptchaProvider() {
  return CAPTCHA_PROVIDER;
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function getTagManagerStorageKey(siteId: string) {
  return `${TAG_MANAGER_STORAGE_PREFIX}:${siteId}`;
}

function buildDefaultTagManager(siteId: string): TagManagerData {
  const now = new Date().toISOString();
  return {
    container_id: `egtm_${siteId}`,
    install_mode: "loader",
    loader_status: "active",
    tags: [
      {
        id: "tag_meta_purchase",
        name: "Meta Purchase",
        template_key: "meta-conversions",
        delivery: "edge",
        trigger_ids: ["trigger_purchase"],
        variable_ids: ["var_order_id", "var_order_value"],
        destination_ids: ["facebook-pixel"],
        consent_mode: "marketing",
        status: "active",
        notes: "Routes canonical purchase events into Meta via the edge delivery path."
      },
      {
        id: "tag_ga4_page_view",
        name: "GA4 Page View",
        template_key: "ga4",
        delivery: "hybrid",
        trigger_ids: ["trigger_page_view"],
        variable_ids: ["var_page_path", "var_page_title"],
        destination_ids: ["google-analytics-4"],
        consent_mode: "analytics",
        status: "active",
        notes: "Maintains page-level analytics while keeping the canonical event contract stable."
      }
    ],
    triggers: [
      {
        id: "trigger_page_view",
        name: "Page View",
        event: "page_view",
        match: "event.type === 'page_view'",
        scope: "page",
        status: "active"
      },
      {
        id: "trigger_purchase",
        name: "Purchase",
        event: "purchase",
        match: "event.type === 'purchase' && event.order.total > 0",
        scope: "session",
        status: "active"
      }
    ],
    variables: [
      {
        id: "var_page_path",
        name: "page_path",
        kind: "context",
        source: "context.page.path",
        fallback: "/",
        scope: "browser",
        status: "active"
      },
      {
        id: "var_page_title",
        name: "page_title",
        kind: "dom",
        source: "document.title",
        fallback: "Untitled page",
        scope: "browser",
        status: "active"
      },
      {
        id: "var_order_id",
        name: "order_id",
        kind: "data_layer",
        source: "event.order.id",
        fallback: "",
        scope: "edge",
        status: "active"
      },
      {
        id: "var_order_value",
        name: "order_value",
        kind: "data_layer",
        source: "event.order.total",
        fallback: "0",
        scope: "edge",
        status: "active"
      }
    ],
    templates: [
      {
        key: "ga4",
        name: "Google Analytics 4",
        category: "Analytics",
        description: "Managed GA4 tag with canonical event mapping and browser plus edge delivery options.",
        default_delivery: "hybrid",
        default_consent: "analytics",
        fields: ["measurement_id", "event_name", "user_id"],
        status: "ready"
      },
      {
        key: "google-analytics-4",
        name: "Google Analytics 4 Managed",
        category: "Analytics",
        description: "Managed Components inspired GA4 relay with Measurement Protocol mapping and hybrid audience support.",
        default_delivery: "hybrid",
        default_consent: "analytics",
        fields: ["measurement_id", "api_secret", "event_name", "user_id"],
        status: "ready"
      },
      {
        key: "meta-conversions",
        name: "Meta Conversions",
        category: "Ads",
        description: "Managed Meta tag oriented around canonical commerce and lead events.",
        default_delivery: "edge",
        default_consent: "marketing",
        fields: ["pixel_id", "event_name", "value", "currency"],
        status: "ready"
      },
      {
        key: "facebook-pixel",
        name: "Facebook Pixel Managed",
        category: "Ads",
        description: "Managed Components inspired Meta relay with Pixel ID, access token and CAPI-ready payload mapping.",
        default_delivery: "edge",
        default_consent: "marketing",
        fields: ["pixel_id", "access_token", "event_name", "value", "currency"],
        status: "ready"
      },
      {
        key: "google-ads",
        name: "Google Ads Conversion",
        category: "Ads",
        description: "Routes conversion signals to Google Ads without duplicating browser logic.",
        default_delivery: "edge",
        default_consent: "marketing",
        fields: ["conversion_id", "label", "value"],
        status: "ready"
      },
      {
        key: "tiktok",
        name: "TikTok Events API",
        category: "Ads",
        description: "Managed Components inspired TikTok relay with pixel code and access token support.",
        default_delivery: "edge",
        default_consent: "marketing",
        fields: ["pixel_code", "access_token", "event_name", "value", "currency"],
        status: "ready"
      },
      {
        key: "segment",
        name: "Segment HTTP API",
        category: "CDP",
        description: "Managed Components inspired Segment relay with page, track and identify payload support.",
        default_delivery: "edge",
        default_consent: "analytics",
        fields: ["write_key", "hostname", "event_name", "user_id"],
        status: "ready"
      },
      {
        key: "ziprecruiter",
        name: "ZipRecruiter Conversion",
        category: "Ads",
        description: "Managed Components inspired ZipRecruiter conversion beacon for lightweight conversion reporting.",
        default_delivery: "browser",
        default_consent: "marketing",
        fields: ["key", "event_name", "value", "order_id"],
        status: "ready"
      },
      {
        key: "upward",
        name: "Upward Conversion",
        category: "Ads",
        description: "Managed Components inspired Upward conversion relay with tid-based attribution.",
        default_delivery: "edge",
        default_consent: "marketing",
        fields: ["tid", "event_name", "value", "order_id"],
        status: "ready"
      },
      {
        key: "tatari",
        name: "Tatari",
        category: "Attribution",
        description: "Managed Components inspired Tatari beacon using encoded payload delivery.",
        default_delivery: "browser",
        default_consent: "marketing",
        fields: ["key", "event_name", "user_id"],
        status: "ready"
      },
      {
        key: "taboola",
        name: "Taboola",
        category: "Ads",
        description: "Managed Components inspired Taboola event beacon with revenue and order mapping.",
        default_delivery: "browser",
        default_consent: "marketing",
        fields: ["id", "event_name", "value", "currency", "order_id"],
        status: "ready"
      },
      {
        key: "snapchat",
        name: "Snapchat Pixel",
        category: "Ads",
        description: "Managed Components inspired Snapchat dual-request pixel delivery.",
        default_delivery: "browser",
        default_consent: "marketing",
        fields: ["pid", "event_name", "user_id"],
        status: "ready"
      },
      {
        key: "custom-script",
        name: "Custom Script Wrapper",
        category: "Scripts",
        description: "Registers a third-party script inside the governance layer with placement and consent controls.",
        default_delivery: "browser",
        default_consent: "inherit",
        fields: ["script_url", "placement", "strategy"],
        status: "beta"
      }
    ],
    script_rules: [
      {
        id: "script_hotjar",
        name: "Hotjar",
        script: "https://static.hotjar.com/c/hotjar.js",
        placement: "head",
        strategy: "after-consent",
        consent_category: "analytics",
        status: "active"
      },
      {
        id: "script_linkedin",
        name: "LinkedIn Insight",
        script: "https://snap.licdn.com/li.lms-analytics/insight.min.js",
        placement: "body-end",
        strategy: "lazy",
        consent_category: "marketing",
        status: "draft"
      }
    ],
    consent_rules: [
      {
        id: "consent_analytics",
        category: "analytics",
        default_state: "denied",
        enforcement: "queue",
        scope: "Browser analytics tags"
      },
      {
        id: "consent_marketing",
        category: "marketing",
        default_state: "denied",
        enforcement: "block",
        scope: "Ads and remarketing tags"
      },
      {
        id: "consent_functional",
        category: "functional",
        default_state: "granted",
        enforcement: "annotate",
        scope: "Functional helper scripts"
      }
    ],
    versions: [
      {
        id: "tm_version_3",
        version: 3,
        status: "active",
        summary: "Current published tag manager container.",
        published_by: "Marian Vasile",
        published_at: now,
        change_count: 6
      },
      {
        id: "tm_version_4",
        version: 4,
        status: "draft",
        summary: "Draft container with managed templates and consent rules.",
        published_by: "Marian Vasile",
        published_at: now,
        change_count: 14
      }
    ],
    publish: {
      draft_version: 4,
      active_version: 3,
      pending_changes: 14,
      last_published_at: now,
      last_published_by: "Marian Vasile"
    },
    snippets: {
      loader: `<script src="https://e.eventsgateway.com/tag-manager.js" data-container="egtm_${siteId}" async></script>`,
      data_layer: `window.eventsgateway = window.eventsgateway || [];\nwindow.eventsgateway.push({ type: "page_view", page: { path: location.pathname } });`
    }
  };
}

function readTagManagerStore(siteId: string): TagManagerData {
  if (typeof window === "undefined") {
    return buildDefaultTagManager(siteId);
  }

  const storageKey = getTagManagerStorageKey(siteId);
  const existing = window.localStorage.getItem(storageKey);
  if (!existing) {
    const fallback = buildDefaultTagManager(siteId);
    window.localStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const parsed = JSON.parse(existing) as TagManagerData;
    return {
      ...parsed,
      tags: (parsed.tags ?? []).map((tag) => ({
        ...tag,
        destination_ids: Array.isArray(tag.destination_ids) ? tag.destination_ids : []
      }))
    };
  } catch {
    const fallback = buildDefaultTagManager(siteId);
    window.localStorage.setItem(storageKey, JSON.stringify(fallback));
    return fallback;
  }
}

function writeTagManagerStore(siteId: string, value: TagManagerData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getTagManagerStorageKey(siteId), JSON.stringify(value));
}

function computePendingChanges(input: TagManagerDraftInput) {
  return input.tags.length +
    input.triggers.length +
    input.variables.length +
    input.script_rules.length +
    input.consent_rules.length;
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is missing.");
  }

  const url = buildUrl(path);
  const sessionToken = readSessionToken();
  const authorization = sessionToken || API_TOKEN;
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization: `Bearer ${authorization}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorPayload = (await response.json()) as ErrorEnvelope;
      if (errorPayload.error?.message) {
        message = errorPayload.error.message;
      }
    } catch {
      // Keep the HTTP status message when no JSON payload exists.
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as Envelope<T>;
  return payload.data;
}

export function registerDashboardUser(input: { name: string; email: string; password: string; captcha_token: string }) {
  return requestJson<{ user: DashboardUser; session: DashboardSession }>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function loginDashboardUser(input: { email: string; password: string; captcha_token: string }) {
  return requestJson<{ user: DashboardUser; session: DashboardSession }>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function logoutDashboardUser() {
  return requestJson<{ logged_out: boolean }>("/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function requestDashboardPasswordReset(input: { email: string; captcha_token: string }) {
  return requestJson<PasswordResetRequestResult>("/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function resetDashboardPassword(input: { token: string; password: string }) {
  return requestJson<PasswordResetResult>("/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function fetchDashboardBootstrap() {
  return requestJson<DashboardBootstrap>("/v1/bootstrap");
}

export function fetchOverview(siteId: string, range: DateRangePreset): Promise<OverviewData> {
  return requestJson<OverviewData>(`/v1/sites/${siteId}/overview?range=${encodeURIComponent(range)}`);
}

export function fetchRealtime(siteId: string): Promise<RealtimeData> {
  return requestJson<RealtimeData>(`/v1/sites/${siteId}/realtime`);
}

export function fetchEvents(siteId: string): Promise<EventListData> {
  return requestJson<EventListData>(`/v1/sites/${siteId}/events/recent`);
}

export function fetchSchemas(siteId: string): Promise<SchemaListData> {
  return requestJson<SchemaListData>(`/v1/sites/${siteId}/events/schemas`);
}

export function fetchRoutes(siteId: string): Promise<RoutesDashboardData> {
  return requestJson<RoutesListData>(`/v1/sites/${siteId}/routes`).then(async (routes) => {
    const [versions, compiledConfig, events] = await Promise.all([
      requestJson<RouteVersionsData>(`/v1/sites/${siteId}/routes/versions`),
      requestJson<CompiledRoutingData>(`/v1/sites/${siteId}/compiled-routing`),
      fetchEvents(siteId)
    ]);

    const simulationBody = {
      ...(events[0] ?? {
        site_id: siteId,
        type: "Purchase",
        source: "browser",
        environment: "production"
      })
    };

    const routeSimulation = await requestJson<RouteSimulationData>(
      `/v1/sites/${siteId}/routes/all/simulate`,
      {
        method: "POST",
        body: JSON.stringify(simulationBody)
      }
    );

    return {
      routes,
      versions,
      compiledConfig,
      routeSimulation
    };
  });
}

export function fetchRouteDetail(siteId: string, routeId: string): Promise<RouteDetailData> {
  return requestJson<RouteDetailData>(`/v1/sites/${siteId}/routes/${routeId}`);
}

export function updateRouteRecord(siteId: string, routeId: string, input: RouteUpdateInput): Promise<RouteDetailData> {
  return requestJson<RouteDetailData>(`/v1/sites/${siteId}/routes/${routeId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function publishRoutesRecord(siteId: string): Promise<{ version: number; config: CompiledRoutingData }> {
  return requestJson<{ version: number; config: CompiledRoutingData }>(`/v1/sites/${siteId}/routes/publish`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function fetchDeliveries(siteId: string): Promise<DeliveryRow[]> {
  return requestJson<DeliveriesListData>(`/v1/sites/${siteId}/deliveries`).then(async (deliveries) => {
    const routes = await requestJson<RoutesListData>(`/v1/sites/${siteId}/routes`);
    return deliveries.map((delivery) => {
      const destination = getDestination(siteId, delivery.destination_id);
      const route = routes.find((item) => item.id === delivery.route_id);
      return {
        eventId: delivery.event_id,
        destination: destination?.name ?? delivery.destination_id,
        status: delivery.status,
        latency: delivery.latency_ms ? `${delivery.latency_ms}ms` : "Queued",
        attempts: delivery.attempts,
        route: route?.name ?? delivery.route_id
      };
    });
  });
}

export function fetchEvent(siteId: string, eventId: string): Promise<EventDetailData> {
  return requestJson<EventDetailData>(`/v1/sites/${siteId}/events/${eventId}`);
}

export function fetchHealth(siteId: string): Promise<HealthData> {
  return requestJson<HealthData>(`/v1/sites/${siteId}/operations/health`);
}

export function fetchDestinations(siteId: string): Promise<DestinationsListData> {
  return requestJson<DestinationsListData>(`/v1/sites/${siteId}/destinations`);
}

export function createDestinationRecord(siteId: string, input: DestinationCreateInput): Promise<DestinationDetailData> {
  return requestJson<DestinationDetailData>(`/v1/sites/${siteId}/destinations`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateDestinationRecord(siteId: string, destinationId: string, input: DestinationUpdateInput): Promise<DestinationDetailData> {
  return requestJson<DestinationDetailData>(`/v1/sites/${siteId}/destinations/${destinationId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteDestinationRecord(siteId: string, destinationId: string): Promise<{ deleted: true }> {
  return requestJson<{ deleted: true }>(`/v1/sites/${siteId}/destinations/${destinationId}`, {
    method: "DELETE"
  });
}

export function testDestinationRecord(siteId: string, destinationId: string): Promise<{ destination_id: string; ok: boolean; latency_ms: number; message: string }> {
  return requestJson<{ destination_id: string; ok: boolean; latency_ms: number; message: string }>(
    `/v1/sites/${siteId}/destinations/${destinationId}/test`,
    { method: "POST" }
  );
}

export function rotateDestinationSecretRecord(siteId: string, destinationId: string): Promise<DestinationDetailData> {
  return requestJson<DestinationDetailData>(`/v1/sites/${siteId}/destinations/${destinationId}/rotate-secret`, {
    method: "POST"
  });
}

export function fetchTransformations(siteId: string): Promise<TransformationsListData> {
  return requestJson<TransformationsListData>(`/v1/sites/${siteId}/transformations`);
}

export function fetchTransformationDetail(siteId: string, transformationId: string): Promise<TransformationDetailData> {
  return requestJson<TransformationDetailData>(`/v1/sites/${siteId}/transformations/${transformationId}`);
}

export function createTransformationRecord(siteId: string, input: TransformationCreateInput): Promise<TransformationDetailData> {
  return requestJson<TransformationDetailData>(`/v1/sites/${siteId}/transformations`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateTransformationRecord(siteId: string, transformationId: string, input: TransformationUpdateInput): Promise<TransformationDetailData> {
  return requestJson<TransformationDetailData>(`/v1/sites/${siteId}/transformations/${transformationId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function deleteTransformationRecord(siteId: string, transformationId: string): Promise<{ deleted: true }> {
  return requestJson<{ deleted: true }>(`/v1/sites/${siteId}/transformations/${transformationId}`, {
    method: "DELETE"
  });
}

export function fetchUsers(siteId: string): Promise<UsersListData> {
  return requestJson<UsersListData>(`/v1/sites/${siteId}/identity/users`);
}

export function fetchJourneys(siteId: string, canonicalUserId: string): Promise<JourneysData> {
  return requestJson<JourneysData>(`/v1/sites/${siteId}/identity/journeys/${canonicalUserId}`);
}

export function fetchConsent(siteId: string): Promise<ConsentData> {
  return requestJson<ConsentData>(`/v1/sites/${siteId}/identity/consent`);
}

export function fetchInstall(siteId: string): Promise<InstallData> {
  return requestJson<InstallData>(`/v1/sites/${siteId}/settings/install`);
}

export function fetchBilling(siteId: string): Promise<SiteBillingSummary> {
  return requestJson<SiteBillingSummary>(`/v1/sites/${siteId}/billing`);
}

export function fetchBillingInvoices(siteId: string): Promise<BillingInvoice[]> {
  return requestJson<BillingInvoice[]>(`/v1/sites/${siteId}/billing/invoices`);
}

export function createBillingCheckoutSession(siteId: string) {
  return requestJson<{ provider: "stripe"; mode: "setup" | "billing_portal"; url: string; session_id?: string }>(
    `/v1/sites/${siteId}/billing/checkout`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );
}

export function createBillingPortalSession(siteId: string) {
  return requestJson<{ provider: "stripe"; mode: "setup" | "billing_portal"; url: string; session_id?: string }>(
    `/v1/sites/${siteId}/billing/portal`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );
}

export function fetchTagManager(siteId: string): Promise<TagManagerData> {
  return Promise.resolve(readTagManagerStore(siteId));
}

export function saveTagManager(siteId: string, input: TagManagerDraftInput): Promise<TagManagerData> {
  const current = readTagManagerStore(siteId);
  const pendingChanges = computePendingChanges(input);
  const next: TagManagerData = {
    ...input,
    versions: current.versions.map((version) => (
      version.version === current.publish.draft_version
        ? { ...version, change_count: pendingChanges, summary: "Draft container updated from dashboard." }
        : version
    )),
    publish: {
      ...current.publish,
      pending_changes: pendingChanges
    }
  };
  writeTagManagerStore(siteId, next);
  return Promise.resolve(next);
}

export function publishTagManager(siteId: string, input: { draft: TagManagerDraftInput; summary: string }): Promise<TagManagerData> {
  const current = readTagManagerStore(siteId);
  const now = new Date().toISOString();
  const nextActiveVersion = current.publish.draft_version;
  const nextDraftVersion = nextActiveVersion + 1;
  const nextVersions: TagManagerVersion[] = [
    ...current.versions
      .map((version) => {
        if (version.version === nextActiveVersion) {
          return {
            ...version,
            status: "active" as const,
            summary: input.summary || version.summary,
            published_at: now,
            published_by: current.publish.last_published_by
          };
        }

        return version.status === "active"
          ? { ...version, status: "archived" as const }
          : version.version === current.publish.draft_version
            ? { ...version, status: "archived" as const }
            : version;
      })
      .filter((version, index, versions) => versions.findIndex((candidate) => candidate.id === version.id) === index),
    {
      id: createLocalId("tm_version"),
      version: nextDraftVersion,
      status: "draft",
      summary: "Fresh draft created after publish.",
      published_by: current.publish.last_published_by,
      published_at: now,
      change_count: 0
    }
  ];

  const next: TagManagerData = {
    ...input.draft,
    versions: nextVersions,
    publish: {
      draft_version: nextDraftVersion,
      active_version: nextActiveVersion,
      pending_changes: 0,
      last_published_at: now,
      last_published_by: current.publish.last_published_by
    }
  };

  writeTagManagerStore(siteId, next);
  return Promise.resolve(next);
}

export function fetchDomains(siteId: string) {
  return requestJson<SiteDomainRecord[]>(`/v1/sites/${siteId}/settings/domains`);
}

export function createDomain(siteId: string, input: { domain: string; kind?: string; description?: string }) {
  return requestJson<SiteDomainRecord>(`/v1/sites/${siteId}/settings/domains`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function deleteDomain(siteId: string, domainId: string) {
  return requestJson<{ deleted: boolean }>(`/v1/sites/${siteId}/settings/domains/${domainId}`, {
    method: "DELETE"
  });
}

export function fetchApiKeys(siteId: string) {
  return requestJson<SiteKeyRecord[]>(`/v1/sites/${siteId}/settings/api-keys`);
}

export function fetchAdminOverview() {
  return requestJson<AdminOverview>("/v1/admin/overview");
}

export function fetchAdminBillingOverview() {
  return requestJson<AdminBillingOverview>("/v1/admin/billing/overview");
}

export function fetchAdminBillingSubscriptions() {
  return requestJson<Array<BillingSubscription & { company_name: string; billing_email: string }>>("/v1/admin/billing/subscriptions");
}

export function fetchAdminBillingTransactions() {
  return requestJson<Array<BillingTransaction & { invoice_number: string | null; company_name: string; billing_email: string }>>(
    "/v1/admin/billing/transactions"
  );
}

export function updateAdminBillingSubscription(
  subscriptionId: string,
  input: {
    plan_code?: "free" | "growth" | "enterprise";
    status?: "active" | "past_due" | "suspended" | "canceled";
    included_events?: number;
    overage_block_price_usd?: number;
    suspension_reason?: string | null;
  }
) {
  return requestJson<BillingSubscription>(`/v1/admin/billing/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function issueAdminInvoice(input: { site_id: string; amount_usd: number; due_in_days?: number; note?: string }) {
  return requestJson<BillingInvoice>("/v1/admin/billing/invoices", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function fetchAdminUsers() {
  return requestJson<AdminUserRecord[]>("/v1/admin/users");
}

export function updateAdminUserRecord(
  userId: string,
  input: { role?: "member" | "global_admin"; status?: "active" | "blocked" }
) {
  return requestJson<DashboardUser>(`/v1/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function updateAdminUserPassword(userId: string, password: string) {
  return requestJson<{ password_changed_at: string }>(`/v1/admin/users/${userId}/password`, {
    method: "POST",
    body: JSON.stringify({ password })
  });
}

export function deleteAdminUserRecord(userId: string) {
  return requestJson<{ deleted: boolean }>(`/v1/admin/users/${userId}`, {
    method: "DELETE"
  });
}

export function fetchAdminSites() {
  return requestJson<AdminSiteRecord[]>("/v1/admin/sites");
}

export function createAdminSiteRecord(input: {
  name: string;
  domain?: string;
  org_name?: string;
  project_name?: string;
  environment?: string;
}) {
  return requestJson<DashboardBootstrap["site"]>("/v1/admin/sites", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function deleteAdminSiteRecord(siteId: string) {
  return requestJson<{ deleted: boolean }>(`/v1/admin/sites/${siteId}`, {
    method: "DELETE"
  });
}

export function createAdminSiteKeyRecord(siteId: string, input: { label: string }) {
  return requestJson<SiteKeyRecord>(`/v1/admin/sites/${siteId}/keys`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function revokeAdminSiteKeyRecord(siteId: string, keyId: string) {
  return requestJson<SiteKeyRecord>(`/v1/admin/sites/${siteId}/keys/${keyId}`, {
    method: "DELETE"
  });
}

export function fetchQueues(siteId: string): Promise<QueuesData> {
  return requestJson<QueuesData>(`/v1/sites/${siteId}/operations/queues`);
}

export function fetchJobs(siteId: string): Promise<JobsData> {
  return requestJson<JobsData>(`/v1/sites/${siteId}/operations/jobs`);
}

export function fetchDestinationDetail(siteId: string, destinationId: string): Promise<DestinationDetailData> {
  return requestJson<DestinationDetailData>(`/v1/sites/${siteId}/destinations/${destinationId}`);
}

export function fetchDlq(siteId: string): Promise<DlqData> {
  return requestJson<DlqData>(`/v1/sites/${siteId}/operations/dlq`);
}

export function replayDlqAction(siteId: string): Promise<ReplayDlqData> {
  return requestJson<ReplayDlqData>(
    `/v1/sites/${siteId}/operations/dlq/replay`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function replayEventAction(siteId: string, eventId: string): Promise<ReplayEventData | null> {
  return requestJson<ReplayEventData | null>(
    `/v1/sites/${siteId}/operations/replay`,
    { method: "POST", body: JSON.stringify({ event_id: eventId }) }
  );
}

export function flushForwarderAction(siteId: string): Promise<{ processed: number }> {
  return requestJson<{ processed: number }>(
    `/v1/sites/${siteId}/operations/flush-forwarder`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function backfillAttributionAction(siteId: string): Promise<BackfillAttributionData> {
  return requestJson<BackfillAttributionData>(
    `/v1/sites/${siteId}/operations/backfill-attribution`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function exportRawAction(siteId: string): Promise<{ job_id: string; format: string }> {
  return requestJson<{ job_id: string; format: string }>(
    `/v1/sites/${siteId}/operations/export`,
    { method: "POST", body: JSON.stringify({}) }
  );
}
