import { getDlq, getQueues, processPendingDeliveries } from "../../../packages/platform-data/src/index";
import {
  createRequestContext,
  ensureMethod,
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

async function routeRequest(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const segments = pathSegments(context);
  const path = `/${segments.join("/")}`;
  const siteId = extractSiteId(context.url);

  if (path === "/health") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, {
      service: "forwarder-worker",
      status: "healthy",
      queue: getQueues(siteId)
    });
  }

  if (path === "/v1/flush") {
    const methodResponse = ensureMethod(context, ["POST"]);
    if (methodResponse) return methodResponse;
    return json(context, {
      processed: processPendingDeliveries(siteId),
      queue: getQueues(siteId)
    });
  }

  if (path === "/v1/dlq") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, getDlq(siteId));
  }

  if (request.method === "OPTIONS") return ok();
  return notFound(context, `Unknown forwarder route: ${path}`);
}

export default {
  async fetch(request: Request, _env?: EnvironmentBindings) {
    return routeRequest(request);
  }
};
