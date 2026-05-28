import {
  ensureControlPlane,
  flushPendingDeliveries,
  getOperationsQueues,
  listOperationsDlq
} from "../../../packages/runtime/src/control-plane";
import {
  createRequestContext,
  ensureMethod,
  errorResponse,
  json,
  notFound,
  ok,
  pathSegments,
  withOptions,
  type EnvironmentBindings
} from "../../../packages/runtime/src/index";

function extractSiteId(url: URL) {
  return url.searchParams.get("siteId") ?? "site_alpha";
}

async function routeRequest(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const segments = pathSegments(context);
  const path = `/${segments.join("/")}`;
  const siteId = extractSiteId(context.url);

  if (!env?.DB) {
    return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
  }

  await ensureControlPlane(env.DB);

  if (path === "/health") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, {
      service: "forwarder-worker",
      status: "healthy",
      queue: await getOperationsQueues(env.DB, siteId)
    });
  }

  if (path === "/v1/flush") {
    const methodResponse = ensureMethod(context, ["POST"]);
    if (methodResponse) return methodResponse;
    const processed = await flushPendingDeliveries(env.DB, siteId);
    return json(context, {
      processed,
      queue: await getOperationsQueues(env.DB, siteId)
    });
  }

  if (path === "/v1/dlq") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, await listOperationsDlq(env.DB, siteId));
  }

  if (request.method === "OPTIONS") return ok();
  return notFound(context, `Unknown forwarder route: ${path}`);
}

export default {
  async fetch(request: Request, env?: EnvironmentBindings) {
    return routeRequest(request, env);
  }
};
