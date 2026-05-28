import { batchCollect, collectEvent, debugCollect, identifyUser } from "../../../packages/platform-data/src/index";
import {
  ensureControlPlane,
  normalizeDomain,
  storeCollectedEvent,
  validateCollectAccess
} from "../../../packages/runtime/src/control-plane";
import {
  createRequestContext,
  type DeliveryQueueMessage,
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

type CollectBody = Partial<EventGatewayEvent> &
  Pick<EventGatewayEvent, "type" | "source" | "environment"> & {
    api_key?: string;
  };

async function enqueueCollectedDelivery(
  env: EnvironmentBindings | undefined,
  message: DeliveryQueueMessage
) {
  if (!env?.EVENTS_QUEUE) {
    return;
  }

  try {
    await env.EVENTS_QUEUE.send(message);
  } catch {
    // D1 remains the durable source of truth and manual flush stays available as fallback.
  }
}

async function handleCollect(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<CollectBody>(request);
  if (!body.type || !body.source || !body.environment) {
    return errorResponse(context, "invalid_event", "Collector requires type, source and environment.", 400);
  }

  if (!body.site_id || !body.api_key) {
    return errorResponse(context, "invalid_event", "Collector requires site_id and api_key.", 400);
  }

  if (env?.DB) {
    await ensureControlPlane(env.DB);
    const originHeader = request.headers.get("origin");
    const authorization = await validateCollectAccess(env.DB, {
      siteId: body.site_id,
      apiKey: body.api_key,
      origin: originHeader
    });

    if (!authorization) {
      return errorResponse(context, "unauthorized_site", "The site_id, api_key or origin is not allowed.", 401);
    }

    const stored = await storeCollectedEvent(env.DB, {
      siteId: body.site_id,
      originDomain: authorization.origin_domain,
      event: {
        event_id: body.event_id,
        type: body.type,
        source: body.source,
        environment: body.environment,
        canonical_user_id: body.canonical_user_id,
        anonymous_id: body.anonymous_id,
        session_id: body.session_id,
        page: body.page,
        consent: body.consent,
        payload: body
      }
    });

    await enqueueCollectedDelivery(env, {
      site_id: stored.site_id,
      delivery_attempt_id: stored.delivery_attempt_id,
      event_id: stored.event_id
    });
  }

  return json(context, collectEvent(body), { status: 202 });
}

async function handleBatch(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<{ events: CollectBody[] }>(request);

  if (env?.DB) {
    await ensureControlPlane(env.DB);
    const originHeader = request.headers.get("origin");
    for (const event of body.events) {
      if (!event.site_id || !event.api_key || !event.type || !event.source || !event.environment) continue;
      const authorization = await validateCollectAccess(env.DB, {
        siteId: event.site_id,
        apiKey: event.api_key,
        origin: originHeader
      });

      if (!authorization) continue;

      const stored = await storeCollectedEvent(env.DB, {
        siteId: event.site_id,
        originDomain: authorization.origin_domain,
        event: {
          event_id: event.event_id,
          type: event.type,
          source: event.source,
          environment: event.environment,
          canonical_user_id: event.canonical_user_id,
          anonymous_id: event.anonymous_id,
          session_id: event.session_id,
          page: event.page,
          consent: event.consent,
          payload: event
        }
      });

      await enqueueCollectedDelivery(env, {
        site_id: stored.site_id,
        delivery_attempt_id: stored.delivery_attempt_id,
        event_id: stored.event_id
      });
    }
  }

  return json(context, { accepted: body.events.length, results: batchCollect(body.events) }, { status: 202 });
}

async function handleIdentify(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["POST"]);
  if (methodResponse) return methodResponse;

  const body = await readJson<{ site_id: string; canonical_user_id: string; anonymous_id?: string; session_id?: string; consent?: { analytics: boolean; ads: boolean; functional: boolean } }>(request);
  if (!body.site_id || !body.canonical_user_id) {
    return errorResponse(context, "invalid_identify_payload", "site_id and canonical_user_id are required.", 400);
  }

  if (env?.DB) {
    await ensureControlPlane(env.DB);
    const siteKey = request.headers.get("x-site-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!siteKey) {
      return errorResponse(context, "missing_site_key", "Collector identify requires a site key.", 401);
    }

    const authorization = await validateCollectAccess(env.DB, {
      siteId: body.site_id,
      apiKey: siteKey,
      origin: request.headers.get("origin")
    });

    if (!authorization) {
      return errorResponse(context, "unauthorized_site", "The site_id, api_key or origin is not allowed.", 401);
    }

    const stored = await storeCollectedEvent(env.DB, {
      siteId: body.site_id,
      originDomain: authorization.origin_domain,
      event: {
        type: "Identify",
        source: "browser",
        environment: "production",
        canonical_user_id: body.canonical_user_id,
        anonymous_id: body.anonymous_id,
        session_id: body.session_id,
        consent: body.consent,
        payload: body
      }
    });

    await enqueueCollectedDelivery(env, {
      site_id: stored.site_id,
      delivery_attempt_id: stored.delivery_attempt_id,
      event_id: stored.event_id
    });
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
  async fetch(request: Request, env?: EnvironmentBindings) {
    const segments = pathSegments(createRequestContext(request));
    const path = `/${segments.join("/")}`;

    if (path === "/health") return handleHealth(request);
    if (path === "/v1/collect") return handleCollect(request, env);
    if (path === "/v1/batch") return handleBatch(request, env);
    if (path === "/v1/identify") return handleIdentify(request, env);
    if (path === "/v1/debug/collect") return handleDebugCollect(request);
    if (request.method === "OPTIONS") return ok();

    return notFound(createRequestContext(request), `Unknown collector route: ${path}`);
  }
};
