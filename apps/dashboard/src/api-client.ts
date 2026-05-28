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
type UsersListData = ReturnType<typeof listUsers>;
type JourneysData = ReturnType<typeof getJourneys>;
type ConsentData = ReturnType<typeof getConsent>;
type InstallData = ReturnType<typeof getInstallConfig> & {
  site_id: string;
  site_name: string;
  public_key: string;
};
type QueuesData = ReturnType<typeof getQueues>;
type JobsData = ReturnType<typeof listJobs>;
type DestinationDetailData = ReturnType<typeof getDestination>;
type DlqData = ReturnType<typeof getDlq>;
type RouteDetailData = ReturnType<typeof getRoute>;
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
const SESSION_TOKEN_STORAGE_KEY = "eventsgateway-dashboard-session-token-v2";

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

export function registerDashboardUser(input: { name: string; email: string; password: string }) {
  return requestJson<{ user: DashboardUser; session: DashboardSession }>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function loginDashboardUser(input: { email: string; password: string }) {
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

export function fetchTransformations(siteId: string): Promise<TransformationsListData> {
  return requestJson<TransformationsListData>(`/v1/sites/${siteId}/transformations`);
}

export function fetchTransformationDetail(siteId: string, transformationId: string): Promise<TransformationDetailData> {
  return requestJson<TransformationDetailData>(`/v1/sites/${siteId}/transformations/${transformationId}`);
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
