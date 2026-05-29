import type { EventGatewayEvent } from "../../schemas/src/index";
import type { DurableObjectNamespaceBinding, EnvironmentBindings } from "./index";

export type VisitorStateSnapshot = {
  site_id: string;
  visitor_key: string;
  canonical_user_id: string | null;
  anonymous_id: string | null;
  session_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  last_event_id: string | null;
  last_event_type: string | null;
  last_source: string | null;
  last_environment: string | null;
  last_page_path: string | null;
  last_page_url: string | null;
  consent: {
    analytics: boolean;
    ads: boolean;
    functional: boolean;
  };
  event_count: number;
};

type DurableObjectStorage = {
  get: <T = unknown>(key: string) => Promise<T | undefined>;
  put: (key: string, value: unknown) => Promise<void>;
};

type DurableObjectStateLike = {
  storage: DurableObjectStorage;
  blockConcurrencyWhile: <T>(callback: () => Promise<T>) => Promise<T>;
};

type VisitorStateUpdateInput = {
  site_id: string;
  visitor_key: string;
  event: Pick<
    EventGatewayEvent,
    "event_id" | "type" | "source" | "environment" | "canonical_user_id" | "anonymous_id" | "session_id" | "page" | "consent"
  >;
  received_at: string;
};

const SNAPSHOT_STORAGE_KEY = "snapshot";

export function getVisitorStateKey(input: {
  site_id: string;
  canonical_user_id?: string | null;
  anonymous_id?: string | null;
  session_id?: string | null;
  event_id?: string | null;
}) {
  const identity = input.canonical_user_id?.trim()
    || input.anonymous_id?.trim()
    || input.session_id?.trim()
    || input.event_id?.trim();
  if (!identity) {
    return null;
  }

  return `${input.site_id}:${identity}`;
}

function normalizeConsent(input?: EventGatewayEvent["consent"], fallback?: VisitorStateSnapshot["consent"]) {
  return {
    analytics: Boolean(input?.analytics ?? fallback?.analytics ?? false),
    ads: Boolean(input?.ads ?? fallback?.ads ?? false),
    functional: Boolean(input?.functional ?? fallback?.functional ?? false)
  };
}

export function buildVisitorStateSnapshot(input: VisitorStateUpdateInput, current?: VisitorStateSnapshot): VisitorStateSnapshot {
  return {
    site_id: input.site_id,
    visitor_key: input.visitor_key,
    canonical_user_id: input.event.canonical_user_id ?? current?.canonical_user_id ?? null,
    anonymous_id: input.event.anonymous_id ?? current?.anonymous_id ?? null,
    session_id: input.event.session_id ?? current?.session_id ?? null,
    first_seen_at: current?.first_seen_at ?? input.received_at,
    last_seen_at: input.received_at,
    last_event_id: input.event.event_id ?? current?.last_event_id ?? null,
    last_event_type: input.event.type ?? current?.last_event_type ?? null,
    last_source: input.event.source ?? current?.last_source ?? null,
    last_environment: input.event.environment ?? current?.last_environment ?? null,
    last_page_path: input.event.page?.path ?? current?.last_page_path ?? null,
    last_page_url: input.event.page?.url ?? current?.last_page_url ?? null,
    consent: normalizeConsent(input.event.consent, current?.consent),
    event_count: (current?.event_count ?? 0) + 1
  };
}

async function readSnapshotResponse(response: Response) {
  if (!response.ok) {
    return null;
  }

  return response.json<VisitorStateSnapshot>();
}

export async function updateVisitorState(
  env: Pick<EnvironmentBindings, "VISITOR_STATE_DO"> | undefined,
  input: VisitorStateUpdateInput
) {
  const namespace = env?.VISITOR_STATE_DO;
  if (!namespace) {
    return buildVisitorStateSnapshot(input);
  }

  try {
    const id = namespace.idFromName(input.visitor_key);
    const stub = namespace.get(id);
    const response = await stub.fetch("https://visitor-state.internal/track", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });
    const snapshot = await readSnapshotResponse(response);
    return snapshot ?? buildVisitorStateSnapshot(input);
  } catch {
    return buildVisitorStateSnapshot(input);
  }
}

export class VisitorStateDurableObject {
  private readonly state: DurableObjectStateLike;

  constructor(state: DurableObjectStateLike) {
    this.state = state;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/snapshot") {
      const snapshot = await this.state.storage.get<VisitorStateSnapshot>(SNAPSHOT_STORAGE_KEY);
      return new Response(JSON.stringify(snapshot ?? null), {
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      });
    }

    if (request.method !== "POST" || url.pathname !== "/track") {
      return new Response("Not found", { status: 404 });
    }

    const input = await request.json<VisitorStateUpdateInput>();
    const snapshot = await this.state.blockConcurrencyWhile(async () => {
      const current = await this.state.storage.get<VisitorStateSnapshot>(SNAPSHOT_STORAGE_KEY);
      const next = buildVisitorStateSnapshot(input, current);
      await this.state.storage.put(SNAPSHOT_STORAGE_KEY, next);
      return next;
    });

    return new Response(JSON.stringify(snapshot), {
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    });
  }
}

export function createVisitorStateNamespaceBinding(
  env: Pick<EnvironmentBindings, "VISITOR_STATE_DO"> | undefined
) {
  return env?.VISITOR_STATE_DO as DurableObjectNamespaceBinding | undefined;
}
