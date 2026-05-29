import type { DatabaseBinding, EnvironmentBindings } from "./index";
import type { EventGatewayEvent, EventRoute } from "../../schemas/src/index";
import { dispatchManagedDestination } from "./managed-destinations";
import { compileRoutingConfig, routePlanFromCompiledConfig, simulateRoutes, type CompiledSiteRoutingConfig } from "../../routing-engine/src/index";
import type { VisitorStateSnapshot } from "./visitor-state";
import {
  listDestinations as listSeedDestinations,
  listRouteVersions as listSeedRouteVersions,
  listRoutes as listSeedRoutes,
  listTransformations as listSeedTransformations
} from "../../platform-data/src/index";

type DatabaseRecord = Record<string, unknown>;

export type DashboardUserRole = "member" | "global_admin";
export type DashboardUserStatus = "active" | "blocked";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: DashboardUserRole;
  status: DashboardUserStatus;
  phone: string | null;
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

export type DashboardSite = {
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

export type SiteDomain = {
  id: string;
  site_id: string;
  domain: string;
  kind: string;
  status: string;
  description: string | null;
  created_at: string;
};

export type SiteKey = {
  id: string;
  site_id: string;
  label: string;
  public_key: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
};

export type SiteMemberRole = "admin" | "user";
export type SiteMembershipStatus = "active" | "revoked";
export type SiteInviteStatus = "pending" | "accepted" | "revoked" | "expired";

export type SiteMembershipRecord = {
  id: string;
  site_id: string;
  user_id: string;
  name: string;
  email: string;
  role: SiteMemberRole;
  status: SiteMembershipStatus;
  invited_by_user_id: string | null;
  invited_by_name: string | null;
  created_at: string;
  updated_at: string;
  joined_at: string;
  last_login_at: string | null;
};

export type SiteInviteRecord = {
  id: string;
  site_id: string;
  email: string;
  invited_name: string | null;
  role: SiteMemberRole;
  status: SiteInviteStatus;
  invited_by_user_id: string;
  invited_by_name: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  revoked_at: string | null;
};

export type SiteAccess = {
  site_id: string;
  user_id: string;
  role: SiteMemberRole;
  is_global_admin: boolean;
};

export type SiteMembersPayload = {
  site: DashboardSite;
  current_membership: SiteAccess;
  members: SiteMembershipRecord[];
  invites: SiteInviteRecord[];
};

export type SiteDestinationKind =
  | "bing"
  | "branch"
  | "meta"
  | "ga4"
  | "google_ads"
  | "webhook"
  | "facebook-pixel"
  | "floodlight"
  | "google-analytics"
  | "google-analytics-4"
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
  | "posthog"
  | "quora"
  | "reddit"
  | "twitter"
  | "counterscale"
  | "tiktok"
  | "segment"
  | "ziprecruiter"
  | "upward"
  | "tatari"
  | "taboola"
  | "snapchat";

export type SiteDestinationStatus = "active" | "paused" | "disabled";

export type SiteDestination = {
  id: string;
  site_id: string;
  name: string;
  kind: SiteDestinationKind;
  status: SiteDestinationStatus;
  secret_preview: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SiteTransformationStatus = "active" | "draft";

export type SiteTransformation = {
  id: string;
  site_id: string;
  name: string;
  destination_kind: SiteDestinationKind;
  status: SiteTransformationStatus;
  version: number;
  mapping: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SiteRouteVersion = {
  version: number;
  active: boolean;
  created_at: string;
};

export type BootstrapPayload = {
  user: DashboardUser;
  accessible_sites: Array<{
    id: string;
    org_id: string;
    org_name: string;
    project_id: string;
    project_name: string;
    name: string;
    environment: string;
    collector_url: string;
    created_at: string;
    role: string;
  }>;
  site: DashboardSite;
  domains: SiteDomain[];
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
  recent_sites: DashboardSite[];
};

export type AdminUserRecord = DashboardUser & {
  session_count: number;
};

export type AdminSiteRecord = DashboardSite & {
  domain_count: number;
  api_key_count: number;
  collected_event_count: number;
  last_event_at: string | null;
  domains: SiteDomain[];
  api_keys: SiteKey[];
};

export type DeliveryAttemptRecord = {
  id: string;
  site_id: string;
  event_id: string;
  route_id: string;
  destination_id: string;
  status: "pending" | "healthy" | "retrying" | "failed";
  latency_ms?: number;
  attempts: number;
  last_error?: string;
  queued_at: number;
  sent_at?: number;
};

export type StoredCollectedEvent = {
  accepted: true;
  collected_event_id: string;
  delivery_attempt_ids: string[];
  site_id: string;
  event_id: string;
  received_at: string;
  visitor_state_snapshot?: VisitorStateSnapshot | null;
  ledger_r2_key?: string | null;
};

export type OperationJobRecord = {
  id: string;
  site_id: string;
  type: "replay" | "dlq_replay" | "backfill_attribution" | "export" | "forwarder_flush";
  status: "queued" | "running" | "completed";
  progress: number;
  created_at: number;
  finished_at?: number;
  detail: string;
};

export type OperationsHealthService = {
  service: string;
  status: "healthy" | "pending" | "failed";
  detail: string;
};

const DEFAULT_SITE_ID = "site_alpha";
const DEFAULT_SITE_NAME = "goldring.ro";
const DEFAULT_ORG_ID = "org_open";
const DEFAULT_ORG_NAME = "Open Commerce Lab";
const DEFAULT_PROJECT_ID = "project_gateway";
const DEFAULT_PROJECT_NAME = "Events Core";
const DEFAULT_ENVIRONMENT = "production";
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const SITE_INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_PASSWORD_RESET_BASE_URL = "https://dash.eventsgateway.com/reset-password";
const DEFAULT_DASHBOARD_URL = "https://dash.eventsgateway.com";

let ensurePromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function ensureDb(db?: DatabaseBinding): DatabaseBinding {
  if (!db) {
    throw new Error("Missing D1 database binding.");
  }

  return db;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveDashboardUrl(pathname: string, baseUrl: string) {
  try {
    return new URL(pathname, baseUrl).toString();
  } catch {
    return new URL(pathname, `${DEFAULT_DASHBOARD_URL}/`).toString();
  }
}

type TransactionalEmailTemplate = {
  htmlContent: string;
  textContent: string;
};

function renderTransactionalEmail(input: {
  preheader: string;
  eyebrow: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  note?: string;
  closing?: string;
  signature?: string;
}): TransactionalEmailTemplate {
  const preheader = escapeHtml(input.preheader);
  const eyebrow = escapeHtml(input.eyebrow);
  const heading = escapeHtml(input.heading);
  const greeting = escapeHtml(input.greeting);
  const paragraphs = input.paragraphs.map((paragraph) => `
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">${escapeHtml(paragraph)}</p>`).join("");
  const ctaLabel = input.ctaLabel ? escapeHtml(input.ctaLabel) : "";
  const ctaUrl = input.ctaUrl ? escapeHtml(input.ctaUrl) : "";
  const note = input.note ? escapeHtml(input.note) : "";
  const closing = escapeHtml(input.closing || "Thanks for choosing EVENTS Gateway.");
  const signature = escapeHtml(input.signature || "The EVENTS Gateway team");

  const ctaHtml = input.ctaLabel && input.ctaUrl
    ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;">
                <tr>
                  <td style="border-radius:14px;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);text-align:center;">
                    <a href="${ctaUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;line-height:1;text-decoration:none;color:#ffffff;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>`
    : "";

  const noteHtml = note
    ? `
              <div style="margin-top:24px;padding:16px 18px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;font-size:14px;line-height:1.6;color:#475569;">
                ${note}
              </div>`
    : "";

  return {
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#eef2ff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;">
            <tr>
              <td style="padding-bottom:18px;text-align:center;">
                <div style="display:inline-flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;background:rgba(255,255,255,0.78);border:1px solid rgba(148,163,184,0.18);font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4338ca;">
                  EVENTS Gateway
                </div>
              </td>
            </tr>
            <tr>
              <td style="border-radius:28px;background:#ffffff;box-shadow:0 24px 70px rgba(15,23,42,0.12);overflow:hidden;">
                <div style="padding:40px 40px 32px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#7c3aed 100%);">
                  <div style="margin-bottom:14px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.72);">${eyebrow}</div>
                  <h1 style="margin:0;font-size:32px;line-height:1.2;font-weight:800;color:#ffffff;">${heading}</h1>
                </div>
                <div style="padding:36px 40px 40px;">
                  <p style="margin:0 0 20px;font-size:18px;line-height:1.6;font-weight:600;color:#0f172a;">${greeting}</p>
                  ${paragraphs}
                  ${ctaHtml}
                  ${noteHtml}
                  <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">${closing}</p>
                  <p style="margin:8px 0 0;font-size:15px;line-height:1.7;font-weight:700;color:#0f172a;">${signature}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 10px 0;text-align:center;font-size:12px;line-height:1.7;color:#64748b;">
                Open-source event routing and tracking platform for modern teams.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim(),
    textContent: [
      input.heading,
      "",
      input.greeting,
      "",
      ...input.paragraphs,
      input.ctaLabel && input.ctaUrl ? `${input.ctaLabel}: ${input.ctaUrl}` : "",
      input.note || "",
      input.closing || "Thanks for choosing EVENTS Gateway.",
      input.signature || "The EVENTS Gateway team"
    ]
      .filter(Boolean)
      .join("\n\n")
  };
}

async function sendBrevoEmail(
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL">,
  input: { email: string; name: string; subject: string; template: TransactionalEmailTemplate }
) {
  const apiKey = env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  const senderEmail = env.BREVO_SENDER_EMAIL?.trim() || "no-reply@eventsgateway.com";
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: "EVENTS Gateway"
      },
      to: [{ email: input.email, name: input.name }],
      subject: input.subject,
      htmlContent: input.template.htmlContent,
      textContent: input.template.textContent
    })
  });

  if (!response.ok) {
    throw new Error("Brevo rejected the transactional email request.");
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseStoredPayload(value: unknown): EventGatewayEvent | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return asRecord(parsed) as EventGatewayEvent | null;
  } catch {
    return null;
  }
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "string" || !value) return {};
  try {
    return asRecord(JSON.parse(value)) ?? {};
  } catch {
    return {};
  }
}

function parseJsonArray<T>(value: unknown): T[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function getPathValue(input: unknown, path: string): unknown {
  if (!path) return input;
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, input);
}

function mapTransformationValue(sourceEvent: EventGatewayEvent, value: unknown): unknown {
  if (typeof value === "string" && value.startsWith("$."))
    return getPathValue(sourceEvent as unknown as Record<string, unknown>, value.slice(2));
  return value;
}

function applyTransformationMapping(event: EventGatewayEvent, mapping?: Record<string, unknown>): EventGatewayEvent {
  if (!mapping || !Object.keys(mapping).length) return event;

  const nextEvent: EventGatewayEvent = {
    ...event,
    page: event.page ? { ...event.page } : undefined,
    campaign: event.campaign ? { ...event.campaign } : undefined,
    click_ids: event.click_ids ? { ...event.click_ids } : undefined,
    ecommerce: event.ecommerce ? { ...event.ecommerce, items: event.ecommerce.items ? [...event.ecommerce.items] : undefined } : undefined,
    device: event.device ? { ...event.device } : undefined,
    geo: event.geo ? { ...event.geo } : undefined,
    consent: event.consent ? { ...event.consent } : undefined,
    debug: event.debug ? { ...event.debug } : undefined,
    properties: { ...(event.properties ?? {}) }
  };

  for (const [targetPath, rawValue] of Object.entries(mapping)) {
    const resolvedValue = mapTransformationValue(event, rawValue);
    if (typeof resolvedValue === "undefined") continue;

    const path = targetPath.trim();
    if (!path) continue;

    if (path === "type") {
      nextEvent.type = String(resolvedValue);
      continue;
    }

    if (path === "event_name" || path === "name") {
      nextEvent.type = String(resolvedValue);
      continue;
    }

    if (path === "canonical_user_id") {
      nextEvent.canonical_user_id = String(resolvedValue);
      continue;
    }

    if (path === "value") {
      nextEvent.ecommerce = {
        ...(nextEvent.ecommerce ?? {}),
        value: typeof resolvedValue === "number" ? resolvedValue : Number(resolvedValue)
      };
      continue;
    }

    if (path === "currency") {
      nextEvent.ecommerce = {
        ...(nextEvent.ecommerce ?? {}),
        currency: String(resolvedValue)
      };
      continue;
    }

    if (path === "transaction_id" || path === "order_id") {
      nextEvent.ecommerce = {
        ...(nextEvent.ecommerce ?? {}),
        order_id: String(resolvedValue)
      };
      continue;
    }

    if (path.startsWith("page.")) {
      nextEvent.page = { ...(nextEvent.page ?? {}), [path.slice(5)]: resolvedValue as never };
      continue;
    }

    if (path.startsWith("ecommerce.")) {
      nextEvent.ecommerce = { ...(nextEvent.ecommerce ?? {}), [path.slice(10)]: resolvedValue as never };
      continue;
    }

    if (path.startsWith("campaign.")) {
      nextEvent.campaign = { ...(nextEvent.campaign ?? {}), [path.slice(9)]: resolvedValue as never };
      continue;
    }

    if (path.startsWith("click_ids.")) {
      nextEvent.click_ids = { ...(nextEvent.click_ids ?? {}), [path.slice(10)]: resolvedValue as never };
      continue;
    }

    nextEvent.properties = {
      ...(nextEvent.properties ?? {}),
      [path]: resolvedValue
    };
  }

  return nextEvent;
}

function buildStoredRuntimeEvent(
  siteId: string,
  input: {
    event_id: string;
    type: string;
    source: string;
    environment: string;
    canonical_user_id?: string;
    anonymous_id?: string;
    session_id?: string;
    consent?: { analytics?: boolean; ads?: boolean; functional?: boolean; source?: "default" | "cmp" | "api"; updated_at?: number };
    payload: unknown;
  }
): EventGatewayEvent {
  const payload = asRecord(input.payload) ?? {};
  const timestamp = typeof payload.timestamp === "number" ? payload.timestamp : Date.now();

  return {
    version: "1.0",
    event_id: input.event_id,
    site_id: siteId,
    type: input.type,
    source: input.source as EventGatewayEvent["source"],
    environment: input.environment as EventGatewayEvent["environment"],
    timestamp,
    received_at: typeof payload.received_at === "number" ? payload.received_at : timestamp,
    anonymous_id: input.anonymous_id ?? asNullableString(payload.anonymous_id) ?? undefined,
    session_id: input.session_id ?? asNullableString(payload.session_id) ?? undefined,
    canonical_user_id: input.canonical_user_id ?? asNullableString(payload.canonical_user_id) ?? undefined,
    user_id_hash: asNullableString(payload.user_id_hash) ?? undefined,
    email_hmac: asNullableString(payload.email_hmac) ?? undefined,
    customer_id_hash: asNullableString(payload.customer_id_hash) ?? undefined,
    page: asRecord(payload.page) as EventGatewayEvent["page"],
    campaign: asRecord(payload.campaign) as EventGatewayEvent["campaign"],
    click_ids: asRecord(payload.click_ids) as EventGatewayEvent["click_ids"],
    ecommerce: asRecord(payload.ecommerce) as EventGatewayEvent["ecommerce"],
    device: asRecord(payload.device) as EventGatewayEvent["device"],
    geo: asRecord(payload.geo) as EventGatewayEvent["geo"],
    consent: input.consent ?? (asRecord(payload.consent) as EventGatewayEvent["consent"]),
    properties: asRecord(payload.properties) ?? {},
    routing: asRecord(payload.routing) as EventGatewayEvent["routing"],
    debug: asRecord(payload.debug) as EventGatewayEvent["debug"]
  };
}

function getDeliveryTargets(payload: unknown, fallbackDestination?: string | null) {
  const record = asRecord(payload);
  const routing = asRecord(record?.routing);
  const destinationIds = Array.isArray(routing?.destination_ids)
    ? routing.destination_ids.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const routeIds = Array.isArray(routing?.route_ids)
    ? routing.route_ids.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  if (destinationIds.length) {
    return destinationIds.map((destinationId, index) => ({
      destinationId,
      routeId: routeIds[index] ?? routeIds[0] ?? "route_dynamic"
    }));
  }

  const directDestination = typeof fallbackDestination === "string" && fallbackDestination.trim()
    ? fallbackDestination.trim()
    : undefined;

  return [
    {
      destinationId: directDestination ?? "forwarder_default",
      routeId: "route_ingest"
    }
  ];
}

function toEpochMillis(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toDashboardUserRole(value: unknown): DashboardUserRole {
  return value === "global_admin" ? "global_admin" : "member";
}

function toDashboardUserStatus(value: unknown): DashboardUserStatus {
  return value === "blocked" ? "blocked" : "active";
}

function toSiteMemberRole(value: unknown): SiteMemberRole {
  return value === "admin" ? "admin" : "user";
}

function toSiteMembershipStatus(value: unknown): SiteMembershipStatus {
  return value === "revoked" ? "revoked" : "active";
}

function toSiteInviteStatus(value: unknown): SiteInviteStatus {
  switch (asString(value)) {
    case "accepted":
      return "accepted";
    case "revoked":
      return "revoked";
    case "expired":
      return "expired";
    default:
      return "pending";
  }
}

function toDashboardUser(record: DatabaseRecord): DashboardUser {
  return {
    id: asString(record.id),
    name: asString(record.name),
    email: asString(record.email),
    role: toDashboardUserRole(record.role),
    status: toDashboardUserStatus(record.status),
    phone: asNullableString(record.phone),
    created_at: asString(record.created_at),
    last_login_at: asNullableString(record.last_login_at),
    password_changed_at: asNullableString(record.password_changed_at)
  };
}

function toDashboardSite(record: DatabaseRecord): DashboardSite {
  return {
    id: asString(record.id),
    org_id: asString(record.org_id),
    org_name: asString(record.org_name),
    project_id: asString(record.project_id),
    project_name: asString(record.project_name),
    name: asString(record.name),
    environment: asString(record.environment),
    collector_url: asString(record.collector_url),
    created_at: asString(record.created_at)
  };
}

function toSiteDomain(record: DatabaseRecord): SiteDomain {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    domain: asString(record.domain),
    kind: asString(record.kind),
    status: asString(record.status),
    description: typeof record.description === "string" ? record.description : null,
    created_at: asString(record.created_at)
  };
}

function toSiteKey(record: DatabaseRecord): SiteKey {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    label: asString(record.label),
    public_key: asString(record.public_key),
    status: asString(record.status),
    created_at: asString(record.created_at),
    last_used_at: typeof record.last_used_at === "string" ? record.last_used_at : null
  };
}

function toSiteMembershipRecord(record: DatabaseRecord): SiteMembershipRecord {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    user_id: asString(record.user_id),
    name: asString(record.name),
    email: asString(record.email),
    role: toSiteMemberRole(record.role),
    status: toSiteMembershipStatus(record.status),
    invited_by_user_id: asNullableString(record.invited_by_user_id),
    invited_by_name: asNullableString(record.invited_by_name),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at),
    joined_at: asString(record.joined_at),
    last_login_at: asNullableString(record.last_login_at)
  };
}

function toSiteInviteRecord(record: DatabaseRecord): SiteInviteRecord {
  const expiresAt = asString(record.expires_at);
  const baseStatus = toSiteInviteStatus(record.status);
  const effectiveStatus = baseStatus === "pending" && Date.parse(expiresAt) <= Date.now() ? "expired" : baseStatus;

  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    email: asString(record.email),
    invited_name: asNullableString(record.invited_name),
    role: toSiteMemberRole(record.role),
    status: effectiveStatus,
    invited_by_user_id: asString(record.invited_by_user_id),
    invited_by_name: asNullableString(record.invited_by_name),
    created_at: asString(record.created_at),
    expires_at: expiresAt,
    accepted_at: asNullableString(record.accepted_at),
    accepted_by_user_id: asNullableString(record.accepted_by_user_id),
    revoked_at: asNullableString(record.revoked_at)
  };
}

function toSiteDestinationKind(value: unknown): SiteDestinationKind {
  switch (asString(value)) {
    case "bing":
    case "branch":
    case "meta":
    case "ga4":
    case "google_ads":
    case "webhook":
    case "facebook-pixel":
    case "floodlight":
    case "google-analytics":
    case "google-analytics-4":
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
    case "posthog":
    case "quora":
    case "reddit":
    case "twitter":
    case "counterscale":
    case "tiktok":
    case "segment":
    case "ziprecruiter":
    case "upward":
    case "tatari":
    case "taboola":
    case "snapchat":
      return asString(value) as SiteDestinationKind;
    default:
      return "webhook";
  }
}

function toSiteDestinationStatus(value: unknown): SiteDestinationStatus {
  switch (asString(value)) {
    case "paused":
      return "paused";
    case "disabled":
      return "disabled";
    default:
      return "active";
  }
}

function toSiteDestination(record: DatabaseRecord): SiteDestination {
  let config: Record<string, unknown> = {};
  if (typeof record.config_json === "string" && record.config_json) {
    try {
      config = asRecord(JSON.parse(record.config_json)) ?? {};
    } catch {
      config = {};
    }
  }

  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    name: asString(record.name),
    kind: toSiteDestinationKind(record.kind),
    status: toSiteDestinationStatus(record.status),
    secret_preview: asString(record.secret_preview),
    config,
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at)
  };
}

function toSiteTransformationStatus(value: unknown): SiteTransformationStatus {
  return asString(value) === "active" ? "active" : "draft";
}

function toSiteRoute(record: DatabaseRecord): EventRoute {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    name: asString(record.name),
    description: asNullableString(record.description) ?? undefined,
    enabled: asNumber(record.enabled) !== 0,
    priority: asNumber(record.priority),
    environment: (asString(record.environment) || "all") as EventRoute["environment"],
    match: parseJsonRecord(record.match_json) as EventRoute["match"],
    consent_required: parseJsonRecord(record.consent_required_json) as EventRoute["consent_required"],
    sampling: parseJsonRecord(record.sampling_json) as EventRoute["sampling"],
    destinations: parseJsonArray<EventRoute["destinations"][number]>(record.destinations_json)
  };
}

function toSiteTransformation(record: DatabaseRecord): SiteTransformation {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    name: asString(record.name),
    destination_kind: toSiteDestinationKind(record.destination_kind),
    status: toSiteTransformationStatus(record.status),
    version: asNumber(record.version),
    mapping: parseJsonRecord(record.mapping_json),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at)
  };
}

function toSiteRouteVersion(record: DatabaseRecord): SiteRouteVersion {
  return {
    version: asNumber(record.version),
    active: asNumber(record.active) !== 0,
    created_at: asString(record.created_at)
  };
}

function toCompiledSiteRoutingConfig(record: DatabaseRecord): CompiledSiteRoutingConfig {
  const raw = typeof record.config_json === "string" && record.config_json ? record.config_json : "{}";
  return JSON.parse(raw) as CompiledSiteRoutingConfig;
}

function toDeliveryAttemptRecord(record: DatabaseRecord): DeliveryAttemptRecord {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    event_id: asString(record.event_id),
    route_id: asString(record.route_id),
    destination_id: asString(record.destination_id),
    status: (asString(record.status) || "pending") as DeliveryAttemptRecord["status"],
    latency_ms: record.latency_ms == null ? undefined : asNumber(record.latency_ms),
    attempts: asNumber(record.attempts),
    last_error: asNullableString(record.last_error) ?? undefined,
    queued_at: toEpochMillis(record.queued_at),
    sent_at: record.sent_at == null ? undefined : toEpochMillis(record.sent_at)
  };
}

function toOperationJobRecord(record: DatabaseRecord): OperationJobRecord {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    type: (asString(record.type) || "export") as OperationJobRecord["type"],
    status: (asString(record.status) || "completed") as OperationJobRecord["status"],
    progress: asNumber(record.progress),
    created_at: toEpochMillis(record.created_at),
    finished_at: record.finished_at == null ? undefined : toEpochMillis(record.finished_at),
    detail: asString(record.detail)
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

function toIdSegment(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

export async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function createSessionToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, "")}`;
}

function createPasswordResetToken() {
  return `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
}

function createPublicKey() {
  return `egp_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function firstRecord(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const record = await db.prepare(sql).bind(...params).first<DatabaseRecord>();
  return record ?? null;
}

async function allRecords(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const result = await db.prepare(sql).bind(...params).all<DatabaseRecord>();
  return result.results ?? [];
}

async function countRecords(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const record = await firstRecord(db, sql, ...params);
  return Number(record?.count ?? 0);
}

const COLLECT_ACCESS_CACHE_TTL_SECONDS = 60 * 5;
const COMPILED_ROUTING_CACHE_TTL_SECONDS = 60 * 10;

type CollectAccessAuthorization = {
  site_id: string;
  site_name: string;
  origin_domain: string | null;
  site_key_id: string;
};

function buildCollectAccessCacheKey(siteId: string, keyHash: string, originDomain: string) {
  return `collect-access:${siteId}:${keyHash}:${originDomain || "none"}`;
}

function buildCompiledRoutingCacheKey(siteId: string) {
  return `compiled-routing:${siteId}`;
}

async function readJsonCache<T>(env: Pick<EnvironmentBindings, "CACHE"> | undefined, key: string): Promise<T | null> {
  if (!env?.CACHE) {
    return null;
  }

  try {
    const raw = await env.CACHE.get<string>(key, "text");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonCache(
  env: Pick<EnvironmentBindings, "CACHE"> | undefined,
  key: string,
  value: unknown,
  expirationTtl: number
) {
  if (!env?.CACHE) {
    return;
  }

  try {
    await env.CACHE.put(key, JSON.stringify(value), { expirationTtl });
  } catch {
    return;
  }
}

async function ensureDashboardUsersTableColumns(db: DatabaseBinding) {
  const columns = await allRecords(db, "PRAGMA table_info(dashboard_users)");
  const columnNames = new Set(columns.map((column) => asString(column.name)));
  const migrations: string[] = [];

  if (!columnNames.has("role")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN role TEXT NOT NULL DEFAULT 'member'");
  }
  if (!columnNames.has("status")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
  }
  if (!columnNames.has("last_login_at")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN last_login_at TEXT");
  }
  if (!columnNames.has("password_changed_at")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN password_changed_at TEXT");
  }

  for (const sql of migrations) {
    await db.prepare(sql).run();
  }

  await db.prepare(
    `
      UPDATE dashboard_users
      SET
        role = COALESCE(role, 'member'),
        status = COALESCE(status, 'active'),
        password_changed_at = COALESCE(password_changed_at, created_at)
    `
  ).run();

  const adminCount = await countRecords(
    db,
    "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'"
  );

  if (adminCount === 0) {
    const firstUser = await firstRecord(
      db,
      "SELECT id FROM dashboard_users ORDER BY created_at ASC, email ASC LIMIT 1"
    );
    if (firstUser) {
      await db.prepare("UPDATE dashboard_users SET role = 'global_admin' WHERE id = ?")
        .bind(asString(firstUser.id))
        .run();
    }
  }
}

async function ensureOperationsTables(db: DatabaseBinding) {
  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS delivery_attempts (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        collected_event_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        route_id TEXT NOT NULL,
        destination_id TEXT NOT NULL,
        transform_id TEXT,
        delivery_mode TEXT,
        status TEXT NOT NULL,
        latency_ms INTEGER,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        queued_at TEXT NOT NULL,
        sent_at TEXT,
        updated_at TEXT NOT NULL
      )
    `
  ).run();

  const deliveryColumns = await allRecords(db, "PRAGMA table_info(delivery_attempts)");
  const deliveryColumnNames = new Set(deliveryColumns.map((column) => asString(column.name)));
  if (!deliveryColumnNames.has("transform_id")) {
    await db.prepare("ALTER TABLE delivery_attempts ADD COLUMN transform_id TEXT").run();
  }
  if (!deliveryColumnNames.has("delivery_mode")) {
    await db.prepare("ALTER TABLE delivery_attempts ADD COLUMN delivery_mode TEXT").run();
  }

  const collectedEventColumns = await allRecords(db, "PRAGMA table_info(collected_events)");
  const collectedEventColumnNames = new Set(collectedEventColumns.map((column) => asString(column.name)));
  if (!collectedEventColumnNames.has("ledger_r2_key")) {
    await db.prepare("ALTER TABLE collected_events ADD COLUMN ledger_r2_key TEXT").run();
  }
  if (!collectedEventColumnNames.has("visitor_state_json")) {
    await db.prepare("ALTER TABLE collected_events ADD COLUMN visitor_state_json TEXT").run();
  }

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS operation_jobs (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        detail TEXT NOT NULL,
        created_at TEXT NOT NULL,
        finished_at TEXT
      )
    `
  ).run();

  const missingDeliveries = await allRecords(
    db,
    `
      SELECT ce.id, ce.site_id, ce.event_id, ce.received_at
      FROM collected_events ce
      LEFT JOIN delivery_attempts da ON da.collected_event_id = ce.id
      WHERE da.id IS NULL
      ORDER BY ce.received_at ASC
    `
  );

  for (const event of missingDeliveries) {
    await db.prepare(
      `
        INSERT INTO delivery_attempts (
          id,
          site_id,
          collected_event_id,
          event_id,
          route_id,
          destination_id,
          transform_id,
          delivery_mode,
          status,
          latency_ms,
          attempts,
          last_error,
          queued_at,
          sent_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        asString(event.site_id),
        asString(event.id),
        asString(event.event_id),
        "route_ingest",
        "forwarder_default",
        null,
        "queued",
        "pending",
        null,
        0,
        null,
        asString(event.received_at),
        null,
        asString(event.received_at)
      )
      .run();
  }
}

async function ensurePasswordResetTable(db: DatabaseBinding) {
  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS dashboard_password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        used_at TEXT
      )
    `
  ).run();
}

async function ensureSiteMembershipTables(db: DatabaseBinding) {
  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_memberships (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        invited_by_user_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        UNIQUE (site_id, user_id)
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_invites (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        email TEXT NOT NULL,
        invited_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'pending',
        token_hash TEXT NOT NULL UNIQUE,
        invited_by_user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        accepted_at TEXT,
        accepted_by_user_id TEXT,
        revoked_at TEXT
      )
    `
  ).run();
}

async function ensureDefaultSiteMemberships(db: DatabaseBinding) {
  const defaultSite = await firstRecord(db, "SELECT id FROM sites ORDER BY created_at ASC LIMIT 1");
  if (!defaultSite) {
    return;
  }
  const actualSiteId = asString(defaultSite.id);

  const users = await allRecords(
    db,
    `
      SELECT id, role
      FROM dashboard_users
    `
  );

  for (const user of users) {
    const existingMembership = await firstRecord(
      db,
      "SELECT id FROM site_memberships WHERE site_id = ? AND user_id = ? LIMIT 1",
      actualSiteId,
      asString(user.id)
    );
    if (existingMembership) {
      continue;
    }

    const now = nowIso();
    await db.prepare(
      `
        INSERT INTO site_memberships (
          id, site_id, user_id, role, status, invited_by_user_id, created_at, updated_at, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        actualSiteId,
        asString(user.id),
        toDashboardUserRole(user.role) === "global_admin" ? "admin" : "user",
        "active",
        null,
        now,
        now,
        now
      )
      .run();
  }
}

async function ensureDestinationsTable(db: DatabaseBinding) {
  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_destinations (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        status TEXT NOT NULL,
        secret_preview TEXT NOT NULL,
        config_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();
}

async function ensureRoutingTables(db: DatabaseBinding) {
  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_routes (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        priority INTEGER NOT NULL DEFAULT 100,
        environment TEXT NOT NULL DEFAULT 'all',
        match_json TEXT NOT NULL,
        consent_required_json TEXT NOT NULL,
        sampling_json TEXT NOT NULL,
        destinations_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_route_versions (
        site_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        active INTEGER NOT NULL DEFAULT 0,
        config_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (site_id, version)
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS site_transformations (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        name TEXT NOT NULL,
        destination_kind TEXT NOT NULL,
        status TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        mapping_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();
}

async function seedControlPlaneRouting(db: DatabaseBinding) {
  const seededSite = await firstRecord(db, "SELECT id FROM sites ORDER BY created_at ASC LIMIT 1");
  if (!seededSite) return;
  const actualSiteId = asString(seededSite.id);

  const destinationCount = await countRecords(db, "SELECT COUNT(*) AS count FROM site_destinations WHERE site_id = ?", actualSiteId);
  if (destinationCount === 0) {
    const createdAt = nowIso();
    for (const destination of listSeedDestinations(actualSiteId)) {
      await db.prepare(
        `
          INSERT INTO site_destinations (
            id, site_id, name, kind, status, secret_preview, config_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          destination.id,
          destination.site_id,
          destination.name,
          destination.kind,
          destination.status,
          destination.secret_preview,
          JSON.stringify(destination.config ?? {}),
          createdAt,
          createdAt
        )
        .run();
    }
  }

  const routeCount = await countRecords(db, "SELECT COUNT(*) AS count FROM site_routes WHERE site_id = ?", actualSiteId);
  if (routeCount === 0) {
    const createdAt = nowIso();
    for (const route of listSeedRoutes(actualSiteId)) {
      await db.prepare(
        `
          INSERT INTO site_routes (
            id, site_id, name, description, enabled, priority, environment, match_json,
            consent_required_json, sampling_json, destinations_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          route.id,
          route.site_id,
          route.name,
          route.description ?? null,
          route.enabled ? 1 : 0,
          route.priority,
          route.environment,
          JSON.stringify(route.match ?? {}),
          JSON.stringify(route.consent_required ?? {}),
          JSON.stringify(route.sampling ?? {}),
          JSON.stringify(route.destinations ?? []),
          createdAt,
          createdAt
        )
        .run();
    }
  }

  const transformationCount = await countRecords(db, "SELECT COUNT(*) AS count FROM site_transformations WHERE site_id = ?", actualSiteId);
  if (transformationCount === 0) {
    const createdAt = nowIso();
    for (const transformation of listSeedTransformations(actualSiteId)) {
      await db.prepare(
        `
          INSERT INTO site_transformations (
            id, site_id, name, destination_kind, status, version, mapping_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          transformation.id,
          transformation.site_id,
          transformation.name,
          transformation.destination_kind,
          transformation.status,
          transformation.version,
          JSON.stringify(transformation.mapping ?? {}),
          createdAt,
          createdAt
        )
        .run();
    }
  }

  const versionCount = await countRecords(db, "SELECT COUNT(*) AS count FROM site_route_versions WHERE site_id = ?", actualSiteId);
  if (versionCount === 0) {
    const seedVersions = listSeedRouteVersions(actualSiteId);
    const activeVersion = seedVersions.find((item) => item.active)?.version ?? 1;
    const routes = listSeedRoutes(actualSiteId);
    const destinations = listSeedDestinations(actualSiteId).reduce<Record<string, CompiledSiteRoutingConfig["destinations"][string]>>((accumulator, destination) => {
      accumulator[destination.id] = {
        id: destination.id,
        kind: destination.kind,
        name: destination.name,
        enabled: destination.status === "active",
        config: destination.config
      };
      return accumulator;
    }, {});
    const transformations = listSeedTransformations(actualSiteId).reduce<Record<string, CompiledSiteRoutingConfig["transformations"][string]>>((accumulator, transformation) => {
      accumulator[transformation.id] = {
        id: transformation.id,
        name: transformation.name,
        version: transformation.version,
        destination_kind: transformation.destination_kind,
        enabled: transformation.status === "active",
        mapping: transformation.mapping
      };
      return accumulator;
    }, {});
    const compiled = compileRoutingConfig({
      site_id: actualSiteId,
      version: activeVersion,
      routes,
      destinations,
      transformations
    });
    await db.prepare(
      `
        INSERT INTO site_route_versions (site_id, version, active, config_json, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
    )
      .bind(actualSiteId, activeVersion, 1, JSON.stringify(compiled), nowIso())
      .run();
  }
}

export async function ensureControlPlane(dbInput?: DatabaseBinding) {
  const db = ensureDb(dbInput);
  if (!ensurePromise) {
    ensurePromise = Promise.all([
      ensureDashboardUsersTableColumns(db),
      ensureOperationsTables(db),
      ensurePasswordResetTable(db),
      ensureSiteMembershipTables(db),
      ensureDestinationsTable(db),
      ensureRoutingTables(db)
    ])
      .then(() => ensureDefaultSiteMemberships(db))
      .then(() => seedControlPlaneRouting(db))
      .then(() => undefined);
  }

  await ensurePromise;
}

async function createOperationJob(
  db: DatabaseBinding,
  input: {
    siteId: string;
    type: OperationJobRecord["type"];
    detail: string;
    status?: OperationJobRecord["status"];
    progress?: number;
  }
) {
  const createdAt = nowIso();
  const completed = (input.status ?? "completed") === "completed";
  const record = {
    id: crypto.randomUUID(),
    site_id: input.siteId,
    type: input.type,
    status: input.status ?? "completed",
    progress: input.progress ?? (completed ? 100 : 0),
    detail: input.detail,
    created_at: createdAt,
    finished_at: completed ? createdAt : null
  };

  await db.prepare(
    `
      INSERT INTO operation_jobs (id, site_id, type, status, progress, detail, created_at, finished_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      record.id,
      record.site_id,
      record.type,
      record.status,
      record.progress,
      record.detail,
      record.created_at,
      record.finished_at
    )
    .run();

  return toOperationJobRecord(record);
}

async function sendPasswordResetEmail(
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  input: { email: string; name: string; token: string }
) {
  const resetBaseUrl = env.PASSWORD_RESET_BASE_URL?.trim() || DEFAULT_PASSWORD_RESET_BASE_URL;
  const separator = resetBaseUrl.includes("?") ? "&" : "?";
  const resetUrl = `${resetBaseUrl}${separator}token=${encodeURIComponent(input.token)}`;
  await sendBrevoEmail(env, {
    email: input.email,
    name: input.name,
    subject: "Reset your EVENTS Gateway password",
    template: renderTransactionalEmail({
      preheader: "Reset your password and get back into your dashboard securely.",
      eyebrow: "Password reset request",
      heading: "Reset your password",
      greeting: `Hello ${input.name || "there"},`,
      paragraphs: [
        "We received a request to reset the password for your EVENTS Gateway dashboard account.",
        "Use the secure button below to choose a new password and continue where you left off."
      ],
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
      note: "If you did not request this change, you can safely ignore this email. This secure link expires in 60 minutes.",
      closing: "Need to access the dashboard later? You can always start a new reset request from the sign-in screen."
    })
  });
}

async function sendWelcomeEmail(
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  input: { email: string; name: string; role: DashboardUserRole }
) {
  const dashboardLoginUrl = resolveDashboardUrl("/login", env.PASSWORD_RESET_BASE_URL?.trim() || DEFAULT_PASSWORD_RESET_BASE_URL);
  const roleMessage = input.role === "global_admin"
    ? "Your account is the first workspace owner for this deployment, so you can immediately start the platform setup."
    : "Your dashboard account is active and ready for event routing, destinations, and workspace setup.";

  await sendBrevoEmail(env, {
    email: input.email,
    name: input.name,
    subject: "Welcome to EVENTS Gateway",
    template: renderTransactionalEmail({
      preheader: "Your EVENTS Gateway dashboard account is ready.",
      eyebrow: "Welcome aboard",
      heading: "Your account is live",
      greeting: `Hello ${input.name || "there"},`,
      paragraphs: [
        "Welcome to EVENTS Gateway. Your dashboard account has been created successfully.",
        roleMessage,
        "From here you can configure routing, connect destinations, and start validating your event flow in one place."
      ],
      ctaLabel: "Open dashboard",
      ctaUrl: dashboardLoginUrl,
      note: "Keep this email for quick access. If you ever lose your password, you can request a secure reset from the dashboard login page.",
      closing: "We are glad to have you building with EVENTS Gateway."
    })
  });
}

async function sendSiteInviteEmail(
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  input: {
    email: string;
    invited_name: string;
    inviter_name: string;
    site_name: string;
    role: SiteMemberRole;
    token: string;
  }
) {
  const inviteUrl = resolveDashboardUrl(
    `/accept-invite?token=${encodeURIComponent(input.token)}`,
    env.PASSWORD_RESET_BASE_URL?.trim() || DEFAULT_PASSWORD_RESET_BASE_URL
  );
  const roleLabel = input.role === "admin" ? "admin" : "user";

  await sendBrevoEmail(env, {
    email: input.email,
    name: input.invited_name,
    subject: `You were invited to ${input.site_name} on EVENTS Gateway`,
    template: renderTransactionalEmail({
      preheader: `Join ${input.site_name} on EVENTS Gateway and activate your access.`,
      eyebrow: "Workspace invitation",
      heading: "You have been invited",
      greeting: `Hello ${input.invited_name || "there"},`,
      paragraphs: [
        `${input.inviter_name} invited you to join ${input.site_name} on EVENTS Gateway.`,
        `Your access will be created with the ${roleLabel} role for this site.`,
        "Use the secure button below to accept the invitation and finish account access."
      ],
      ctaLabel: "Accept invitation",
      ctaUrl: inviteUrl,
      note: "This invitation expires in 7 days. If you already have an account for this email address, confirm your current password on the invitation page.",
      closing: "We are ready when you are."
    })
  });
}

async function deletePasswordResetToken(db: DatabaseBinding, resetId: string) {
  await db.prepare("DELETE FROM dashboard_password_reset_tokens WHERE id = ?").bind(resetId).run();
}

export async function getOperationsHealth(dbInput: DatabaseBinding | undefined, siteId: string): Promise<OperationsHealthService[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const [eventCount, activeKeys, pendingCount, retryingCount, failedCount] = await Promise.all([
    countRecords(db, "SELECT COUNT(*) AS count FROM collected_events WHERE site_id = ?", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM site_keys WHERE site_id = ? AND status = 'active'", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'pending'", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'retrying'", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'failed'", siteId)
  ]);

  return [
    { service: "Collector", status: "healthy", detail: `${eventCount} stored events in D1` },
    { service: "Routing compiler", status: "healthy", detail: "Runtime routing remains available for queue processing." },
    {
      service: "Forwarder queue",
      status: failedCount > 0 ? "failed" : pendingCount + retryingCount > 0 ? "pending" : "healthy",
      detail: `${pendingCount} queued, ${retryingCount} retrying, ${failedCount} failed`
    },
    {
      service: "Destination auth",
      status: activeKeys > 0 ? "healthy" : "failed",
      detail: `${activeKeys} active collector keys loaded`
    }
  ];
}

export async function getOperationsQueues(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const [pendingCount, retryingCount, failedCount] = await Promise.all([
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'pending'", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'retrying'", siteId),
    countRecords(db, "SELECT COUNT(*) AS count FROM delivery_attempts WHERE site_id = ? AND status = 'failed'", siteId)
  ]);

  return {
    delivery_queue: {
      depth: pendingCount + retryingCount,
      retrying: retryingCount
    },
    dlq: {
      depth: failedCount
    }
  };
}

export async function listOperationsDlq(dbInput: DatabaseBinding | undefined, siteId: string): Promise<DeliveryAttemptRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, event_id, route_id, destination_id, status, latency_ms, attempts, last_error, queued_at, sent_at
      FROM delivery_attempts
      WHERE site_id = ? AND status = 'failed'
      ORDER BY updated_at DESC, queued_at DESC
    `,
    siteId
  );

  return records.map(toDeliveryAttemptRecord);
}

export async function listOperationJobs(dbInput: DatabaseBinding | undefined, siteId: string): Promise<OperationJobRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, type, status, progress, detail, created_at, finished_at
      FROM operation_jobs
      WHERE site_id = ?
      ORDER BY created_at DESC
    `,
    siteId
  );

  return records.map(toOperationJobRecord);
}

export async function getOperationJob(dbInput: DatabaseBinding | undefined, siteId: string, jobId: string): Promise<OperationJobRecord | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const record = await firstRecord(
    db,
    `
      SELECT id, site_id, type, status, progress, detail, created_at, finished_at
      FROM operation_jobs
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    jobId
  );

  return record ? toOperationJobRecord(record) : null;
}

export async function flushPendingDeliveries(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  limit = 25,
  env?: Pick<EnvironmentBindings, "MANAGED_DESTINATIONS_CONFIG">
): Promise<DeliveryAttemptRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT da.id, da.site_id, da.event_id, da.route_id, da.destination_id, da.transform_id, da.delivery_mode, da.status, da.latency_ms, da.attempts, da.last_error, da.queued_at, da.sent_at, ce.event_type, ce.payload_json, sd.kind AS destination_kind, sd.config_json AS destination_config_json, st.mapping_json AS transform_mapping_json
      FROM delivery_attempts da
      INNER JOIN collected_events ce ON ce.id = da.collected_event_id
      LEFT JOIN site_destinations sd ON sd.site_id = da.site_id AND sd.id = da.destination_id
      LEFT JOIN site_transformations st ON st.site_id = da.site_id AND st.id = da.transform_id
      WHERE da.site_id = ? AND da.status IN ('pending', 'retrying')
      ORDER BY da.queued_at ASC
      LIMIT ?
    `,
    siteId,
    limit
  );

  const processed: DeliveryAttemptRecord[] = [];
  for (const record of records) {
    const processedRecord = await processDeliveryAttemptRecord(db, record, env);
    if (processedRecord) {
      processed.push(processedRecord);
    }
  }

  await createOperationJob(db, {
    siteId,
    type: "forwarder_flush",
    detail: processed.length
      ? `Processed ${processed.length} queued deliveries.`
      : "No queued deliveries were available to process."
  });

  return processed;
}

async function processDeliveryAttemptRecord(
  db: DatabaseBinding,
  record: DatabaseRecord,
  env?: Pick<EnvironmentBindings, "MANAGED_DESTINATIONS_CONFIG">
): Promise<DeliveryAttemptRecord | null> {
  const currentStatus = asString(record.status) as DeliveryAttemptRecord["status"];
  if (currentStatus !== "pending" && currentStatus !== "retrying") {
    return toDeliveryAttemptRecord(record);
  }

  const attempts = asNumber(record.attempts) + 1;
  const updatedAt = nowIso();
  const storedEvent = parseStoredPayload(record.payload_json);
  const startedAt = Date.now();

  let status: DeliveryAttemptRecord["status"] = "retrying";
  let latencyMs: number | null = null;
  let sentAt: string | null = null;
  let lastError: string | null = null;

  if (!storedEvent) {
    status = "failed";
    lastError = "Stored payload is missing or invalid.";
  } else {
    try {
      const storedDestinationConfig = parseJsonRecord(record.destination_config_json);
      const transformMapping = parseJsonRecord(record.transform_mapping_json);
      const transformedEvent = applyTransformationMapping(storedEvent, transformMapping);
      const delivery = await dispatchManagedDestination({
        siteId: asString(record.site_id),
        destinationId: asString(record.destination_id),
        event: transformedEvent,
        configSource: env?.MANAGED_DESTINATIONS_CONFIG,
        configOverride: {
          kind: asString(record.destination_kind),
          ...storedDestinationConfig
        }
      });

      if (delivery.ok) {
        status = "healthy";
        latencyMs = Math.max(1, Date.now() - startedAt);
        sentAt = updatedAt;
      } else if ((delivery.status ?? 500) >= 500 && attempts < 3) {
        status = "retrying";
        lastError = delivery.error ?? "Transient upstream failure.";
      } else {
        status = "failed";
        lastError = delivery.error ?? "Destination rejected the delivery payload.";
      }
    } catch (error) {
      if (attempts < 3) {
        status = "retrying";
      } else {
        status = "failed";
      }
      lastError = error instanceof Error ? error.message : "Destination dispatch failed.";
    }
  }

  await db.prepare(
    `
      UPDATE delivery_attempts
      SET status = ?, latency_ms = ?, attempts = ?, last_error = ?, sent_at = ?, updated_at = ?
      WHERE id = ?
    `
  )
    .bind(status, latencyMs, attempts, lastError, sentAt, updatedAt, asString(record.id))
    .run();

  return toDeliveryAttemptRecord({
    ...record,
    status,
    latency_ms: latencyMs,
    attempts,
    last_error: lastError,
    sent_at: sentAt
  });
}

export async function processQueuedDeliveryAttempt(
  dbInput: DatabaseBinding | undefined,
  input: { deliveryAttemptId: string; siteId?: string },
  env?: Pick<EnvironmentBindings, "MANAGED_DESTINATIONS_CONFIG">
): Promise<DeliveryAttemptRecord | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const record = await firstRecord(
    db,
    `
      SELECT da.id, da.site_id, da.event_id, da.route_id, da.destination_id, da.transform_id, da.delivery_mode, da.status, da.latency_ms, da.attempts, da.last_error, da.queued_at, da.sent_at, ce.event_type, ce.payload_json, sd.kind AS destination_kind, sd.config_json AS destination_config_json, st.mapping_json AS transform_mapping_json
      FROM delivery_attempts da
      INNER JOIN collected_events ce ON ce.id = da.collected_event_id
      LEFT JOIN site_destinations sd ON sd.site_id = da.site_id AND sd.id = da.destination_id
      LEFT JOIN site_transformations st ON st.site_id = da.site_id AND st.id = da.transform_id
      WHERE da.id = ? AND (? IS NULL OR da.site_id = ?)
      LIMIT 1
    `,
    input.deliveryAttemptId,
    input.siteId ?? null,
    input.siteId ?? null
  );

  if (!record) {
    return null;
  }

  return processDeliveryAttemptRecord(db, record, env);
}

export async function replayDlqOperations(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const updatedAt = nowIso();
  const failed = await listOperationsDlq(db, siteId);

  await db.prepare(
    `
      UPDATE delivery_attempts
      SET status = 'retrying', last_error = NULL, updated_at = ?
      WHERE site_id = ? AND status = 'failed'
    `
  )
    .bind(updatedAt, siteId)
    .run();

  return createOperationJob(db, {
    siteId,
    type: "dlq_replay",
    detail: `Queued ${failed.length} failed deliveries for retry.`
  });
}

export async function replayCollectedEvent(dbInput: DatabaseBinding | undefined, siteId: string, eventId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const event = await firstRecord(
    db,
    `
      SELECT id, received_at
      FROM collected_events
      WHERE site_id = ? AND event_id = ?
      ORDER BY received_at DESC
      LIMIT 1
    `,
    siteId,
    eventId
  );
  if (!event) {
    return null;
  }

  await db.prepare(
    `
      INSERT INTO delivery_attempts (
        id,
        site_id,
        collected_event_id,
        event_id,
        route_id,
        destination_id,
        status,
        latency_ms,
        attempts,
        last_error,
        queued_at,
        sent_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      crypto.randomUUID(),
      siteId,
      asString(event.id),
      eventId,
      "route_replay",
      "forwarder_default",
      "pending",
      null,
      0,
      null,
      nowIso(),
      null,
      nowIso()
    )
    .run();

  return createOperationJob(db, {
    siteId,
    type: "replay",
    detail: `Replayed deliveries for event ${eventId}.`
  });
}

export async function backfillAttributionJob(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  return createOperationJob(db, {
    siteId,
    type: "backfill_attribution",
    detail: "Started attribution backfill for the last 7 days."
  });
}

export async function exportRawJob(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  return createOperationJob(db, {
    siteId,
    type: "export",
    detail: "Prepared raw event export job."
  });
}

export async function createUserSession(
  dbInput: DatabaseBinding | undefined,
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  input: { name: string; email: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) throw new Error("Name must contain at least 2 characters.");
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

  const existingUser = await firstRecord(db, "SELECT id FROM dashboard_users WHERE email = ? LIMIT 1", email);
  if (existingUser) {
    throw new Error("An account already exists for this email.");
  }

  const userId = crypto.randomUUID();
  const createdAt = nowIso();
  const existingUsersCount = await countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users");
  const role: DashboardUserRole = existingUsersCount === 0 ? "global_admin" : "member";

  await db.prepare(
    `
      INSERT INTO dashboard_users (
        id,
        name,
        email,
        password_hash,
        role,
        status,
        created_at,
        password_changed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(userId, name, email, await sha256Hex(password), role, "active", createdAt, createdAt)
    .run();

  const siteRecord = await firstRecord(db, "SELECT id FROM sites ORDER BY created_at ASC LIMIT 1");
  const actualSiteId = siteRecord ? asString(siteRecord.id) : null;

  if (actualSiteId) {
    await db.prepare(
      `
        INSERT INTO site_memberships (
          id, site_id, user_id, role, status, invited_by_user_id, created_at, updated_at, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        actualSiteId,
        userId,
        role === "global_admin" ? "admin" : "user",
        "active",
        null,
        createdAt,
        createdAt,
        createdAt
      )
      .run();
  }

  try {
    await sendWelcomeEmail(env, {
      email,
      name,
      role
    });
  } catch (error) {
    if (actualSiteId) {
      await db.prepare("DELETE FROM site_memberships WHERE user_id = ? AND site_id = ?").bind(userId, actualSiteId).run();
    }
    await db.prepare("DELETE FROM dashboard_users WHERE id = ?").bind(userId).run();
    throw error;
  }

  return createSession(db, userId);
}

export async function loginUserSession(
  dbInput: DatabaseBinding | undefined,
  input: { email: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const email = normalizeEmail(input.email);
  const record = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, password_hash, created_at, phone, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE email = ?
      LIMIT 1
    `,
    email
  );

  if (!record) {
    throw new Error("No account exists for this email yet.");
  }

  const passwordHash = await sha256Hex(input.password);
  if (passwordHash !== asString(record.password_hash)) {
    throw new Error("The email or password is incorrect.");
  }

  if (toDashboardUserStatus(record.status) === "blocked") {
    throw new Error("This account is blocked.");
  }

  return createSession(db, asString(record.id), record);
}

export async function requestUserPasswordReset(
  dbInput: DatabaseBinding | undefined,
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  input: { email: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const user = await firstRecord(
    db,
    `
      SELECT id, name, email, status
      FROM dashboard_users
      WHERE email = ?
      LIMIT 1
    `,
    email
  );

  if (!user || toDashboardUserStatus(user.status) === "blocked") {
    return { requested: true };
  }

  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();
  const token = createPasswordResetToken();
  const resetId = crypto.randomUUID();

  await db.prepare("DELETE FROM dashboard_password_reset_tokens WHERE user_id = ? OR expires_at <= ?")
    .bind(asString(user.id), createdAt)
    .run();

  await db.prepare(
    `
      INSERT INTO dashboard_password_reset_tokens (
        id,
        user_id,
        token_hash,
        expires_at,
        created_at,
        used_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
  )
    .bind(resetId, asString(user.id), await sha256Hex(token), expiresAt, createdAt, null)
    .run();

  try {
    await sendPasswordResetEmail(env, {
      email: asString(user.email),
      name: asString(user.name),
      token
    });
  } catch (error) {
    await deletePasswordResetToken(db, resetId);
    throw error;
  }

  return { requested: true };
}

export async function resetUserPasswordWithToken(
  dbInput: DatabaseBinding | undefined,
  input: { token: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const token = input.token.trim();
  const nextPassword = input.password;
  if (!token) {
    throw new Error("Reset token is required.");
  }
  if (nextPassword.trim().length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const reset = await firstRecord(
    db,
    `
      SELECT pr.id, pr.user_id, pr.expires_at, pr.used_at, u.status
      FROM dashboard_password_reset_tokens pr
      INNER JOIN dashboard_users u ON u.id = pr.user_id
      WHERE pr.token_hash = ?
      LIMIT 1
    `,
    await sha256Hex(token)
  );

  if (!reset) {
    throw new Error("This reset link is invalid or expired.");
  }
  if (asNullableString(reset.used_at)) {
    throw new Error("This reset link has already been used.");
  }
  if (Date.parse(asString(reset.expires_at)) <= Date.now()) {
    await deletePasswordResetToken(db, asString(reset.id));
    throw new Error("This reset link is invalid or expired.");
  }
  if (toDashboardUserStatus(reset.status) === "blocked") {
    throw new Error("This account is blocked.");
  }

  const passwordChangedAt = nowIso();
  await db.prepare(
    "UPDATE dashboard_users SET password_hash = ?, password_changed_at = ? WHERE id = ?"
  )
    .bind(await sha256Hex(nextPassword), passwordChangedAt, asString(reset.user_id))
    .run();

  await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(asString(reset.user_id)).run();
  await db.prepare("UPDATE dashboard_password_reset_tokens SET used_at = ? WHERE id = ?")
    .bind(passwordChangedAt, asString(reset.id))
    .run();
  await db.prepare("DELETE FROM dashboard_password_reset_tokens WHERE user_id = ? AND id != ?")
    .bind(asString(reset.user_id), asString(reset.id))
    .run();

  return { password_changed_at: passwordChangedAt };
}

async function createSession(db: DatabaseBinding, userId: string, existingUser?: DatabaseRecord | null) {
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const token = createSessionToken();
  const sessionId = crypto.randomUUID();

  await db.prepare(
    "INSERT INTO dashboard_sessions (id, token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(sessionId, token, userId, expiresAt, createdAt)
    .run();

  await db.prepare("UPDATE dashboard_users SET last_login_at = ? WHERE id = ?").bind(createdAt, userId).run();

  const userRecord =
    existingUser ??
    (await firstRecord(
      db,
      `
        SELECT id, name, email, role, status, created_at, phone, last_login_at, password_changed_at
        FROM dashboard_users
        WHERE id = ?
        LIMIT 1
      `,
      userId
    ));

  if (!userRecord) {
    throw new Error("User not found.");
  }

  return {
    session: {
      id: sessionId,
      token,
      user_id: userId,
      expires_at: expiresAt,
      created_at: createdAt
    } satisfies DashboardSession,
    user: toDashboardUser(userRecord)
  };
}

export async function getSessionByToken(dbInput: DatabaseBinding | undefined, token: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const session = await firstRecord(
    db,
    `
      SELECT s.id, s.token, s.user_id, s.expires_at, s.created_at, u.name, u.email, u.phone, u.created_at AS user_created_at
      , u.role, u.status, u.last_login_at, u.password_changed_at
      FROM dashboard_sessions s
      JOIN dashboard_users u ON u.id = s.user_id
      WHERE s.token = ?
      LIMIT 1
    `,
    token
  );

  if (!session) return null;
  if (Date.parse(asString(session.expires_at)) <= Date.now()) {
    await revokeSession(db, token);
    return null;
  }
  if (toDashboardUserStatus(session.status) === "blocked") {
    await revokeSession(db, token);
    return null;
  }

  return {
    session: {
      id: asString(session.id),
      token: asString(session.token),
      user_id: asString(session.user_id),
      expires_at: asString(session.expires_at),
      created_at: asString(session.created_at)
    } satisfies DashboardSession,
    user: {
      id: asString(session.user_id),
      name: asString(session.name),
      email: asString(session.email),
      role: toDashboardUserRole(session.role),
      status: toDashboardUserStatus(session.status),
      phone: asNullableString(session.phone),
      created_at: asString(session.user_created_at),
      last_login_at: asNullableString(session.last_login_at),
      password_changed_at: asNullableString(session.password_changed_at)
    } satisfies DashboardUser
  };
}

export async function revokeSession(dbInput: DatabaseBinding | undefined, token: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  await db.prepare("DELETE FROM dashboard_sessions WHERE token = ?").bind(token).run();
}

export async function getDefaultSite(dbInput: DatabaseBinding | undefined) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const site = await firstRecord(
    db,
    `
      SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
      FROM sites
      ORDER BY created_at ASC
      LIMIT 1
    `
  );

  if (!site) {
    throw new Error("Default site is missing. Ensure the installation wizard has completed successfully.");
  }

  return toDashboardSite(site);
}

async function countSiteAdmins(db: DatabaseBinding, siteId: string) {
  return countRecords(
    db,
    "SELECT COUNT(*) AS count FROM site_memberships WHERE site_id = ? AND status = 'active' AND role = 'admin'",
    siteId
  );
}

export async function getSiteAccess(
  dbInput: DatabaseBinding | undefined,
  userId: string,
  siteId: string
): Promise<SiteAccess | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const user = await firstRecord(
    db,
    `
      SELECT id, role, status
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
    `,
    userId
  );
  if (!user || toDashboardUserStatus(user.status) !== "active") {
    return null;
  }

  if (toDashboardUserRole(user.role) === "global_admin") {
    return {
      site_id: siteId,
      user_id: userId,
      role: "admin",
      is_global_admin: true
    };
  }

  const membership = await firstRecord(
    db,
    `
      SELECT site_id, user_id, role
      FROM site_memberships
      WHERE site_id = ? AND user_id = ? AND status = 'active'
      LIMIT 1
    `,
    siteId,
    userId
  );
  if (!membership) {
    return null;
  }

  return {
    site_id: asString(membership.site_id),
    user_id: asString(membership.user_id),
    role: toSiteMemberRole(membership.role),
    is_global_admin: false
  };
}

export async function getSiteMembersPayload(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  siteId: string
): Promise<SiteMembersPayload> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const siteRecord = await firstRecord(
    db,
    `
      SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
      FROM sites
      WHERE id = ?
      LIMIT 1
    `,
    siteId
  );
  if (!siteRecord) {
    throw new Error("Site not found.");
  }

  const currentMembership = await getSiteAccess(db, actorUserId, siteId);
  if (!currentMembership) {
    throw new Error("You do not have access to this site.");
  }

  const [memberRecords, inviteRecords] = await Promise.all([
    allRecords(
      db,
      `
        SELECT
          m.id,
          m.site_id,
          m.user_id,
          m.role,
          m.status,
          m.invited_by_user_id,
          m.created_at,
          m.updated_at,
          m.joined_at,
          u.name,
          u.email,
          u.last_login_at,
          inviter.name AS invited_by_name
        FROM site_memberships m
        INNER JOIN dashboard_users u ON u.id = m.user_id
        LEFT JOIN dashboard_users inviter ON inviter.id = m.invited_by_user_id
        WHERE m.site_id = ? AND m.status = 'active'
        ORDER BY
          CASE WHEN m.role = 'admin' THEN 0 ELSE 1 END,
          u.name ASC,
          u.email ASC
      `,
      siteId
    ),
    allRecords(
      db,
      `
        SELECT
          i.id,
          i.site_id,
          i.email,
          i.invited_name,
          i.role,
          i.status,
          i.invited_by_user_id,
          i.created_at,
          i.expires_at,
          i.accepted_at,
          i.accepted_by_user_id,
          i.revoked_at,
          inviter.name AS invited_by_name
        FROM site_invites i
        LEFT JOIN dashboard_users inviter ON inviter.id = i.invited_by_user_id
        WHERE i.site_id = ?
        ORDER BY i.created_at DESC, i.email ASC
      `,
      siteId
    )
  ]);

  return {
    site: toDashboardSite(siteRecord),
    current_membership: currentMembership,
    members: memberRecords.map(toSiteMembershipRecord),
    invites: inviteRecords.map(toSiteInviteRecord)
  };
}

export async function createSiteInvite(
  dbInput: DatabaseBinding | undefined,
  env: Pick<EnvironmentBindings, "BREVO_API_KEY" | "BREVO_SENDER_EMAIL" | "PASSWORD_RESET_BASE_URL">,
  actorUserId: string,
  siteId: string,
  input: { email: string; invited_name?: string; role?: SiteMemberRole }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const currentMembership = await getSiteAccess(db, actorUserId, siteId);
  if (!currentMembership) {
    throw new Error("You do not have access to this site.");
  }

  const siteRecord = await firstRecord(db, "SELECT id, name FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!siteRecord) {
    throw new Error("Site not found.");
  }

  const inviterRecord = await firstRecord(db, "SELECT name FROM dashboard_users WHERE id = ? LIMIT 1", actorUserId);
  const email = normalizeEmail(input.email);
  const invitedName = (input.invited_name ?? "").trim();
  const role = toSiteMemberRole(input.role);

  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const existingMembership = await firstRecord(
    db,
    `
      SELECT m.id
      FROM site_memberships m
      INNER JOIN dashboard_users u ON u.id = m.user_id
      WHERE m.site_id = ? AND m.status = 'active' AND u.email = ?
      LIMIT 1
    `,
    siteId,
    email
  );
  if (existingMembership) {
    throw new Error("This user already has access to the site.");
  }

  const existingUser = await firstRecord(
    db,
    `
      SELECT id, status
      FROM dashboard_users
      WHERE email = ?
      LIMIT 1
    `,
    email
  );
  if (existingUser && toDashboardUserStatus(existingUser.status) === "blocked") {
    throw new Error("This account is blocked.");
  }

  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SITE_INVITE_TTL_MS).toISOString();
  const token = createPasswordResetToken();
  const inviteId = crypto.randomUUID();
  const tokenHash = await sha256Hex(token);

  await db.prepare(
    `
      UPDATE site_invites
      SET status = 'revoked', revoked_at = ?
      WHERE site_id = ? AND email = ? AND status = 'pending'
    `
  )
    .bind(createdAt, siteId, email)
    .run();

  await db.prepare(
    `
      INSERT INTO site_invites (
        id, site_id, email, invited_name, role, status, token_hash, invited_by_user_id, created_at, expires_at, accepted_at, accepted_by_user_id, revoked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      inviteId,
      siteId,
      email,
      invitedName || null,
      role,
      "pending",
      tokenHash,
      actorUserId,
      createdAt,
      expiresAt,
      null,
      null,
      null
    )
    .run();

  try {
    await sendSiteInviteEmail(env, {
      email,
      invited_name: invitedName || email,
      inviter_name: asString(inviterRecord?.name) || "A teammate",
      site_name: asString(siteRecord.name) || "your site",
      role,
      token
    });
  } catch (error) {
    await db.prepare("DELETE FROM site_invites WHERE id = ?").bind(inviteId).run();
    throw error;
  }

  const inviteRecord = await firstRecord(
    db,
    `
      SELECT
        i.id,
        i.site_id,
        i.email,
        i.invited_name,
        i.role,
        i.status,
        i.invited_by_user_id,
        i.created_at,
        i.expires_at,
        i.accepted_at,
        i.accepted_by_user_id,
        i.revoked_at,
        inviter.name AS invited_by_name
      FROM site_invites i
      LEFT JOIN dashboard_users inviter ON inviter.id = i.invited_by_user_id
      WHERE i.id = ?
      LIMIT 1
    `,
    inviteId
  );
  if (!inviteRecord) {
    throw new Error("Invite not found after creation.");
  }

  return toSiteInviteRecord(inviteRecord);
}

export async function updateSiteMembershipRole(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  siteId: string,
  membershipId: string,
  nextRole: SiteMemberRole
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const currentMembership = await getSiteAccess(db, actorUserId, siteId);
  if (!currentMembership || (!currentMembership.is_global_admin && currentMembership.role !== "admin")) {
    throw new Error("Site admin access is required.");
  }

  const membership = await firstRecord(
    db,
    `
      SELECT id, user_id, role, status
      FROM site_memberships
      WHERE id = ? AND site_id = ?
      LIMIT 1
    `,
    membershipId,
    siteId
  );
  if (!membership || toSiteMembershipStatus(membership.status) !== "active") {
    throw new Error("Membership not found.");
  }

  const role = toSiteMemberRole(nextRole);
  const currentRole = toSiteMemberRole(membership.role);
  if (currentRole === "admin" && role !== "admin") {
    const adminCount = await countSiteAdmins(db, siteId);
    if (adminCount <= 1) {
      throw new Error("At least one site admin must remain.");
    }
  }

  if (
    asString(membership.user_id) === actorUserId &&
    currentMembership.role === "admin" &&
    !currentMembership.is_global_admin &&
    role !== "admin"
  ) {
    throw new Error("You cannot remove your own site admin role.");
  }

  await db.prepare(
    "UPDATE site_memberships SET role = ?, updated_at = ? WHERE id = ? AND site_id = ?"
  )
    .bind(role, nowIso(), membershipId, siteId)
    .run();

  const updated = await firstRecord(
    db,
    `
      SELECT
        m.id,
        m.site_id,
        m.user_id,
        m.role,
        m.status,
        m.invited_by_user_id,
        m.created_at,
        m.updated_at,
        m.joined_at,
        u.name,
        u.email,
        u.last_login_at,
        inviter.name AS invited_by_name
      FROM site_memberships m
      INNER JOIN dashboard_users u ON u.id = m.user_id
      LEFT JOIN dashboard_users inviter ON inviter.id = m.invited_by_user_id
      WHERE m.id = ? AND m.site_id = ?
      LIMIT 1
    `,
    membershipId,
    siteId
  );
  if (!updated) {
    throw new Error("Membership not found after update.");
  }

  return toSiteMembershipRecord(updated);
}

export async function deleteSiteMembership(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  siteId: string,
  membershipId: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const currentMembership = await getSiteAccess(db, actorUserId, siteId);
  if (!currentMembership || (!currentMembership.is_global_admin && currentMembership.role !== "admin")) {
    throw new Error("Site admin access is required.");
  }

  const membership = await firstRecord(
    db,
    `
      SELECT id, user_id, role, status
      FROM site_memberships
      WHERE id = ? AND site_id = ?
      LIMIT 1
    `,
    membershipId,
    siteId
  );
  if (!membership || toSiteMembershipStatus(membership.status) !== "active") {
    return false;
  }

  if (asString(membership.user_id) === actorUserId && !currentMembership.is_global_admin) {
    throw new Error("You cannot remove your own access.");
  }

  if (toSiteMemberRole(membership.role) === "admin") {
    const adminCount = await countSiteAdmins(db, siteId);
    if (adminCount <= 1) {
      throw new Error("At least one site admin must remain.");
    }
  }

  await db.prepare("DELETE FROM site_memberships WHERE id = ? AND site_id = ?").bind(membershipId, siteId).run();
  return true;
}

export async function revokeSiteInvite(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  siteId: string,
  inviteId: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const currentMembership = await getSiteAccess(db, actorUserId, siteId);
  if (!currentMembership || (!currentMembership.is_global_admin && currentMembership.role !== "admin")) {
    throw new Error("Site admin access is required.");
  }

  const invite = await firstRecord(
    db,
    `
      SELECT id, status
      FROM site_invites
      WHERE id = ? AND site_id = ?
      LIMIT 1
    `,
    inviteId,
    siteId
  );
  if (!invite) {
    return false;
  }

  if (toSiteInviteStatus(invite.status) !== "pending") {
    return false;
  }

  await db.prepare(
    "UPDATE site_invites SET status = 'revoked', revoked_at = ? WHERE id = ? AND site_id = ?"
  )
    .bind(nowIso(), inviteId, siteId)
    .run();
  return true;
}

export async function acceptSiteInvite(
  dbInput: DatabaseBinding | undefined,
  input: { token: string; name?: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const token = input.token.trim();
  const password = input.password;
  const name = (input.name ?? "").trim();

  if (!token) {
    throw new Error("The invite link is missing a token.");
  }
  if (password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const invite = await firstRecord(
    db,
    `
      SELECT
        i.id,
        i.site_id,
        i.email,
        i.invited_name,
        i.role,
        i.status,
        i.invited_by_user_id,
        i.created_at,
        i.expires_at,
        i.accepted_at,
        i.accepted_by_user_id,
        i.revoked_at
      FROM site_invites i
      WHERE i.token_hash = ?
      LIMIT 1
    `,
    await sha256Hex(token)
  );
  if (!invite) {
    throw new Error("This invite is invalid or expired.");
  }

  if (toSiteInviteStatus(invite.status) !== "pending") {
    throw new Error("This invite is no longer active.");
  }
  if (Date.parse(asString(invite.expires_at)) <= Date.now()) {
    await db.prepare("UPDATE site_invites SET status = 'expired' WHERE id = ?").bind(asString(invite.id)).run();
    throw new Error("This invite is invalid or expired.");
  }

  const email = normalizeEmail(asString(invite.email));
  let userRecord = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, password_hash, created_at, phone, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE email = ?
      LIMIT 1
    `,
    email
  );

  let userId = asString(userRecord?.id);
  if (userRecord) {
    if (toDashboardUserStatus(userRecord.status) === "blocked") {
      throw new Error("This account is blocked.");
    }
    if (await sha256Hex(password) !== asString(userRecord.password_hash)) {
      throw new Error("Enter the current password for this email to accept the invitation.");
    }
  } else {
    const nextName = name || asString(invite.invited_name);
    if (nextName.trim().length < 2) {
      throw new Error("Name must contain at least 2 characters.");
    }

    const createdAt = nowIso();
    userId = crypto.randomUUID();
    const passwordHash = await sha256Hex(password);
    await db.prepare(
      `
        INSERT INTO dashboard_users (
          id,
          name,
          email,
          password_hash,
          role,
          status,
          created_at,
          password_changed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(userId, nextName, email, passwordHash, "member", "active", createdAt, createdAt)
      .run();

    userRecord = {
      id: userId,
      name: nextName,
      email,
      role: "member",
      status: "active",
      password_hash: passwordHash,
      created_at: createdAt,
      last_login_at: null,
      password_changed_at: createdAt
    };
  }

  const acceptedAt = nowIso();
  const existingMembership = await firstRecord(
    db,
    `
      SELECT id
      FROM site_memberships
      WHERE site_id = ? AND user_id = ?
      LIMIT 1
    `,
    asString(invite.site_id),
    userId
  );

  if (existingMembership) {
    await db.prepare(
      `
        UPDATE site_memberships
        SET role = ?, status = 'active', invited_by_user_id = ?, updated_at = ?, joined_at = ?
        WHERE id = ?
      `
    )
      .bind(
        toSiteMemberRole(invite.role),
        asNullableString(invite.invited_by_user_id),
        acceptedAt,
        acceptedAt,
        asString(existingMembership.id)
      )
      .run();
  } else {
    await db.prepare(
      `
        INSERT INTO site_memberships (
          id, site_id, user_id, role, status, invited_by_user_id, created_at, updated_at, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        asString(invite.site_id),
        userId,
        toSiteMemberRole(invite.role),
        "active",
        asNullableString(invite.invited_by_user_id),
        acceptedAt,
        acceptedAt,
        acceptedAt
      )
      .run();
  }

  await db.prepare(
    `
      UPDATE site_invites
      SET status = 'accepted', accepted_at = ?, accepted_by_user_id = ?
      WHERE id = ?
    `
  )
    .bind(acceptedAt, userId, asString(invite.id))
    .run();

  await db.prepare(
    `
      UPDATE site_invites
      SET status = 'revoked', revoked_at = ?
      WHERE site_id = ? AND email = ? AND id != ? AND status = 'pending'
    `
  )
    .bind(acceptedAt, asString(invite.site_id), email, asString(invite.id))
    .run();

  return createSession(db, userId, userRecord);
}

export async function updateMyProfile(
  dbInput: DatabaseBinding | undefined,
  userId: string,
  input: { name?: string; email?: string; phone?: string; password?: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const target = await firstRecord(
    db,
    "SELECT id, name, email, phone FROM dashboard_users WHERE id = ? LIMIT 1",
    userId
  );
  if (!target) {
    throw new Error("User not found.");
  }

  const nextName = input.name?.trim() || asString(target.name);
  const nextEmail = input.email ? normalizeEmail(input.email) : asString(target.email);
  const nextPhone = input.phone !== undefined ? input.phone.trim() : asNullableString(target.phone);

  await db.prepare("UPDATE dashboard_users SET name = ?, email = ?, phone = ? WHERE id = ?")
    .bind(nextName, nextEmail, nextPhone || null, userId)
    .run();

  if (input.password && input.password.trim().length >= 8) {
    const passwordChangedAt = nowIso();
    await db.prepare(
      "UPDATE dashboard_users SET password_hash = ?, password_changed_at = ? WHERE id = ?"
    )
      .bind(await sha256Hex(input.password.trim()), passwordChangedAt, userId)
      .run();
    
    // Invalidate other sessions
    await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(userId).run();
  }

  return { success: true };
}

export async function getBootstrap(dbInput: DatabaseBinding | undefined, userId: string): Promise<BootstrapPayload> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const user = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, created_at, phone, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
    `,
    userId
  );
  if (!user) {
    throw new Error("User not found.");
  }

  let accessibleSites: any[] = [];
  if (user.role === "global_admin") {
    accessibleSites = await allRecords(
      db,
      `
        SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at, 'admin' as role
        FROM sites
        ORDER BY created_at ASC
      `
    );
  } else {
    accessibleSites = await allRecords(
      db,
      `
        SELECT s.id, s.org_id, s.org_name, s.project_id, s.project_name, s.name, s.environment, s.collector_url, s.created_at, sm.role
        FROM sites s
        INNER JOIN site_memberships sm ON sm.site_id = s.id
        WHERE sm.user_id = ? AND sm.status = 'active'
        ORDER BY s.created_at ASC
      `,
      userId
    );
  }

  const site = await getDefaultSite(db);
  const domains = await listSiteDomains(db, site.id);
  return {
    user: toDashboardUser(user),
    accessible_sites: accessibleSites.map(s => ({ ...s, id: asString(s.id) })),
    site,
    domains
  };
}

async function countGlobalAdmins(db: DatabaseBinding) {
  return countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'");
}

export async function getAdminOverview(dbInput: DatabaseBinding | undefined): Promise<AdminOverview> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const [
    users,
    admins,
    blockedUsers,
    activeSessions,
    sites,
    domains,
    apiKeys,
    collectedEvents,
    recentUsersRecords,
    recentSiteRecords
  ] = await Promise.all([
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE status = 'blocked'"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_sessions"),
    countRecords(db, "SELECT COUNT(*) AS count FROM sites"),
    countRecords(db, "SELECT COUNT(*) AS count FROM site_domains"),
    countRecords(db, "SELECT COUNT(*) AS count FROM site_keys"),
    countRecords(db, "SELECT COUNT(*) AS count FROM collected_events"),
    allRecords(
      db,
      `
        SELECT id, name, email, role, status, created_at, phone, last_login_at, password_changed_at
        FROM dashboard_users
        ORDER BY created_at DESC, email DESC
        LIMIT 6
      `
    ),
    allRecords(
      db,
      `
        SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
        FROM sites
        ORDER BY created_at DESC, name ASC
        LIMIT 6
      `
    )
  ]);

  return {
    totals: {
      users,
      admins,
      blocked_users: blockedUsers,
      active_sessions: activeSessions,
      sites,
      domains,
      api_keys: apiKeys,
      collected_events: collectedEvents
    },
    recent_users: recentUsersRecords.map(toDashboardUser),
    recent_sites: recentSiteRecords.map(toDashboardSite)
  };
}

export async function listAdminUsers(dbInput: DatabaseBinding | undefined): Promise<AdminUserRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const records = await allRecords(
    db,
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.last_login_at,
        u.password_changed_at,
        COUNT(s.id) AS session_count
      FROM dashboard_users u
      LEFT JOIN dashboard_sessions s ON s.user_id = u.id
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at, u.last_login_at, u.password_changed_at
      ORDER BY
        CASE WHEN u.role = 'global_admin' THEN 0 ELSE 1 END,
        u.created_at ASC,
        u.email ASC
    `
  );

  return records.map((record) => ({
    ...toDashboardUser(record),
    session_count: Number(record.session_count ?? 0)
  }));
}

export async function updateAdminUser(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  targetUserId: string,
  input: { role?: DashboardUserRole; status?: DashboardUserStatus }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const target = await firstRecord(
    db,
    "SELECT id, role, status FROM dashboard_users WHERE id = ? LIMIT 1",
    targetUserId
  );
  if (!target) {
    throw new Error("User not found.");
  }

  const nextRole = input.role ?? toDashboardUserRole(target.role);
  const nextStatus = input.status ?? toDashboardUserStatus(target.status);

  if (actorUserId === targetUserId && nextRole !== "global_admin") {
    throw new Error("You cannot remove your own admin role.");
  }

  if (actorUserId === targetUserId && nextStatus === "blocked") {
    throw new Error("You cannot block your own account.");
  }

  if (toDashboardUserRole(target.role) === "global_admin" && nextRole !== "global_admin") {
    const adminCount = await countGlobalAdmins(db);
    if (adminCount <= 1) {
      throw new Error("At least one global admin must remain.");
    }
  }

  await db.prepare("UPDATE dashboard_users SET role = ?, status = ? WHERE id = ?")
    .bind(nextRole, nextStatus, targetUserId)
    .run();

  if (nextStatus === "blocked") {
    await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();
  }

  const updated = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, created_at, phone, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
    `,
    targetUserId
  );

  if (!updated) {
    throw new Error("User not found after update.");
  }

  return toDashboardUser(updated);
}

export async function adminSetUserPassword(
  dbInput: DatabaseBinding | undefined,
  targetUserId: string,
  nextPassword: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  if (nextPassword.trim().length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const target = await firstRecord(db, "SELECT id FROM dashboard_users WHERE id = ? LIMIT 1", targetUserId);
  if (!target) {
    throw new Error("User not found.");
  }

  const passwordChangedAt = nowIso();
  await db.prepare(
    "UPDATE dashboard_users SET password_hash = ?, password_changed_at = ? WHERE id = ?"
  )
    .bind(await sha256Hex(nextPassword), passwordChangedAt, targetUserId)
    .run();

  await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();

  return { password_changed_at: passwordChangedAt };
}

export async function deleteAdminUser(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  targetUserId: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  if (actorUserId === targetUserId) {
    throw new Error("You cannot delete your own account.");
  }

  const target = await firstRecord(db, "SELECT id, role FROM dashboard_users WHERE id = ? LIMIT 1", targetUserId);
  if (!target) {
    return false;
  }

  if (toDashboardUserRole(target.role) === "global_admin") {
    const adminCount = await countGlobalAdmins(db);
    if (adminCount <= 1) {
      throw new Error("At least one global admin must remain.");
    }
  }

  await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();
  await db.prepare("DELETE FROM dashboard_users WHERE id = ?").bind(targetUserId).run();
  return true;
}

export async function listAdminSites(dbInput: DatabaseBinding | undefined): Promise<AdminSiteRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const siteRecords = await allRecords(
    db,
    `
      SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
      FROM sites
      ORDER BY created_at ASC, name ASC
    `
  );

  return Promise.all(
    siteRecords.map(async (siteRecord) => {
      const site = toDashboardSite(siteRecord);
      const [domains, apiKeys, metrics] = await Promise.all([
        listSiteDomains(db, site.id),
        listSiteKeys(db, site.id),
        firstRecord(
          db,
          `
            SELECT COUNT(*) AS collected_event_count, MAX(received_at) AS last_event_at
            FROM collected_events
            WHERE site_id = ?
          `,
          site.id
        )
      ]);

      return {
        ...site,
        domain_count: domains.length,
        api_key_count: apiKeys.length,
        collected_event_count: Number(metrics?.collected_event_count ?? 0),
        last_event_at: asNullableString(metrics?.last_event_at),
        domains,
        api_keys: apiKeys
      } satisfies AdminSiteRecord;
    })
  );
}

export async function createAdminSite(
  dbInput: DatabaseBinding | undefined,
  input: {
    name: string;
    domain?: string;
    org_name?: string;
    project_name?: string;
    environment?: string;
  }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const name = input.name.trim();
  const domain = input.domain ? normalizeDomain(input.domain) : "";
  const orgName = input.org_name?.trim() || DEFAULT_ORG_NAME;
  const projectName = input.project_name?.trim() || DEFAULT_PROJECT_NAME;
  const environment = (input.environment?.trim().toLowerCase() || DEFAULT_ENVIRONMENT) as string;

  if (name.length < 2) {
    throw new Error("Site name must contain at least 2 characters.");
  }

  if (domain) {
    const existingDomain = await firstRecord(db, "SELECT id FROM site_domains WHERE domain = ? LIMIT 1", domain);
    if (existingDomain) {
      throw new Error("This domain already exists.");
    }
  }

  const createdAt = nowIso();
  const siteId = `site_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const site = {
    id: siteId,
    org_id: `org_${toIdSegment(orgName, "open")}`,
    org_name: orgName,
    project_id: `project_${toIdSegment(projectName, "gateway")}`,
    project_name: projectName,
    name,
    environment,
    collector_url: "https://e.eventsgateway.com/v1/collect",
    created_at: createdAt
  } satisfies DashboardSite;

  await db.prepare(
    `
      INSERT INTO sites (
        id,
        org_id,
        org_name,
        project_id,
        project_name,
        name,
        environment,
        collector_url,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      site.id,
      site.org_id,
      site.org_name,
      site.project_id,
      site.project_name,
      site.name,
      site.environment,
      site.collector_url,
      site.created_at
    )
    .run();

  if (domain) {
    await db.prepare(
      `
        INSERT INTO site_domains (id, site_id, domain, kind, status, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        site.id,
        domain,
        "production",
        "verified",
        "Primary production domain",
        createdAt
      )
      .run();
  }

  const publicKey = createPublicKey();
  await db.prepare(
    `
      INSERT INTO site_keys (id, site_id, label, public_key, key_hash, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      crypto.randomUUID(),
      site.id,
      "Primary collect key",
      publicKey,
      await sha256Hex(publicKey),
      "active",
      createdAt
    )
    .run();

  return site;
}

export async function deleteAdminSite(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const site = await firstRecord(db, "SELECT id FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    return false;
  }

  if (siteId === DEFAULT_SITE_ID) {
    throw new Error("The primary production site cannot be deleted.");
  }

  await db.prepare("DELETE FROM site_domains WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_destinations WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_routes WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_route_versions WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_transformations WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_keys WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM collected_events WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM identity_profiles WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM sites WHERE id = ?").bind(siteId).run();
  return true;
}

export async function listSiteDomains(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, domain, kind, status, description, created_at
      FROM site_domains
      WHERE site_id = ?
      ORDER BY kind ASC, domain ASC
    `,
    siteId
  );
  return records.map(toSiteDomain);
}

export async function addSiteDomain(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { domain: string; kind?: string; description?: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const domain = normalizeDomain(input.domain);
  if (!domain) {
    throw new Error("Enter a valid domain.");
  }

  const existing = await firstRecord(db, "SELECT id FROM site_domains WHERE domain = ? LIMIT 1", domain);
  if (existing) {
    throw new Error("This domain already exists.");
  }

  const createdAt = nowIso();
  const record = {
    id: crypto.randomUUID(),
    site_id: siteId,
    domain,
    kind: (input.kind ?? "production").trim() || "production",
    status: "verified",
    description: input.description?.trim() || null,
    created_at: createdAt
  };

  await db.prepare(
    `
      INSERT INTO site_domains (id, site_id, domain, kind, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(record.id, record.site_id, record.domain, record.kind, record.status, record.description, record.created_at)
    .run();

  return record;
}

export async function deleteSiteDomain(dbInput: DatabaseBinding | undefined, siteId: string, domainId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const domain = await firstRecord(db, "SELECT id, domain FROM site_domains WHERE id = ? AND site_id = ? LIMIT 1", domainId, siteId);
  if (!domain) return false;

  const normalized = asString(domain.domain);
  if (normalized === "goldring.ro" || normalized === "www.goldring.ro") {
    throw new Error("The seeded production domains cannot be removed.");
  }

  await db.prepare("DELETE FROM site_domains WHERE id = ?").bind(domainId).run();
  return true;
}

export async function listSiteKeys(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, label, public_key, status, created_at, last_used_at
      FROM site_keys
      WHERE site_id = ?
      ORDER BY created_at ASC
    `,
    siteId
  );
  return records.map(toSiteKey);
}

function createDestinationSecretPreview(kind: string) {
  return `${kind}_***${Math.floor(Math.random() * 90 + 10)}`;
}

export async function listSiteDestinations(dbInput: DatabaseBinding | undefined, siteId: string): Promise<SiteDestination[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, name, kind, status, secret_preview, config_json, created_at, updated_at
      FROM site_destinations
      WHERE site_id = ?
      ORDER BY created_at DESC, name ASC
    `,
    siteId
  );
  return records.map(toSiteDestination);
}

export async function getSiteDestination(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  destinationId: string
): Promise<SiteDestination | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const record = await firstRecord(
    db,
    `
      SELECT id, site_id, name, kind, status, secret_preview, config_json, created_at, updated_at
      FROM site_destinations
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    destinationId
  );
  return record ? toSiteDestination(record) : null;
}

export async function createSiteDestination(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { name: string; kind: string; status?: string; config?: Record<string, unknown> }
): Promise<SiteDestination> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const site = await firstRecord(db, "SELECT id FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    throw new Error("Site not found.");
  }

  const name = input.name.trim();
  if (name.length < 2) {
    throw new Error("Destination name must contain at least 2 characters.");
  }

  const id = `dst_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const kind = toSiteDestinationKind(input.kind);
  const status = toSiteDestinationStatus(input.status);
  const createdAt = nowIso();

  await db.prepare(
    `
      INSERT INTO site_destinations (
        id, site_id, name, kind, status, secret_preview, config_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      id,
      siteId,
      name,
      kind,
      status,
      createDestinationSecretPreview(kind),
      JSON.stringify(input.config ?? {}),
      createdAt,
      createdAt
    )
    .run();

  const created = await getSiteDestination(db, siteId, id);
  if (!created) {
    throw new Error("Destination was created but could not be loaded.");
  }

  return created;
}

export async function updateSiteDestination(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  destinationId: string,
  patch: { name?: string; kind?: string; status?: string; config?: Record<string, unknown> }
): Promise<SiteDestination | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const current = await getSiteDestination(db, siteId, destinationId);
  if (!current) return null;

  const nextName = typeof patch.name === "string" && patch.name.trim() ? patch.name.trim() : current.name;
  const nextKind = patch.kind ? toSiteDestinationKind(patch.kind) : current.kind;
  const nextStatus = patch.status ? toSiteDestinationStatus(patch.status) : current.status;
  const nextConfig = patch.config ? patch.config : current.config;
  const nextSecretPreview = nextKind !== current.kind ? createDestinationSecretPreview(nextKind) : current.secret_preview;

  await db.prepare(
    `
      UPDATE site_destinations
      SET name = ?, kind = ?, status = ?, secret_preview = ?, config_json = ?, updated_at = ?
      WHERE site_id = ? AND id = ?
    `
  )
    .bind(
      nextName,
      nextKind,
      nextStatus,
      nextSecretPreview,
      JSON.stringify(nextConfig),
      nowIso(),
      siteId,
      destinationId
    )
    .run();

  return getSiteDestination(db, siteId, destinationId);
}

export async function deleteSiteDestination(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  destinationId: string
): Promise<boolean> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const existing = await getSiteDestination(db, siteId, destinationId);
  if (!existing) return false;
  await db.prepare("DELETE FROM site_destinations WHERE site_id = ? AND id = ?")
    .bind(siteId, destinationId)
    .run();
  return true;
}

export async function rotateSiteDestinationSecret(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  destinationId: string
): Promise<SiteDestination | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const current = await getSiteDestination(db, siteId, destinationId);
  if (!current) return null;
  await db.prepare(
    `
      UPDATE site_destinations
      SET secret_preview = ?, updated_at = ?
      WHERE site_id = ? AND id = ?
    `
  )
    .bind(createDestinationSecretPreview(current.kind), nowIso(), siteId, destinationId)
    .run();
  return getSiteDestination(db, siteId, destinationId);
}

export async function testSiteDestination(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  destinationId: string
): Promise<{ destination_id: string; ok: boolean; latency_ms: number; message: string }> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const destination = await getSiteDestination(db, siteId, destinationId);
  if (!destination) {
    return { destination_id: destinationId, ok: false, latency_ms: 0, message: "Destination not found." };
  }

  const startedAt = Date.now();
  try {
    const result = await dispatchManagedDestination({
      siteId,
      destinationId,
      configOverride: { kind: destination.kind, ...destination.config },
      event: {
        version: "1.0",
        event_id: crypto.randomUUID(),
        site_id: siteId,
        type: "PageView",
        source: "browser",
        environment: "production",
        timestamp: Date.now(),
        received_at: Date.now(),
        anonymous_id: crypto.randomUUID(),
        session_id: crypto.randomUUID(),
        page: {
          url: "https://eventsgateway.com/destination-test",
          path: "/destination-test",
          title: "Destination Test",
          referrer: "https://dash.eventsgateway.com/"
        },
        consent: {
          analytics: true,
          ads: true,
          functional: true
        },
        properties: { test_event: true }
      }
    });
    return {
      destination_id: destinationId,
      ok: result.ok,
      latency_ms: Date.now() - startedAt,
      message: result.ok
        ? `Destination ${destination.name} accepted a test dispatch.`
        : result.error ?? "Destination test failed."
    };
  } catch (error) {
    return {
      destination_id: destinationId,
      ok: false,
      latency_ms: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Destination test failed."
    };
  }
}

function buildSimulatedEvent(siteId: string, input: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">): EventGatewayEvent {
  const timestamp = typeof input.timestamp === "number" ? input.timestamp : Date.now();
  return {
    version: input.version ?? "1.0",
    event_id: input.event_id ?? crypto.randomUUID(),
    site_id: siteId,
    type: input.type,
    source: input.source,
    environment: input.environment,
    timestamp,
    received_at: typeof input.received_at === "number" ? input.received_at : timestamp,
    anonymous_id: input.anonymous_id ?? crypto.randomUUID(),
    session_id: input.session_id ?? crypto.randomUUID(),
    page: input.page,
    consent: input.consent ?? { analytics: true, ads: true, functional: true },
    properties: input.properties ?? {}
  };
}

async function compileSiteRouting(db: DatabaseBinding, siteId: string, version: number): Promise<CompiledSiteRoutingConfig> {
  const [routes, destinations, transformations] = await Promise.all([
    listSiteRoutes(db, siteId),
    listSiteDestinations(db, siteId),
    listSiteTransformations(db, siteId)
  ]);

  return compileRoutingConfig({
    site_id: siteId,
    version,
    routes,
    destinations: destinations.reduce<CompiledSiteRoutingConfig["destinations"]>((accumulator, destination) => {
      accumulator[destination.id] = {
        id: destination.id,
        kind: destination.kind,
        name: destination.name,
        enabled: destination.status === "active",
        config: destination.config
      };
      return accumulator;
    }, {}),
    transformations: transformations.reduce<CompiledSiteRoutingConfig["transformations"]>((accumulator, transformation) => {
      accumulator[transformation.id] = {
        id: transformation.id,
        name: transformation.name,
        version: transformation.version,
        destination_kind: transformation.destination_kind,
        enabled: transformation.status === "active",
        mapping: transformation.mapping
      };
      return accumulator;
    }, {})
  });
}

async function nextSiteRoutingVersion(db: DatabaseBinding, siteId: string) {
  const record = await firstRecord(db, "SELECT COALESCE(MAX(version), 0) AS version FROM site_route_versions WHERE site_id = ?", siteId);
  return asNumber(record?.version) + 1;
}

export async function listSiteRoutes(dbInput: DatabaseBinding | undefined, siteId: string): Promise<EventRoute[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, name, description, enabled, priority, environment, match_json, consent_required_json, sampling_json, destinations_json
      FROM site_routes
      WHERE site_id = ?
      ORDER BY priority ASC, created_at ASC
    `,
    siteId
  );
  return records.map(toSiteRoute);
}

export async function getSiteRoute(dbInput: DatabaseBinding | undefined, siteId: string, routeId: string): Promise<EventRoute | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const record = await firstRecord(
    db,
    `
      SELECT id, site_id, name, description, enabled, priority, environment, match_json, consent_required_json, sampling_json, destinations_json
      FROM site_routes
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    routeId
  );
  return record ? toSiteRoute(record) : null;
}

export async function createSiteRoute(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  route: Omit<EventRoute, "id" | "site_id">
): Promise<EventRoute> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const createdAt = nowIso();
  const id = `route_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  await db.prepare(
    `
      INSERT INTO site_routes (
        id, site_id, name, description, enabled, priority, environment, match_json, consent_required_json,
        sampling_json, destinations_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      id,
      siteId,
      route.name.trim(),
      route.description ?? null,
      route.enabled ? 1 : 0,
      route.priority,
      route.environment,
      JSON.stringify(route.match ?? {}),
      JSON.stringify(route.consent_required ?? {}),
      JSON.stringify(route.sampling ?? {}),
      JSON.stringify(route.destinations ?? []),
      createdAt,
      createdAt
    )
    .run();

  const created = await getSiteRoute(db, siteId, id);
  if (!created) {
    throw new Error("Route was created but could not be loaded.");
  }
  return created;
}

export async function updateSiteRoute(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  routeId: string,
  patch: Partial<EventRoute>
): Promise<EventRoute | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const current = await getSiteRoute(db, siteId, routeId);
  if (!current) return null;

  const nextRoute: EventRoute = {
    ...current,
    ...patch,
    id: current.id,
    site_id: current.site_id
  };

  await db.prepare(
    `
      UPDATE site_routes
      SET name = ?, description = ?, enabled = ?, priority = ?, environment = ?, match_json = ?,
          consent_required_json = ?, sampling_json = ?, destinations_json = ?, updated_at = ?
      WHERE site_id = ? AND id = ?
    `
  )
    .bind(
      nextRoute.name.trim(),
      nextRoute.description ?? null,
      nextRoute.enabled ? 1 : 0,
      nextRoute.priority,
      nextRoute.environment,
      JSON.stringify(nextRoute.match ?? {}),
      JSON.stringify(nextRoute.consent_required ?? {}),
      JSON.stringify(nextRoute.sampling ?? {}),
      JSON.stringify(nextRoute.destinations ?? []),
      nowIso(),
      siteId,
      routeId
    )
    .run();

  return getSiteRoute(db, siteId, routeId);
}

export async function deleteSiteRoute(dbInput: DatabaseBinding | undefined, siteId: string, routeId: string): Promise<boolean> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const existing = await getSiteRoute(db, siteId, routeId);
  if (!existing) return false;
  await db.prepare("DELETE FROM site_routes WHERE site_id = ? AND id = ?").bind(siteId, routeId).run();
  return true;
}

export async function duplicateSiteRoute(dbInput: DatabaseBinding | undefined, siteId: string, routeId: string): Promise<EventRoute | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const current = await getSiteRoute(db, siteId, routeId);
  if (!current) return null;
  return createSiteRoute(db, siteId, {
    ...current,
    name: `${current.name} Copy`,
    priority: current.priority + 1
  });
}

export async function listSiteRouteVersions(dbInput: DatabaseBinding | undefined, siteId: string): Promise<SiteRouteVersion[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT version, active, created_at
      FROM site_route_versions
      WHERE site_id = ?
      ORDER BY version DESC
    `,
    siteId
  );
  return records.map(toSiteRouteVersion);
}

export async function getSiteCompiledRouting(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  env?: Pick<EnvironmentBindings, "CACHE">
): Promise<CompiledSiteRoutingConfig> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const cacheKey = buildCompiledRoutingCacheKey(siteId);
  const cached = await readJsonCache<CompiledSiteRoutingConfig>(env, cacheKey);
  if (cached) {
    return cached;
  }

  const activeRecord = await firstRecord(
    db,
    `
      SELECT version, config_json, created_at
      FROM site_route_versions
      WHERE site_id = ? AND active = 1
      ORDER BY version DESC
      LIMIT 1
    `,
    siteId
  );
  if (activeRecord) {
    const compiled = toCompiledSiteRoutingConfig(activeRecord);
    await writeJsonCache(env, cacheKey, compiled, COMPILED_ROUTING_CACHE_TTL_SECONDS);
    return compiled;
  }

  const version = await nextSiteRoutingVersion(db, siteId);
  const compiled = await compileSiteRouting(db, siteId, Math.max(1, version - 1));
  await writeJsonCache(env, cacheKey, compiled, COMPILED_ROUTING_CACHE_TTL_SECONDS);
  return compiled;
}

export async function publishSiteRoutes(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  env?: Pick<EnvironmentBindings, "CACHE">
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const version = await nextSiteRoutingVersion(db, siteId);
  const config = await compileSiteRouting(db, siteId, version);
  const createdAt = nowIso();

  await db.prepare("UPDATE site_route_versions SET active = 0 WHERE site_id = ?").bind(siteId).run();
  await db.prepare(
    `
      INSERT INTO site_route_versions (site_id, version, active, config_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
  )
    .bind(siteId, version, 1, JSON.stringify(config), createdAt)
    .run();

  await writeJsonCache(env, buildCompiledRoutingCacheKey(siteId), config, COMPILED_ROUTING_CACHE_TTL_SECONDS);
  return { version, config };
}

export async function rollbackSiteRoutes(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  version?: number,
  env?: Pick<EnvironmentBindings, "CACHE">
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const active = await firstRecord(
    db,
    `
      SELECT version
      FROM site_route_versions
      WHERE site_id = ? AND active = 1
      ORDER BY version DESC
      LIMIT 1
    `,
    siteId
  );
  const target = version
    ? await firstRecord(db, "SELECT version, config_json, created_at FROM site_route_versions WHERE site_id = ? AND version = ? LIMIT 1", siteId, version)
    : await firstRecord(
      db,
      `
        SELECT version, config_json, created_at
        FROM site_route_versions
        WHERE site_id = ? AND version < ?
        ORDER BY version DESC
        LIMIT 1
      `,
      siteId,
      asNumber(active?.version)
    );

  if (!target) {
    const compiled = await getSiteCompiledRouting(db, siteId, env);
    return { version: compiled.version, config: compiled };
  }

  await db.prepare("UPDATE site_route_versions SET active = 0 WHERE site_id = ?").bind(siteId).run();
  await db.prepare("UPDATE site_route_versions SET active = 1 WHERE site_id = ? AND version = ?").bind(siteId, asNumber(target.version)).run();
  const compiled = toCompiledSiteRoutingConfig(target);
  await writeJsonCache(env, buildCompiledRoutingCacheKey(siteId), compiled, COMPILED_ROUTING_CACHE_TTL_SECONDS);
  return { version: asNumber(target.version), config: compiled };
}

export async function simulateSiteRoute(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  routeId: string,
  event: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const routes = routeId === "all"
    ? await listSiteRoutes(db, siteId)
    : (await getSiteRoute(db, siteId, routeId)) ? [await getSiteRoute(db, siteId, routeId) as EventRoute] : [];
  return simulateRoutes(buildSimulatedEvent(siteId, event), routes);
}

export async function listSiteTransformations(dbInput: DatabaseBinding | undefined, siteId: string): Promise<SiteTransformation[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, name, destination_kind, status, version, mapping_json, created_at, updated_at
      FROM site_transformations
      WHERE site_id = ?
      ORDER BY created_at DESC, name ASC
    `,
    siteId
  );
  return records.map(toSiteTransformation);
}

export async function getSiteTransformation(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  transformationId: string
): Promise<SiteTransformation | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const record = await firstRecord(
    db,
    `
      SELECT id, site_id, name, destination_kind, status, version, mapping_json, created_at, updated_at
      FROM site_transformations
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    transformationId
  );
  return record ? toSiteTransformation(record) : null;
}

export async function createSiteTransformation(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { name: string; destination_kind: string; status?: string; mapping?: Record<string, unknown> }
): Promise<SiteTransformation> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const createdAt = nowIso();
  const id = `tf_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  await db.prepare(
    `
      INSERT INTO site_transformations (
        id, site_id, name, destination_kind, status, version, mapping_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      id,
      siteId,
      input.name.trim(),
      toSiteDestinationKind(input.destination_kind),
      toSiteTransformationStatus(input.status),
      1,
      JSON.stringify(input.mapping ?? {}),
      createdAt,
      createdAt
    )
    .run();

  const created = await getSiteTransformation(db, siteId, id);
  if (!created) {
    throw new Error("Transformation was created but could not be loaded.");
  }
  return created;
}

export async function updateSiteTransformation(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  transformationId: string,
  patch: { name?: string; destination_kind?: string; status?: string; mapping?: Record<string, unknown> }
): Promise<SiteTransformation | null> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const current = await getSiteTransformation(db, siteId, transformationId);
  if (!current) return null;
  const nextName = typeof patch.name === "string" && patch.name.trim() ? patch.name.trim() : current.name;
  const nextDestinationKind = patch.destination_kind ? toSiteDestinationKind(patch.destination_kind) : current.destination_kind;
  const nextStatus = patch.status ? toSiteTransformationStatus(patch.status) : current.status;
  const nextMapping = patch.mapping ?? current.mapping;
  const nextVersion = JSON.stringify(nextMapping) !== JSON.stringify(current.mapping) ? current.version + 1 : current.version;

  await db.prepare(
    `
      UPDATE site_transformations
      SET name = ?, destination_kind = ?, status = ?, version = ?, mapping_json = ?, updated_at = ?
      WHERE site_id = ? AND id = ?
    `
  )
    .bind(
      nextName,
      nextDestinationKind,
      nextStatus,
      nextVersion,
      JSON.stringify(nextMapping),
      nowIso(),
      siteId,
      transformationId
    )
    .run();

  return getSiteTransformation(db, siteId, transformationId);
}

export async function deleteSiteTransformation(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  transformationId: string
): Promise<boolean> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const existing = await getSiteTransformation(db, siteId, transformationId);
  if (!existing) return false;
  await db.prepare("DELETE FROM site_transformations WHERE site_id = ? AND id = ?").bind(siteId, transformationId).run();
  return true;
}

export async function createAdminSiteKey(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { label: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const site = await firstRecord(db, "SELECT id FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    throw new Error("Site not found.");
  }

  const label = input.label.trim();
  if (label.length < 2) {
    throw new Error("Key label must contain at least 2 characters.");
  }

  const createdAt = nowIso();
  const publicKey = createPublicKey();
  const record = {
    id: crypto.randomUUID(),
    site_id: siteId,
    label,
    public_key: publicKey,
    status: "active",
    created_at: createdAt,
    last_used_at: null
  } satisfies SiteKey;

  await db.prepare(
    `
      INSERT INTO site_keys (id, site_id, label, public_key, key_hash, status, created_at, last_used_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      record.id,
      record.site_id,
      record.label,
      record.public_key,
      await sha256Hex(record.public_key),
      record.status,
      record.created_at,
      record.last_used_at
    )
    .run();

  return record;
}

export async function revokeAdminSiteKey(dbInput: DatabaseBinding | undefined, siteId: string, keyId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const key = await firstRecord(
    db,
    `
      SELECT id, site_id, label, public_key, status, created_at, last_used_at
      FROM site_keys
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    keyId
  );
  if (!key) {
    return null;
  }

  if (asString(key.status) === "active") {
    const activeKeyCount = await countRecords(
      db,
      "SELECT COUNT(*) AS count FROM site_keys WHERE site_id = ? AND status = 'active'",
      siteId
    );
    if (activeKeyCount <= 1) {
      throw new Error("At least one active collector key must remain.");
    }

    await db.prepare("UPDATE site_keys SET status = 'revoked' WHERE id = ?").bind(keyId).run();
  }

  return {
    ...toSiteKey(key),
    status: asString(key.status) === "active" ? "revoked" : asString(key.status)
  } satisfies SiteKey;
}

export async function getPrimarySiteKey(dbInput: DatabaseBinding | undefined, siteId: string) {
  const keys = await listSiteKeys(dbInput, siteId);
  const key = keys.find((item) => item.status === "active");
  if (!key) {
    throw new Error("No active site key exists.");
  }

  return key;
}

export async function getInstallConfigFromDb(dbInput: DatabaseBinding | undefined, siteId: string) {
  const site = await getDefaultSite(dbInput);
  if (site.id !== siteId) {
    throw new Error("Site not found.");
  }

  const key = await getPrimarySiteKey(dbInput, siteId);
  const loaderUrl = site.collector_url.replace(/\/v1\/collect$/, "/tracker.js");
  const snippet = `<script src="${loaderUrl}" data-site-id="${site.id}" data-api-key="${key.public_key}" data-endpoint="${site.collector_url}" async></script>`;

  return {
    collector_url: site.collector_url,
    loader_url: loaderUrl,
    npm_package: "@eventsgateway/tracker-sdk",
    site_id: site.id,
    site_name: site.name,
    public_key: key.public_key,
    sdk_loader: snippet,
    sample_init: [
      "window.eventsgateway.track({",
      "  type: 'Purchase',",
      "  ecommerce: { order_id: 'ORDER-1001', value: 249.99, currency: 'RON' },",
      "  properties: { plan: 'pro' }",
      "});"
    ].join("\n")
  };
}

export async function validateCollectAccess(
  dbInput: DatabaseBinding | undefined,
  input: { siteId: string; apiKey: string; origin?: string | null },
  env?: Pick<EnvironmentBindings, "CACHE">
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const normalizedOrigin = input.origin ? normalizeDomain(input.origin) : "";
  const keyHash = await sha256Hex(input.apiKey);
  const cacheKey = buildCollectAccessCacheKey(input.siteId, keyHash, normalizedOrigin);
  const cached = await readJsonCache<CollectAccessAuthorization>(env, cacheKey);
  if (cached) {
    void db.prepare("UPDATE site_keys SET last_used_at = ? WHERE id = ?").bind(nowIso(), cached.site_key_id).run();
    return {
      site_id: cached.site_id,
      site_name: cached.site_name,
      origin_domain: cached.origin_domain
    };
  }

  const site = await firstRecord(db, "SELECT id, name FROM sites WHERE id = ? LIMIT 1", input.siteId);
  if (!site) return null;

  const key = await firstRecord(
    db,
    "SELECT id FROM site_keys WHERE site_id = ? AND key_hash = ? AND status = 'active' LIMIT 1",
    input.siteId,
    keyHash
  );
  if (!key) return null;

  if (normalizedOrigin) {
    const allowed = await firstRecord(
      db,
      "SELECT id FROM site_domains WHERE site_id = ? AND domain = ? LIMIT 1",
      input.siteId,
      normalizedOrigin
    );
    if (!allowed) return null;
  }

  await db.prepare("UPDATE site_keys SET last_used_at = ? WHERE id = ?").bind(nowIso(), asString(key.id)).run();
  const authorization = {
    site_id: asString(site.id),
    site_name: asString(site.name),
    origin_domain: normalizedOrigin || null
  };
  await writeJsonCache(
    env,
    cacheKey,
    {
      ...authorization,
      site_key_id: asString(key.id)
    } satisfies CollectAccessAuthorization,
    COLLECT_ACCESS_CACHE_TTL_SECONDS
  );
  return authorization;
}

export async function storeCollectedEvent(
  dbInput: DatabaseBinding | undefined,
  input: {
    siteId: string;
    originDomain?: string | null;
    visitorStateSnapshot?: VisitorStateSnapshot | null;
    ledgerR2Key?: string | null;
    env?: Pick<EnvironmentBindings, "CACHE">;
    event: {
      event_id?: string;
      type: string;
      source: string;
      environment: string;
      canonical_user_id?: string;
      anonymous_id?: string;
      session_id?: string;
      page?: { path?: string; url?: string };
      destination?: string;
      consent?: { analytics?: boolean; ads?: boolean; functional?: boolean };
      payload: unknown;
    };
  }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const receivedAt = nowIso();
  const eventId = input.event.event_id?.trim() || crypto.randomUUID();
  const collectedEventId = crypto.randomUUID();
  const runtimeEvent = buildStoredRuntimeEvent(input.siteId, {
    ...input.event,
    event_id: eventId
  });
  const explicitRouting = Array.isArray(runtimeEvent.routing?.destination_ids) && runtimeEvent.routing.destination_ids.length > 0;
  const compiledConfig = explicitRouting ? null : await getSiteCompiledRouting(db, input.siteId, input.env);
  const routePlan = compiledConfig ? routePlanFromCompiledConfig(runtimeEvent, compiledConfig) : null;
  const persistedEvent: EventGatewayEvent = routePlan
    ? {
      ...runtimeEvent,
      routing: {
        route_ids: routePlan.route_ids,
        destination_ids: routePlan.deliveries.map((delivery) => delivery.destination_id),
        route_trace_id: routePlan.trace_id
      }
    }
    : runtimeEvent;

  const deliveryTargets = routePlan
    ? routePlan.deliveries.map((delivery) => ({
      routeId: delivery.route_id,
      destinationId: delivery.destination_id,
      transformId: delivery.transform_id ?? null,
      deliveryMode: delivery.delivery_mode
    }))
    : getDeliveryTargets(persistedEvent, input.event.destination ?? null).map((target) => ({
      ...target,
      transformId: null,
      deliveryMode: "queued"
    }));
  const deliveryAttemptIds = deliveryTargets.map(() => crypto.randomUUID());

  await db.prepare(
    `
      INSERT INTO collected_events (
        id,
        site_id,
        event_id,
        event_type,
        source,
        environment,
        canonical_user_id,
        anonymous_id,
        session_id,
        page_path,
        page_url,
        origin_domain,
        destination,
        status,
        consent_analytics,
        consent_ads,
        consent_functional,
        payload_json,
        visitor_state_json,
        ledger_r2_key,
        received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      collectedEventId,
      input.siteId,
      eventId,
      input.event.type,
      input.event.source,
      input.event.environment,
      input.event.canonical_user_id ?? null,
      input.event.anonymous_id ?? null,
      input.event.session_id ?? null,
      input.event.page?.path ?? null,
      input.event.page?.url ?? null,
      input.originDomain ?? null,
      input.event.destination ?? null,
      "accepted",
      input.event.consent?.analytics ? 1 : 0,
      input.event.consent?.ads ? 1 : 0,
      input.event.consent?.functional ? 1 : 0,
      JSON.stringify(persistedEvent),
      input.visitorStateSnapshot ? JSON.stringify(input.visitorStateSnapshot) : null,
      input.ledgerR2Key ?? null,
      receivedAt
    )
    .run();

  const deliveryStatements = deliveryTargets.map((target, index) => (
    db.prepare(
      `
        INSERT INTO delivery_attempts (
          id,
          site_id,
          collected_event_id,
          event_id,
          route_id,
          destination_id,
          transform_id,
          delivery_mode,
          status,
          latency_ms,
          attempts,
          last_error,
          queued_at,
          sent_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        deliveryAttemptIds[index],
        input.siteId,
        collectedEventId,
        eventId,
        target.routeId,
        target.destinationId,
        target.transformId,
        target.deliveryMode,
        "pending",
        null,
        0,
        null,
        receivedAt,
        null,
        receivedAt
      )
  ));
  await db.batch(deliveryStatements);

  if (input.event.canonical_user_id) {
    const existing = await firstRecord(
      db,
      `
        SELECT anonymous_ids_json, session_ids_json
        FROM identity_profiles
        WHERE site_id = ? AND canonical_user_id = ?
        LIMIT 1
      `,
      input.siteId,
      input.event.canonical_user_id
    );

    const anonymousIds = new Set<string>(
      existing?.anonymous_ids_json ? (JSON.parse(asString(existing.anonymous_ids_json)) as string[]) : []
    );
    const sessionIds = new Set<string>(
      existing?.session_ids_json ? (JSON.parse(asString(existing.session_ids_json)) as string[]) : []
    );

    if (input.event.anonymous_id) anonymousIds.add(input.event.anonymous_id);
    if (input.event.session_id) sessionIds.add(input.event.session_id);

    await db.prepare(
      `
        INSERT INTO identity_profiles (
          site_id,
          canonical_user_id,
          anonymous_ids_json,
          session_ids_json,
          consent_analytics,
          consent_ads,
          consent_functional,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(site_id, canonical_user_id) DO UPDATE SET
          anonymous_ids_json = excluded.anonymous_ids_json,
          session_ids_json = excluded.session_ids_json,
          consent_analytics = excluded.consent_analytics,
          consent_ads = excluded.consent_ads,
          consent_functional = excluded.consent_functional,
          updated_at = excluded.updated_at
      `
    )
      .bind(
        input.siteId,
        input.event.canonical_user_id,
        JSON.stringify(Array.from(anonymousIds)),
        JSON.stringify(Array.from(sessionIds)),
        input.event.consent?.analytics ? 1 : 0,
        input.event.consent?.ads ? 1 : 0,
        input.event.consent?.functional ? 1 : 0,
        receivedAt
      )
      .run();
  }

  return {
    accepted: true,
    collected_event_id: collectedEventId,
    delivery_attempt_ids: deliveryAttemptIds,
    site_id: input.siteId,
    event_id: eventId,
    received_at: receivedAt,
    visitor_state_snapshot: input.visitorStateSnapshot ?? null,
    ledger_r2_key: input.ledgerR2Key ?? null
  } satisfies StoredCollectedEvent;
}
