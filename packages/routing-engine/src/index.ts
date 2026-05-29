import type {
  DeliveryIntent,
  EventGatewayEvent,
  EventRoute,
  RouteCondition,
  RouteMatch,
  RoutePlan,
  RouteTraceItem
} from "../../schemas/src/index";
import { createId, hashString } from "../../shared/src/index";

export type CompiledDestination = {
  id: string;
  kind:
    | "bing"
    | "branch"
    | "meta"
    | "ga4"
    | "google_ads"
    | "webhook"
    | "custom"
    | "facebook-pixel"
    | "floodlight"
    | "google-analytics"
    | "google-analytics-4"
    | "google-maps-rwg"
    | "hubspot"
    | "ihire"
    | "impact-radius"
    | "indeed"
    | "linkedin"
    | "mixpanel"
    | "outbrain"
    | "pinterest"
    | "podsights"
    | "posthog"
    | "quora"
    | "reddit"
    | "twitter"
    | "counterscale"
    | "tiktok"
    | "segment"
    | "ziprecruiter"
    | "upward"
    | "tatari"
    | "taboola"
    | "snapchat";
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
};

export type CompiledTransformation = {
  id: string;
  name: string;
  version: number;
  destination_kind?: CompiledDestination["kind"];
  enabled: boolean;
  mapping?: Record<string, unknown>;
};

export type CompiledSiteRoutingConfig = {
  site_id: string;
  version: number;
  compiled_at: number;
  routes: EventRoute[];
  destinations: Record<string, CompiledDestination>;
  transformations: Record<string, CompiledTransformation>;
};

export type CompileRoutingInput = {
  site_id: string;
  version: number;
  routes: EventRoute[];
  destinations?: Record<string, CompiledDestination>;
  transformations?: Record<string, CompiledTransformation>;
  compiled_at?: number;
};

export type RouteEvaluationResult = {
  matched: boolean;
  trace: RouteTraceItem;
  deliveries: DeliveryIntent[];
};

type TraceCondition = NonNullable<RouteTraceItem["conditions"]>[number];

function getByPath(input: unknown, path: string): unknown {
  if (!path) return input;

  return path.split(".").reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, input);
}

function normalizeComparable(value: unknown, caseSensitive?: boolean): unknown {
  if (typeof value !== "string") return value;
  return caseSensitive ? value : value.toLowerCase();
}

function compareValues(actual: unknown, expected: unknown, caseSensitive?: boolean): number {
  const left = normalizeComparable(actual, caseSensitive);
  const right = normalizeComparable(expected, caseSensitive);

  if (typeof left === "number" && typeof right === "number") {
    return left === right ? 0 : left > right ? 1 : -1;
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return left === right ? 0 : left ? 1 : -1;
  }

  const normalizedLeft = String(left ?? "");
  const normalizedRight = String(right ?? "");
  return normalizedLeft.localeCompare(normalizedRight);
}

function evaluateConditionTrace(event: EventGatewayEvent, condition: RouteCondition): TraceCondition {
  const actual = getByPath(event, condition.path);
  const expected = condition.value;
  const caseSensitive = condition.case_sensitive ?? false;
  let matched = false;

  switch (condition.op) {
    case "exists":
      matched = actual !== undefined && actual !== null;
      break;
    case "not_exists":
      matched = actual === undefined || actual === null;
      break;
    case "eq":
      matched = compareValues(actual, expected, caseSensitive) === 0;
      break;
    case "neq":
      matched = compareValues(actual, expected, caseSensitive) !== 0;
      break;
    case "in": {
      const values = Array.isArray(expected) ? expected : [];
      matched = values.some((value) => compareValues(actual, value, caseSensitive) === 0);
      break;
    }
    case "not_in": {
      const values = Array.isArray(expected) ? expected : [];
      matched = values.every((value) => compareValues(actual, value, caseSensitive) !== 0);
      break;
    }
    case "contains": {
      const source = normalizeComparable(actual, caseSensitive);
      const target = normalizeComparable(expected, caseSensitive);
      matched = String(source ?? "").includes(String(target ?? ""));
      break;
    }
    case "starts_with": {
      const source = normalizeComparable(actual, caseSensitive);
      const target = normalizeComparable(expected, caseSensitive);
      matched = String(source ?? "").startsWith(String(target ?? ""));
      break;
    }
    case "ends_with": {
      const source = normalizeComparable(actual, caseSensitive);
      const target = normalizeComparable(expected, caseSensitive);
      matched = String(source ?? "").endsWith(String(target ?? ""));
      break;
    }
    case "regex":
      matched = new RegExp(String(expected ?? ""), caseSensitive ? "" : "i").test(String(actual ?? ""));
      break;
    case "gt":
      matched = Number(actual) > Number(expected);
      break;
    case "gte":
      matched = Number(actual) >= Number(expected);
      break;
    case "lt":
      matched = Number(actual) < Number(expected);
      break;
    case "lte":
      matched = Number(actual) <= Number(expected);
      break;
    default:
      matched = false;
  }

  return {
    path: condition.path,
    op: condition.op,
    expected,
    actual,
    matched
  };
}

export function evaluateCondition(event: EventGatewayEvent, condition: RouteCondition): boolean {
  return evaluateConditionTrace(event, condition).matched;
}

export function evaluateMatch(event: EventGatewayEvent, match: RouteMatch): {
  matched: boolean;
  conditions: TraceCondition[];
  skipped_reason?: string;
} {
  const conditions: TraceCondition[] = [];

  if (match.event_types?.length && !match.event_types.includes(event.type)) {
    return {
      matched: false,
      conditions,
      skipped_reason: "event_type_mismatch"
    };
  }

  const allConditions = match.all ?? [];
  for (const condition of allConditions) {
    const trace = evaluateConditionTrace(event, condition);
    conditions.push(trace);
    if (!trace.matched) {
      return {
        matched: false,
        conditions,
        skipped_reason: "all_conditions_failed"
      };
    }
  }

  const anyConditions = match.any ?? [];
  if (anyConditions.length > 0) {
    const anyResults = anyConditions.map((condition) => evaluateConditionTrace(event, condition));
    conditions.push(...anyResults);
    if (!anyResults.some((item) => item.matched)) {
      return {
        matched: false,
        conditions,
        skipped_reason: "any_conditions_failed"
      };
    }
  }

  const noneConditions = match.none ?? [];
  if (noneConditions.length > 0) {
    const noneResults = noneConditions.map((condition) => evaluateConditionTrace(event, condition));
    conditions.push(...noneResults);
    if (noneResults.some((item) => item.matched)) {
      return {
        matched: false,
        conditions,
        skipped_reason: "none_conditions_failed"
      };
    }
  }

  return {
    matched: true,
    conditions
  };
}

export function evaluateConsent(route: EventRoute, event: EventGatewayEvent): boolean {
  const required = route.consent_required;
  if (!required) return true;

  const consent = event.consent ?? {};
  const keys = Object.keys(required) as Array<keyof NonNullable<EventRoute["consent_required"]>>;
  return keys.every((key) => required[key] !== true || consent[key] === true);
}

export function evaluateSampling(route: EventRoute, event: EventGatewayEvent): boolean {
  const sampling = route.sampling;
  if (!sampling || sampling.mode === "all") return true;

  const baseKey = sampling.hash_key || event.event_id || `${event.site_id}:${event.type}:${event.timestamp}`;
  const hashValue = Number.parseInt(hashString(baseKey).slice(0, 8), 16);
  const bucket = Number.isFinite(hashValue) ? hashValue % 100 : 0;

  if (sampling.mode === "percentage") {
    const percentage = Math.max(0, Math.min(100, sampling.percentage ?? 0));
    return bucket < percentage;
  }

  if (sampling.mode === "hash_mod") {
    const percentage = Math.max(0, Math.min(100, sampling.percentage ?? 0));
    return bucket < percentage;
  }

  return true;
}

export function sortRoutesByPriority(routes: EventRoute[]): EventRoute[] {
  return [...routes].sort((left, right) => left.priority - right.priority || left.name.localeCompare(right.name));
}

export function evaluateRoute(route: EventRoute, event: EventGatewayEvent): RouteEvaluationResult {
  const baseTrace: RouteTraceItem = {
    route_id: route.id,
    route_name: route.name,
    matched: false,
    conditions: []
  };

  if (!route.enabled) {
    return {
      matched: false,
      trace: { ...baseTrace, skipped_reason: "route_disabled" },
      deliveries: []
    };
  }

  if (route.environment !== "all" && route.environment !== event.environment) {
    return {
      matched: false,
      trace: { ...baseTrace, skipped_reason: "environment_mismatch" },
      deliveries: []
    };
  }

  if (!evaluateConsent(route, event)) {
    return {
      matched: false,
      trace: { ...baseTrace, skipped_reason: "consent_blocked" },
      deliveries: []
    };
  }

  const matchResult = evaluateMatch(event, route.match);
  if (!matchResult.matched) {
    return {
      matched: false,
      trace: {
        ...baseTrace,
        skipped_reason: matchResult.skipped_reason,
        conditions: matchResult.conditions
      },
      deliveries: []
    };
  }

  if (!evaluateSampling(route, event)) {
    return {
      matched: false,
      trace: {
        ...baseTrace,
        skipped_reason: "sampling_filtered",
        conditions: matchResult.conditions
      },
      deliveries: []
    };
  }

  const deliveries = route.destinations
    .filter((destination) => destination.enabled)
    .map<DeliveryIntent>((destination) => ({
      site_id: event.site_id,
      event_id: event.event_id,
      route_id: route.id,
      destination_id: destination.destination_id,
      transform_id: destination.transform_id,
      delivery_mode: destination.delivery_mode,
      idempotency_key: `${event.site_id}:${event.event_id}:${route.id}:${destination.destination_id}`
    }));

  return {
    matched: true,
    trace: {
      ...baseTrace,
      matched: true,
      conditions: matchResult.conditions
    },
    deliveries
  };
}

export function buildRoutePlan(event: EventGatewayEvent, routes: EventRoute[], traceId = createId("trace")): RoutePlan {
  const sortedRoutes = sortRoutesByPriority(routes);
  const trace: RouteTraceItem[] = [];
  const routeIds: string[] = [];
  const deliveries: DeliveryIntent[] = [];

  for (const route of sortedRoutes) {
    const result = evaluateRoute(route, event);
    trace.push(result.trace);

    if (result.matched) {
      routeIds.push(route.id);
      deliveries.push(...result.deliveries);
    }
  }

  return {
    trace_id: traceId,
    route_ids: routeIds,
    deliveries,
    trace
  };
}

export function simulateRoutes(event: EventGatewayEvent, routes: EventRoute[]) {
  const plan = buildRoutePlan(event, routes);
  return {
    event_id: event.event_id,
    site_id: event.site_id,
    plan,
    matched_routes: plan.trace.filter((item) => item.matched).length,
    blocked_routes: plan.trace.filter((item) => !item.matched && item.skipped_reason === "consent_blocked").length
  };
}

export function compileRoutingConfig(input: CompileRoutingInput): CompiledSiteRoutingConfig {
  const normalizedRoutes = sortRoutesByPriority(
    input.routes.filter((route) => route.enabled && route.site_id === input.site_id)
  );

  return {
    site_id: input.site_id,
    version: input.version,
    compiled_at: input.compiled_at ?? Date.now(),
    routes: normalizedRoutes,
    destinations: input.destinations ?? {},
    transformations: input.transformations ?? {}
  };
}

export function routePlanFromCompiledConfig(
  event: EventGatewayEvent,
  config: CompiledSiteRoutingConfig,
  traceId?: string
): RoutePlan {
  return buildRoutePlan(event, config.routes, traceId);
}
