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
  addSiteDomain,
  adminSetUserPassword,
  createUserSession,
  deleteAdminUser,
  deleteSiteDomain,
  ensureControlPlane,
  getAdminOverview,
  getBootstrap,
  getInstallConfigFromDb,
  getSessionByToken,
  listAdminSites,
  listAdminUsers,
  listSiteDomains,
  listSiteKeys,
  loginUserSession,
  revokeSession,
  updateAdminUser
} from "../../../packages/runtime/src/control-plane";
import {
  createRequestContext,
  ensureMethod,
  errorResponse,
  json,
  notFound,
  ok,
  pathSegments,
  readJson,
  withOptions,
  type EnvironmentBindings
} from "../../../packages/runtime/src/index";
import type { EventGatewayEvent, EventRoute } from "../../../packages/schemas/src/index";
import type { DateRangePreset } from "../../../packages/shared/src/index";

type MutableRoute = Omit<EventRoute, "id" | "site_id">;

function siteIdFromSegments(segments: string[]) {
  return segments[2];
}

function authTokenFromRequest(request: Request) {
  return request.headers.get("x-api-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}

async function authorizeRequest(request: Request, env: EnvironmentBindings | undefined) {
  const token = authTokenFromRequest(request);
  if (!token) return null;
  if (env?.API_TOKEN && token === env.API_TOKEN) {
    return { kind: "api_token" as const };
  }

  if (!env?.DB) return null;
  const session = await getSessionByToken(env.DB, token);
  if (!session) return null;

  return {
    kind: "session" as const,
    ...session
  };
}

function requireSessionAuthorization(
  context: ReturnType<typeof createRequestContext>,
  authorization: Awaited<ReturnType<typeof authorizeRequest>>
) {
  if (!authorization || authorization.kind !== "session") {
    return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
  }

  return null;
}

function requireGlobalAdmin(
  context: ReturnType<typeof createRequestContext>,
  authorization: Awaited<ReturnType<typeof authorizeRequest>>
) {
  const unauthorized = requireSessionAuthorization(context, authorization);
  if (unauthorized) {
    return unauthorized;
  }

  if (authorization.user.role !== "global_admin") {
    return errorResponse(context, "forbidden", "Global admin access is required.", 403);
  }

  return null;
}

async function routeRequest(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  if (env?.DB) {
    await ensureControlPlane(env.DB);
  }

  const segments = pathSegments(context);
  const method = context.method;

  if (segments.length === 1 && segments[0] === "health") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, { service: "api-worker", status: "healthy" });
  }

  if (segments[0] === "v1" && segments[1] === "auth") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    if (segments[2] === "register" && method === "POST") {
      try {
        const body = await readJson<{ name: string; email: string; password: string }>(request);
        const result = await createUserSession(env.DB, body);
        return json(context, result, { status: 201 });
      } catch (error) {
        return errorResponse(context, "register_failed", error instanceof Error ? error.message : "Register failed.", 400);
      }
    }

    if (segments[2] === "login" && method === "POST") {
      try {
        const body = await readJson<{ email: string; password: string }>(request);
        const result = await loginUserSession(env.DB, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(context, "login_failed", error instanceof Error ? error.message : "Login failed.", 401);
      }
    }

    if (segments[2] === "logout" && method === "POST") {
      const token = authTokenFromRequest(request);
      if (token) {
        await revokeSession(env.DB, token);
      }
      return json(context, { logged_out: true });
    }

    if (segments[2] === "me" && method === "GET") {
      const authorization = await authorizeRequest(request, env);
      if (!authorization || authorization.kind !== "session") {
        return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
      }

      const bootstrap = await getBootstrap(env.DB, authorization.user.id);
      return json(context, bootstrap);
    }
  }

  if (segments[0] === "v1" && segments[1] === "bootstrap" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }
    const authorization = await authorizeRequest(request, env);
    if (!authorization || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    return json(context, await getBootstrap(env.DB, authorization.user.id));
  }

  if (segments[0] === "v1" && segments[1] === "admin") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    const authorization = await authorizeRequest(request, env);
    const forbidden = requireGlobalAdmin(context, authorization);
    if (forbidden) {
      return forbidden;
    }

    if (segments[2] === "overview" && method === "GET") {
      return json(context, await getAdminOverview(env.DB));
    }

    if (segments[2] === "users" && segments.length === 3 && method === "GET") {
      return json(context, await listAdminUsers(env.DB));
    }

    if (segments[2] === "users" && segments[3] && method === "PATCH") {
      try {
        const body = await readJson<{ role?: "member" | "global_admin"; status?: "active" | "blocked" }>(request);
        return json(context, await updateAdminUser(env.DB, authorization.user.id, segments[3], body));
      } catch (error) {
        return errorResponse(context, "admin_user_update_failed", error instanceof Error ? error.message : "Unable to update user.", 400);
      }
    }

    if (segments[2] === "users" && segments[3] && segments[4] === "password" && method === "POST") {
      try {
        const body = await readJson<{ password: string }>(request);
        return json(context, await adminSetUserPassword(env.DB, segments[3], body.password));
      } catch (error) {
        return errorResponse(context, "admin_password_reset_failed", error instanceof Error ? error.message : "Unable to update password.", 400);
      }
    }

    if (segments[2] === "users" && segments[3] && method === "DELETE") {
      try {
        const deleted = await deleteAdminUser(env.DB, authorization.user.id, segments[3]);
        return deleted ? json(context, { deleted: true }) : notFound(context, `User ${segments[3]} not found`);
      } catch (error) {
        return errorResponse(context, "admin_user_delete_failed", error instanceof Error ? error.message : "Unable to delete user.", 400);
      }
    }

    if (segments[2] === "sites" && method === "GET") {
      return json(context, await listAdminSites(env.DB));
    }

    return notFound(context, `Unknown API route: ${context.url.pathname}`);
  }

  const authorization = await authorizeRequest(request, env);
  if (!authorization) {
    return errorResponse(context, "unauthorized", "Missing or invalid API token.", 401);
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
    if (env?.DB) {
      try {
        return json(context, await getInstallConfigFromDb(env.DB, siteId));
      } catch (error) {
        return errorResponse(context, "install_config_failed", error instanceof Error ? error.message : "Install config unavailable.", 404);
      }
    }
    return json(context, getInstallConfig(siteId));
  }

  if (segments[3] === "settings" && segments[4] === "domains" && segments.length === 5) {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    if (method === "GET") {
      return json(context, await listSiteDomains(env.DB, siteId));
    }

    if (method === "POST") {
      try {
        const body = await readJson<{ domain: string; kind?: string; description?: string }>(request);
        return json(context, await addSiteDomain(env.DB, siteId, body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "domain_create_failed", error instanceof Error ? error.message : "Unable to add domain.", 400);
      }
    }
  }

  if (segments[3] === "settings" && segments[4] === "domains" && segments[5] && method === "DELETE") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    try {
      const deleted = await deleteSiteDomain(env.DB, siteId, segments[5]);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Domain ${segments[5]} not found`);
    } catch (error) {
      return errorResponse(context, "domain_delete_failed", error instanceof Error ? error.message : "Unable to delete domain.", 400);
    }
  }

  if (segments[3] === "settings" && segments[4] === "api-keys" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await listSiteKeys(env.DB, siteId));
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
