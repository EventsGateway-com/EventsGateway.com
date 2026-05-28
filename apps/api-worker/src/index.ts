import {
  backfillAttribution,
  createDestination,
  createRoute,
  deleteDestination,
  deleteRoute,
  duplicateRoute,
  exportRaw,
  getCompiledRouting,
  getConsent,
  getDestination,
  getDlq,
  getEvent,
  getHealth,
  getInstallConfig,
  getJob,
  getJourneys,
  getOverview,
  getQueues,
  getRealtime,
  getRoute,
  getTransformation,
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
  publishRoutes,
  replayDlq,
  replayEvent,
  rollbackRoutes,
  rotateDestinationSecret,
  simulateRoute,
  testDestination,
  updateDestination,
  updateRoute,
  validateEvent
} from "../../../packages/platform-data/src/index";
import {
  createRequestContext,
  ensureMethod,
  errorResponse,
  json,
  notFound,
  ok,
  pathSegments,
  readJson,
  withAuth,
  withOptions,
  type EnvironmentBindings
} from "../../../packages/runtime/src/index";
import type { EventGatewayEvent, EventRoute } from "../../../packages/schemas/src/index";
import type { DateRangePreset } from "../../../packages/shared/src/index";

type MutableRoute = Omit<EventRoute, "id" | "site_id">;

function siteIdFromSegments(segments: string[]) {
  return segments[2];
}

async function routeRequest(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const authResponse = withAuth(request, env, context);
  if (authResponse) return authResponse;

  const segments = pathSegments(context);
  const method = context.method;

  if (segments.length === 1 && segments[0] === "health") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, { service: "api-worker", status: "healthy" });
  }

  if (segments[0] !== "v1" || segments[1] !== "sites" || !segments[2]) {
    return notFound(context, `Unknown API route: ${context.url.pathname}`);
  }

  const siteId = siteIdFromSegments(segments);

  if (segments[3] === "overview" && method === "GET") {
    const range = (context.url.searchParams.get("range") ?? "24h") as DateRangePreset;
    return json(context, getOverview(siteId, range));
  }

  if (segments[3] === "realtime" && method === "GET") {
    return json(context, getRealtime(siteId));
  }

  if (segments[3] === "compiled-routing" && method === "GET") {
    return json(context, getCompiledRouting(siteId));
  }

  if (segments[3] === "routes" && segments.length === 4) {
    if (method === "GET") return json(context, listRoutes(siteId));
    if (method === "POST") return json(context, createRoute(siteId, await readJson<MutableRoute>(request)), { status: 201 });
  }

  if (segments[3] === "routes" && segments[4] === "publish" && method === "POST") {
    return json(context, publishRoutes(siteId));
  }

  if (segments[3] === "routes" && segments[4] === "versions" && method === "GET") {
    return json(context, listRouteVersions(siteId));
  }

  if (segments[3] === "routes" && segments[4] === "rollback" && method === "POST") {
    const body = await readJson<{ version?: number }>(request);
    return json(context, rollbackRoutes(siteId, body.version));
  }

  if (segments[3] === "routes" && segments[4]) {
    const routeId = segments[4];
    if (segments[5] === "duplicate" && method === "POST") {
      const route = duplicateRoute(siteId, routeId);
      return route ? json(context, route, { status: 201 }) : notFound(context, `Route ${routeId} not found`);
    }

    if (segments[5] === "simulate" && method === "POST") {
      const body = await readJson<Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">>(request);
      return json(context, simulateRoute(siteId, routeId, body));
    }

    if (method === "GET") {
      const route = getRoute(siteId, routeId);
      return route ? json(context, route) : notFound(context, `Route ${routeId} not found`);
    }

    if (method === "PATCH") {
      const route = updateRoute(siteId, routeId, await readJson<Partial<EventRoute>>(request));
      return route ? json(context, route) : notFound(context, `Route ${routeId} not found`);
    }

    if (method === "DELETE") {
      return deleteRoute(siteId, routeId) ? json(context, { deleted: true }) : notFound(context, `Route ${routeId} not found`);
    }
  }

  if (segments[3] === "destinations" && segments.length === 4) {
    if (method === "GET") return json(context, listDestinations(siteId));
    if (method === "POST") {
      const body = await readJson<Omit<ReturnType<typeof listDestinations>[number], "id" | "site_id" | "secret_preview">>(request);
      return json(context, createDestination(siteId, body), { status: 201 });
    }
  }

  if (segments[3] === "destinations" && segments[4]) {
    const destinationId = segments[4];
    if (segments[5] === "test" && method === "POST") return json(context, testDestination(siteId, destinationId));
    if (segments[5] === "rotate-secret" && method === "POST") {
      const destination = rotateDestinationSecret(siteId, destinationId);
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "GET") {
      const destination = getDestination(siteId, destinationId);
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "PATCH") {
      const destination = updateDestination(siteId, destinationId, await readJson<Record<string, unknown>>(request));
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "DELETE") {
      return deleteDestination(siteId, destinationId)
        ? json(context, { deleted: true })
        : notFound(context, `Destination ${destinationId} not found`);
    }
  }

  if (segments[3] === "transformations" && segments.length === 4 && method === "GET") {
    return json(context, listTransformations(siteId));
  }

  if (segments[3] === "transformations" && segments[4] && method === "GET") {
    const transformation = getTransformation(siteId, segments[4]);
    return transformation ? json(context, transformation) : notFound(context, `Transformation ${segments[4]} not found`);
  }

  if (segments[3] === "events" && segments[4] === "recent" && method === "GET") {
    return json(context, listEvents(siteId));
  }

  if (segments[3] === "events" && segments[4] === "schemas" && method === "GET") {
    return json(context, listSchemas(siteId));
  }

  if (segments[3] === "events" && segments[4] === "debug" && method === "POST") {
    const body = await readJson<Partial<EventGatewayEvent>>(request);
    return json(context, { valid: validateEvent(body), sample: body });
  }

  if (segments[3] === "events" && segments[4] === "validate" && method === "POST") {
    return json(context, validateEvent(await readJson<Partial<EventGatewayEvent>>(request)));
  }

  if (segments[3] === "events" && segments[4] && method === "GET") {
    const event = getEvent(siteId, segments[4]);
    return event ? json(context, event) : notFound(context, `Event ${segments[4]} not found`);
  }

  if (segments[3] === "deliveries" && segments.length === 4 && method === "GET") {
    return json(context, listDeliveries(siteId));
  }

  if (segments[3] === "identity" && segments[4] === "users" && method === "GET") {
    return json(context, listUsers(siteId));
  }

  if (segments[3] === "identity" && segments[4] === "journeys" && segments[5] && method === "GET") {
    return json(context, getJourneys(siteId, segments[5]));
  }

  if (segments[3] === "identity" && segments[4] === "consent" && method === "GET") {
    return json(context, getConsent(siteId));
  }

  if (segments[3] === "settings" && segments[4] === "install" && method === "GET") {
    return json(context, getInstallConfig(siteId));
  }

  if (segments[3] === "operations" && segments[4] === "health" && method === "GET") {
    return json(context, getHealth(siteId));
  }

  if (segments[3] === "operations" && segments[4] === "queues" && method === "GET") {
    return json(context, getQueues(siteId));
  }

  if (segments[3] === "operations" && segments[4] === "dlq" && segments.length === 5 && method === "GET") {
    return json(context, getDlq(siteId));
  }

  if (segments[3] === "operations" && segments[4] === "dlq" && segments[5] === "replay" && method === "POST") {
    return json(context, replayDlq(siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "replay" && method === "POST") {
    const body = await readJson<{ event_id: string }>(request);
    const result = replayEvent(siteId, body.event_id);
    return result ? json(context, result, { status: 202 }) : notFound(context, `Event ${body.event_id} not found`);
  }

  if (segments[3] === "operations" && segments[4] === "backfill-attribution" && method === "POST") {
    return json(context, backfillAttribution(siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "export" && method === "POST") {
    return json(context, exportRaw(siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "jobs" && segments[5] && method === "GET") {
    const job = getJob(siteId, segments[5]);
    return job ? json(context, job) : notFound(context, `Job ${segments[5]} not found`);
  }

  if (segments[3] === "operations" && segments[4] === "jobs" && method === "GET") {
    return json(context, listJobs(siteId));
  }

  if (segments[3] === "operations" && segments[4] === "flush-forwarder" && method === "POST") {
    return json(context, { processed: processPendingDeliveries(siteId) }, { status: 202 });
  }

  const methodResponse = ensureMethod(context, []);
  if (methodResponse) return methodResponse;
  return notFound(context, `Unknown API route: ${context.url.pathname}`);
}

export default {
  async fetch(request: Request, env?: EnvironmentBindings) {
    return routeRequest(request, env);
  }
};
