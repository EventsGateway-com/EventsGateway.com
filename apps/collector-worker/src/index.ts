import { batchCollect, collectEvent, debugCollect, identifyUser } from "../../../packages/platform-data/src/index";
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
import type { EventGatewayEvent } from "../../../packages/schemas/src/index";

type CollectBody = Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">;

async function handleCollect(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<CollectBody>(request);
  if (!body.type || !body.source || !body.environment) {
    return errorResponse(context, "invalid_event", "Collector requires type, source and environment.", 400);
  }

  return json(context, collectEvent(body), { status: 202 });
}

async function handleBatch(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<{ events: CollectBody[] }>(request);
  return json(context, { accepted: body.events.length, results: batchCollect(body.events) }, { status: 202 });
}

async function handleIdentify(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<{ site_id: string; canonical_user_id: string; anonymous_id?: string; session_id?: string; consent?: { analytics: boolean; ads: boolean; functional: boolean } }>(request);
  if (!body.site_id || !body.canonical_user_id) {
    return errorResponse(context, "invalid_identify_payload", "site_id and canonical_user_id are required.", 400);
  }

  return json(context, identifyUser(body.site_id, body));
}

async function handleDebugCollect(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<CollectBody>(request);
  if (!body.type || !body.source || !body.environment) {
    return errorResponse(context, "invalid_event", "Collector requires type, source and environment.", 400);
  }

  return json(context, debugCollect(body));
}

function handleHealth(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["GET"]);
  if (methodResponse) return methodResponse;

  return json(context, {
    service: "collector-worker",
    status: "healthy",
    supports: ["/v1/collect", "/v1/batch", "/v1/identify", "/v1/debug/collect", "/health"]
  });
}

export default {
  async fetch(request: Request, _env?: EnvironmentBindings) {
    const segments = pathSegments(createRequestContext(request));
    const path = `/${segments.join("/")}`;

    if (path === "/health") return handleHealth(request);
    if (path === "/v1/collect") return handleCollect(request);
    if (path === "/v1/batch") return handleBatch(request);
    if (path === "/v1/identify") return handleIdentify(request);
    if (path === "/v1/debug/collect") return handleDebugCollect(request);
    if (request.method === "OPTIONS") return ok();

    return notFound(createRequestContext(request), `Unknown collector route: ${path}`);
  }
};
