export type ApiMeta = {
  request_id: string;
  duration_ms: number;
};

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    request_id: string;
  };
};

export type CursorPage<T> = {
  items: T[];
  next_cursor?: string;
  has_more: boolean;
};

export type WorkerRequestContext = {
  requestId: string;
  startedAt: number;
  url: URL;
  method: string;
};

export type DatabaseStatement = {
  bind: (...params: unknown[]) => DatabaseStatement;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
  run: () => Promise<unknown>;
};

export type DatabaseBinding = {
  prepare: (query: string) => DatabaseStatement;
  batch: (statements: DatabaseStatement[]) => Promise<unknown[]>;
};

export type QueueSendBinding<T = unknown> = {
  send: (message: T) => Promise<void>;
};

export type QueueMessage<T = unknown> = {
  id: string;
  body: T;
  attempts: number;
  ack: () => void;
  retry: () => void;
};

export type QueueBatch<T = unknown> = {
  messages: Array<QueueMessage<T>>;
};

export type DeliveryQueueMessage = {
  site_id: string;
  delivery_attempt_id: string;
  event_id: string;
};

export type EnvironmentBindings = {
  API_TOKEN?: string;
  CORS_ORIGIN?: string;
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  PASSWORD_RESET_BASE_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  MANAGED_DESTINATIONS_CONFIG?: string;
  DB?: DatabaseBinding;
  EVENTS_QUEUE?: QueueSendBinding<DeliveryQueueMessage>;
};

export function createRequestContext(request: Request): WorkerRequestContext {
  return {
    requestId: crypto.randomUUID(),
    startedAt: Date.now(),
    url: new URL(request.url),
    method: request.method.toUpperCase()
  };
}

export function createCorsHeaders(origin = "*"): HeadersInit {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization,x-api-token",
    "access-control-max-age": "86400"
  };
}

export function createMeta(context: WorkerRequestContext): ApiMeta {
  return {
    request_id: context.requestId,
    duration_ms: Date.now() - context.startedAt
  };
}

export function json<T>(context: WorkerRequestContext, data: T, init?: ResponseInit): Response {
  return new Response(
    JSON.stringify({
      data,
      meta: createMeta(context)
    } satisfies ApiResponse<T>),
    {
      status: init?.status ?? 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        ...createCorsHeaders(),
        ...(init?.headers ?? {})
      }
    }
  );
}

export function errorResponse(
  context: WorkerRequestContext,
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details
      },
      meta: {
        request_id: context.requestId
      }
    } satisfies ApiError),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        ...createCorsHeaders()
      }
    }
  );
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function ok(): Response {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders()
  });
}

export function ensureMethod(context: WorkerRequestContext, allowed: string[]): Response | null {
  if (allowed.includes(context.method)) return null;
  return errorResponse(context, "method_not_allowed", `Allowed methods: ${allowed.join(", ")}`, 405);
}

export function unauthorized(context: WorkerRequestContext, message = "Unauthorized"): Response {
  return errorResponse(context, "unauthorized", message, 401);
}

export function notFound(context: WorkerRequestContext, message = "Not found"): Response {
  return errorResponse(context, "not_found", message, 404);
}

export function withAuth(request: Request, env: EnvironmentBindings | undefined, context: WorkerRequestContext): Response | null {
  if (!env?.API_TOKEN) return null;
  const token = request.headers.get("x-api-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (token === env.API_TOKEN) return null;
  return unauthorized(context, "Missing or invalid API token");
}

export function withOptions(context: WorkerRequestContext): Response | null {
  if (context.method !== "OPTIONS") return null;
  return ok();
}

export function pathSegments(context: WorkerRequestContext): string[] {
  return context.url.pathname.split("/").filter(Boolean);
}
