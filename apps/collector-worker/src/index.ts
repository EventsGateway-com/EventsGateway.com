import { batchCollect, collectEvent, debugCollect, identifyUser } from "../../../packages/platform-data/src/index";
import {
  ensureControlPlane,
  storeCollectedEvent,
  validateCollectAccess
} from "../../../packages/runtime/src/control-plane";
import { getSiteRoutingAccessStatus } from "../../../packages/runtime/src/billing";
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
  readTextJson,
  withOptions,
  type EnvironmentBindings
} from "../../../packages/runtime/src/index";
import {
  getVisitorStateKey,
  updateVisitorState,
  VisitorStateDurableObject,
  type VisitorStateSnapshot
} from "../../../packages/runtime/src/visitor-state";
import type { EventGatewayEvent } from "../../../packages/schemas/src/index";
import { createBrowserLoaderSource } from "../../../packages/tracker-sdk/src/index";

type CollectBody = Partial<EventGatewayEvent> &
  Pick<EventGatewayEvent, "type" | "source" | "environment"> & {
    api_key?: string;
  };

type IdentifyBody = {
  site_id: string;
  canonical_user_id: string;
  anonymous_id?: string;
  session_id?: string;
  consent?: { analytics: boolean; ads: boolean; functional: boolean };
};

const D1_HISTORY_RETENTION_DAYS = 45;
const R2_LEDGER_RETENTION_DAYS = 60;

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
    return;
  }
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildLedgerObjectKey(siteId: string, eventId: string, receivedAt: string) {
  const date = new Date(receivedAt);
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `events/${year}/${month}/${day}/${siteId}/${eventId}.json`;
}

function parseLedgerDateKey(key: string) {
  const parts = key.split("/");
  if (parts.length < 5 || parts[0] !== "events") {
    return null;
  }

  const [_, year, month, day] = parts;
  const parsed = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sanitizeLedgerPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }

  const next = { ...(payload as Record<string, unknown>) };
  delete next.api_key;
  return next;
}

async function writeLedgerRecord(
  env: Pick<EnvironmentBindings, "LEDGER_BUCKET"> | undefined,
  input: {
    siteId: string;
    eventId: string;
    receivedAt: string;
    eventType: string;
    payload: unknown;
    visitorStateSnapshot?: VisitorStateSnapshot | null;
  }
) {
  if (!env?.LEDGER_BUCKET) {
    return null;
  }

  const key = buildLedgerObjectKey(input.siteId, input.eventId, input.receivedAt);
  const body = JSON.stringify({
    site_id: input.siteId,
    event_id: input.eventId,
    event_type: input.eventType,
    received_at: input.receivedAt,
    visitor_state: input.visitorStateSnapshot ?? null,
    payload: sanitizeLedgerPayload(input.payload)
  });

  try {
    await env.LEDGER_BUCKET.put(key, body, {
      httpMetadata: {
        contentType: "application/json"
      }
    });
    return key;
  } catch {
    return null;
  }
}

async function buildIngestArtifacts(
  env: EnvironmentBindings | undefined,
  input: {
    siteId: string;
    event: Pick<
      EventGatewayEvent,
      "event_id" | "type" | "source" | "environment" | "canonical_user_id" | "anonymous_id" | "session_id" | "page" | "consent"
    >;
    payload: unknown;
  }
) {
  const eventId = input.event.event_id?.trim() || crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const visitorKey = getVisitorStateKey({
    site_id: input.siteId,
    canonical_user_id: input.event.canonical_user_id,
    anonymous_id: input.event.anonymous_id,
    session_id: input.event.session_id,
    event_id: eventId
  });

  const visitorStateSnapshot = visitorKey
    ? await updateVisitorState(env, {
      site_id: input.siteId,
      visitor_key: visitorKey,
      received_at: receivedAt,
      event: {
        ...input.event,
        event_id: eventId
      }
    })
    : null;

  const ledgerR2Key = await writeLedgerRecord(env, {
    siteId: input.siteId,
    eventId,
    eventType: input.event.type,
    receivedAt,
    payload: input.payload,
    visitorStateSnapshot
  });

  return {
    eventId,
    visitorStateSnapshot,
    ledgerR2Key
  };
}

async function cleanupD1History(env: EnvironmentBindings | undefined) {
  if (!env?.DB) {
    return;
  }

  await ensureControlPlane(env.DB);
  const historyCutoff = daysAgoIso(D1_HISTORY_RETENTION_DAYS);
  await env.DB.prepare("DELETE FROM delivery_attempts WHERE queued_at < ?").bind(historyCutoff).run();
  await env.DB.prepare("DELETE FROM collected_events WHERE received_at < ?").bind(historyCutoff).run();
  await env.DB.prepare("DELETE FROM identity_profiles WHERE updated_at < ?").bind(historyCutoff).run();
  await env.DB.prepare("DELETE FROM operation_jobs WHERE created_at < ?").bind(historyCutoff).run();
}

async function cleanupLedgerBucket(env: EnvironmentBindings | undefined) {
  if (!env?.LEDGER_BUCKET) {
    return;
  }

  const cutoff = new Date(Date.now() - R2_LEDGER_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  let cursor: string | undefined;
  do {
    const page = await env.LEDGER_BUCKET.list({
      prefix: "events/",
      limit: 1000,
      cursor
    });
    const expiredKeys = page.objects
      .map((item) => item.key)
      .filter((key) => {
        const parsed = parseLedgerDateKey(key);
        return parsed ? parsed.getTime() < cutoff.getTime() : false;
      });

    if (expiredKeys.length > 0) {
      await env.LEDGER_BUCKET.delete(expiredKeys);
    }

    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
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
    }, env);

    if (!authorization) {
      return errorResponse(context, "unauthorized_site", "The site_id, api_key or origin is not allowed.", 401);
    }

    const routingAccess = await getSiteRoutingAccessStatus(env.DB, body.site_id);
    if (!routingAccess.allowed) {
      return errorResponse(
        context,
        "billing_suspended",
        routingAccess.reason || "Event routing is suspended until overdue billing is resolved.",
        402,
        {
          grace_period_ends_at: routingAccess.grace_period_ends_at
        }
      );
    }

    const artifacts = await buildIngestArtifacts(env, {
      siteId: body.site_id,
      event: {
        event_id: body.event_id,
        type: body.type,
        source: body.source,
        environment: body.environment,
        canonical_user_id: body.canonical_user_id,
        anonymous_id: body.anonymous_id,
        session_id: body.session_id,
        page: body.page,
        consent: body.consent
      },
      payload: body
    });
    const stored = await storeCollectedEvent(env.DB, {
      siteId: body.site_id,
      originDomain: authorization.origin_domain,
      visitorStateSnapshot: artifacts.visitorStateSnapshot,
      ledgerR2Key: artifacts.ledgerR2Key,
      env,
      event: {
        event_id: artifacts.eventId,
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

    for (const deliveryAttemptId of stored.delivery_attempt_ids) {
      await enqueueCollectedDelivery(env, {
        site_id: stored.site_id,
        delivery_attempt_id: deliveryAttemptId,
        event_id: stored.event_id
      });
    }
  }

  return json(context, collectEvent(body), { status: 202 });
}

async function handleIngest(request: Request, env?: EnvironmentBindings) {
  const contentType = request.headers.get("content-type") || "";
  const isTextRequest = contentType.toLowerCase().includes("text/plain");
  const body = isTextRequest
    ? await readTextJson<CollectBody | { events: CollectBody[] }>(request)
    : await readJson<CollectBody | { events: CollectBody[] }>(request);

  if (body && typeof body === "object" && "events" in body && Array.isArray(body.events)) {
    const normalizedBody = {
      events: body.events.map((event) => ({
        ...event,
        api_key: event.api_key || request.headers.get("x-site-key") || undefined
      }))
    };
    const normalizedRequest = new Request(request, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(normalizedBody)
    });
    return handleBatch(normalizedRequest, env);
  }

  const normalizedBody = {
    ...(body as CollectBody),
    api_key: (body as CollectBody).api_key || request.headers.get("x-site-key") || undefined
  };
  const normalizedRequest = new Request(request, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(normalizedBody)
  });
  return handleCollect(normalizedRequest, env);
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
      }, env);

      if (!authorization) continue;

      const routingAccess = await getSiteRoutingAccessStatus(env.DB, event.site_id);
      if (!routingAccess.allowed) continue;

      const artifacts = await buildIngestArtifacts(env, {
        siteId: event.site_id,
        event: {
          event_id: event.event_id,
          type: event.type,
          source: event.source,
          environment: event.environment,
          canonical_user_id: event.canonical_user_id,
          anonymous_id: event.anonymous_id,
          session_id: event.session_id,
          page: event.page,
          consent: event.consent
        },
        payload: event
      });
      const stored = await storeCollectedEvent(env.DB, {
        siteId: event.site_id,
        originDomain: authorization.origin_domain,
        visitorStateSnapshot: artifacts.visitorStateSnapshot,
        ledgerR2Key: artifacts.ledgerR2Key,
        env,
        event: {
          event_id: artifacts.eventId,
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

      for (const deliveryAttemptId of stored.delivery_attempt_ids) {
        await enqueueCollectedDelivery(env, {
          site_id: stored.site_id,
          delivery_attempt_id: deliveryAttemptId,
          event_id: stored.event_id
        });
      }
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

  const body = await readJson<IdentifyBody>(request);
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
    }, env);

    if (!authorization) {
      return errorResponse(context, "unauthorized_site", "The site_id, api_key or origin is not allowed.", 401);
    }

    const routingAccess = await getSiteRoutingAccessStatus(env.DB, body.site_id);
    if (!routingAccess.allowed) {
      return errorResponse(
        context,
        "billing_suspended",
        routingAccess.reason || "Event routing is suspended until overdue billing is resolved.",
        402,
        {
          grace_period_ends_at: routingAccess.grace_period_ends_at
        }
      );
    }

    const artifacts = await buildIngestArtifacts(env, {
      siteId: body.site_id,
      event: {
        event_id: undefined,
        type: "Identify",
        source: "browser",
        environment: "production",
        canonical_user_id: body.canonical_user_id,
        anonymous_id: body.anonymous_id,
        session_id: body.session_id,
        consent: body.consent
      },
      payload: body
    });
    const stored = await storeCollectedEvent(env.DB, {
      siteId: body.site_id,
      originDomain: authorization.origin_domain,
      visitorStateSnapshot: artifacts.visitorStateSnapshot,
      ledgerR2Key: artifacts.ledgerR2Key,
      env,
      event: {
        event_id: artifacts.eventId,
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

    for (const deliveryAttemptId of stored.delivery_attempt_ids) {
      await enqueueCollectedDelivery(env, {
        site_id: stored.site_id,
        delivery_attempt_id: deliveryAttemptId,
        event_id: stored.event_id
      });
    }
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

function handleTrackerJs(request: Request) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  const methodResponse = ensureMethod(context, ["GET"]);
  if (methodResponse) return methodResponse;

  return new Response(createBrowserLoaderSource("/i/"), {
    status: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
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
    supports: ["/e/", "/i/", "/i/identify", "/v1/debug/collect", "/health"]
  });
}

export async function handleCollectorScheduled(_controller: unknown, env?: EnvironmentBindings) {
  await cleanupD1History(env);
  await cleanupLedgerBucket(env);
}

export async function handleCollectorRequest(request: Request, env?: EnvironmentBindings) {
  const hostname = new URL(request.url).hostname.toLowerCase();
  if (hostname === "sources.eventsgateway.com") {
    return new Response("dummy", {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }

  const path = new URL(request.url).pathname;

  if (path === "/e") {
    return Response.redirect(new URL("/e/", request.url).toString(), 301);
  }
  if (path === "/e/") {
    return handleTrackerJs(request);
  }
  if (path === "/i") {
    return Response.redirect(new URL("/i/", request.url).toString(), 307);
  }
  if (path === "/i/") return handleIngest(request, env);
  if (path === "/i/identify") return handleIdentify(request, env);
  if (path === "/v1/collect") return handleCollect(request, env);
  if (path === "/v1/batch") return handleBatch(request, env);
  if (path === "/v1/identify") return handleIdentify(request, env);
  if (path === "/v1/debug/collect") return handleDebugCollect(request);
  if (path === "/health") return handleHealth(request);
  if (request.method === "OPTIONS") return ok();
  return notFound(createRequestContext(request), `Unknown collector route: ${path}`);
}

export default {
  async fetch(request: Request, env?: EnvironmentBindings) {
    return handleCollectorRequest(request, env);
  },
  async scheduled(controller: unknown, env?: EnvironmentBindings) {
    await handleCollectorScheduled(controller, env);
  }
};

export { VisitorStateDurableObject };
