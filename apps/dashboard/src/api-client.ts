import {
  backfillAttribution,
  exportRaw,
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
  processPendingDeliveries,
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

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/$/, "");
const API_TOKEN = import.meta.env.VITE_API_TOKEN as string | undefined;

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, fallback: () => T | Promise<T>, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(API_TOKEN ? { "x-api-token": API_TOKEN } : {}),
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as Envelope<T>;
    return payload.data;
  } catch {
    return fallback();
  }
}

export function fetchOverview(siteId: string, range: DateRangePreset) {
  return requestJson(`/v1/sites/${siteId}/overview?range=${encodeURIComponent(range)}`, () => getOverview(siteId, range));
}

export function fetchRealtime(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/realtime`, () => getRealtime(siteId));
}

export function fetchEvents(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/events/recent`, () => listEvents(siteId));
}

export function fetchSchemas(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/events/schemas`, () => listSchemas(siteId));
}

export function fetchRoutes(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/routes`, () => listRoutes(siteId)).then(async (routes) => {
    const [versions, compiledConfig, events] = await Promise.all([
      requestJson(`/v1/sites/${siteId}/routes/versions`, () => listRouteVersions(siteId)),
      requestJson(`/v1/sites/${siteId}/compiled-routing`, () => getCompiledRouting(siteId)),
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

    const routeSimulation = await requestJson(
      `/v1/sites/${siteId}/routes/all/simulate`,
      () => simulateRoute(siteId, "all", simulationBody as Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">),
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

export function fetchRouteDetail(siteId: string, routeId: string) {
  return requestJson(`/v1/sites/${siteId}/routes/${routeId}`, () => getRoute(siteId, routeId));
}

export function fetchDeliveries(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/deliveries`, () => listDeliveries(siteId)).then(async (deliveries) => {
    const routes = await requestJson(`/v1/sites/${siteId}/routes`, () => listRoutes(siteId));
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

export function fetchEvent(siteId: string, eventId: string) {
  return requestJson(`/v1/sites/${siteId}/events/${eventId}`, () => getEvent(siteId, eventId));
}

export function fetchHealth(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/operations/health`, () => getHealth(siteId));
}

export function fetchDestinations(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/destinations`, () => listDestinations(siteId));
}

export function fetchTransformations(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/transformations`, () => listTransformations(siteId));
}

export function fetchTransformationDetail(siteId: string, transformationId: string) {
  return requestJson(`/v1/sites/${siteId}/transformations/${transformationId}`, () => getTransformation(siteId, transformationId));
}

export function fetchUsers(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/identity/users`, () => listUsers(siteId));
}

export function fetchJourneys(siteId: string, canonicalUserId: string) {
  return requestJson(`/v1/sites/${siteId}/identity/journeys/${canonicalUserId}`, () => getJourneys(siteId, canonicalUserId));
}

export function fetchConsent(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/identity/consent`, () => getConsent(siteId));
}

export function fetchInstall(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/settings/install`, () => getInstallConfig(siteId));
}

export function fetchQueues(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/operations/queues`, () => getQueues(siteId));
}

export function fetchJobs(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/operations/jobs`, () => listJobs(siteId));
}

export function fetchDestinationDetail(siteId: string, destinationId: string) {
  return requestJson(`/v1/sites/${siteId}/destinations/${destinationId}`, () => getDestination(siteId, destinationId));
}

export function fetchDlq(siteId: string) {
  return requestJson(`/v1/sites/${siteId}/operations/dlq`, () => getDlq(siteId));
}

export function replayDlqAction(siteId: string) {
  return requestJson(
    `/v1/sites/${siteId}/operations/dlq/replay`,
    () => replayDlq(siteId),
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function replayEventAction(siteId: string, eventId: string) {
  return requestJson(
    `/v1/sites/${siteId}/operations/replay`,
    () => replayEvent(siteId, eventId),
    { method: "POST", body: JSON.stringify({ event_id: eventId }) }
  );
}

export function flushForwarderAction(siteId: string) {
  return requestJson(
    `/v1/sites/${siteId}/operations/flush-forwarder`,
    () => ({ processed: processPendingDeliveries(siteId) }),
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function backfillAttributionAction(siteId: string) {
  return requestJson(
    `/v1/sites/${siteId}/operations/backfill-attribution`,
    () => backfillAttribution(siteId),
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function exportRawAction(siteId: string) {
  return requestJson(
    `/v1/sites/${siteId}/operations/export`,
    () => exportRaw(siteId),
    { method: "POST", body: JSON.stringify({}) }
  );
}
