import type { EventGatewayEvent, EventRoute, RoutePlan } from "../../schemas/src/index";
import { buildRoutePlan, compileRoutingConfig, simulateRoutes, type CompiledSiteRoutingConfig } from "../../routing-engine/src/index";
import { createId, hashString, now, type DateRangePreset } from "../../shared/src/index";
import type { CursorPage } from "../../runtime/src/index";

export type DestinationRecord = {
  id: string;
  site_id: string;
  name: string;
  kind: "meta" | "ga4" | "google_ads" | "webhook";
  status: "active" | "paused" | "disabled";
  secret_preview: string;
  config: Record<string, unknown>;
};

export type TransformationRecord = {
  id: string;
  site_id: string;
  name: string;
  destination_kind: DestinationRecord["kind"];
  version: number;
  status: "active" | "draft";
  mapping: Record<string, unknown>;
};

export type DeliveryRecord = {
  id: string;
  site_id: string;
  event_id: string;
  route_id: string;
  destination_id: string;
  status: "pending" | "healthy" | "retrying" | "failed";
  latency_ms?: number;
  attempts: number;
  last_error?: string;
  queued_at: number;
  sent_at?: number;
};

export type IdentityRecord = {
  canonical_user_id: string;
  site_id: string;
  anonymous_ids: string[];
  session_ids: string[];
  email_hmac?: string;
  user_id_hash?: string;
  consent: {
    analytics: boolean;
    ads: boolean;
    functional: boolean;
  };
  last_seen_at: number;
};

export type OperationJob = {
  id: string;
  site_id: string;
  type: "replay" | "dlq_replay" | "backfill_attribution" | "export";
  status: "queued" | "running" | "completed";
  progress: number;
  created_at: number;
  finished_at?: number;
  detail: string;
};

export type SchemaSummary = {
  event_type: string;
  count: number;
  sample_paths: string[];
};

export type RealtimeItem = {
  time: string;
  eventType: string;
  route: string;
  status: DeliveryRecord["status"] | "matched";
  destination: string;
};

export type OverviewSnapshot = {
  ingestPerMinute: number;
  matchedRate: number;
  deliverySuccess: number;
  activeRoutes: number;
  compiledVersion: number;
  queueDepth: number;
  topSignals: Array<{ label: string; value: number; delta: string }>;
};

const siteId = "site_alpha";

const state = {
  activeRoutingVersion: 3,
  routes: [
    {
      id: "route_purchase_ads",
      site_id: siteId,
      name: "Purchase to Meta and GA4",
      description: "Routes purchase events to ads and analytics destinations.",
      enabled: true,
      priority: 10,
      environment: "production",
      match: {
        event_types: ["Purchase"],
        all: [
          { path: "ecommerce.order_id", op: "exists" },
          { path: "ecommerce.value", op: "gt", value: 0 },
          { path: "consent.ads", op: "eq", value: true }
        ],
        none: [{ path: "properties.test_order", op: "eq", value: true }]
      },
      consent_required: { analytics: true, ads: true },
      sampling: { mode: "all" },
      destinations: [
        { destination_id: "dst_meta", transform_id: "tf_meta_purchase", delivery_mode: "queued", enabled: true },
        { destination_id: "dst_ga4", transform_id: "tf_ga4_purchase", delivery_mode: "queued", enabled: true }
      ]
    },
    {
      id: "route_lead_crm",
      site_id: siteId,
      name: "Lead to webhook CRM",
      description: "Routes high intent leads into the CRM intake webhook.",
      enabled: true,
      priority: 20,
      environment: "production",
      match: {
        event_types: ["Lead"],
        all: [
          { path: "properties.plan", op: "in", value: ["pro", "enterprise"] },
          { path: "consent.analytics", op: "eq", value: true }
        ]
      },
      consent_required: { analytics: true },
      sampling: { mode: "percentage", percentage: 100 },
      destinations: [
        { destination_id: "dst_webhook_crm", transform_id: "tf_crm_lead", delivery_mode: "realtime", enabled: true }
      ]
    },
    {
      id: "route_pageview_ga4",
      site_id: siteId,
      name: "Page views to GA4",
      description: "Captures page views for analytics rollups.",
      enabled: true,
      priority: 30,
      environment: "all",
      match: {
        event_types: ["PageView"],
        all: [{ path: "consent.analytics", op: "eq", value: true }]
      },
      consent_required: { analytics: true },
      sampling: { mode: "percentage", percentage: 100 },
      destinations: [{ destination_id: "dst_ga4", transform_id: "tf_ga4_pageview", delivery_mode: "queued", enabled: true }]
    }
  ] as EventRoute[],
  routesVersions: [1, 2, 3],
  destinations: [
    {
      id: "dst_meta",
      site_id: siteId,
      name: "Meta CAPI",
      kind: "meta",
      status: "active",
      secret_preview: "mapi_live_***91",
      config: { pixel_id: "123456", access_token: "stored" }
    },
    {
      id: "dst_ga4",
      site_id: siteId,
      name: "GA4 Measurement Protocol",
      kind: "ga4",
      status: "active",
      secret_preview: "ga4_***74",
      config: { measurement_id: "G-123ABC", api_secret: "stored" }
    },
    {
      id: "dst_webhook_crm",
      site_id: siteId,
      name: "CRM Webhook",
      kind: "webhook",
      status: "active",
      secret_preview: "whsec_***33",
      config: { url: "https://crm.example.com/events", auth_mode: "bearer" }
    }
  ] as DestinationRecord[],
  transformations: [
    {
      id: "tf_meta_purchase",
      site_id: siteId,
      name: "Meta purchase",
      destination_kind: "meta",
      version: 1,
      status: "active",
      mapping: { event_name: "Purchase", value: "$.ecommerce.value", currency: "$.ecommerce.currency" }
    },
    {
      id: "tf_ga4_purchase",
      site_id: siteId,
      name: "GA4 purchase",
      destination_kind: "ga4",
      version: 1,
      status: "active",
      mapping: { name: "purchase", transaction_id: "$.ecommerce.order_id", value: "$.ecommerce.value" }
    },
    {
      id: "tf_crm_lead",
      site_id: siteId,
      name: "CRM lead",
      destination_kind: "webhook",
      version: 1,
      status: "active",
      mapping: { lead_type: "sales", plan: "$.properties.plan" }
    }
  ] as TransformationRecord[],
  events: [] as EventGatewayEvent[],
  deliveries: [] as DeliveryRecord[],
  identities: [] as IdentityRecord[],
  jobs: [] as OperationJob[],
  realtime: [] as RealtimeItem[]
};

function timeLabel(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(11, 19);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seedEvent(input: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">): EventGatewayEvent {
  const timestamp = input.timestamp ?? now();
  return {
    version: "1.0",
    event_id: input.event_id ?? createId("evt"),
    site_id: input.site_id ?? siteId,
    type: input.type,
    source: input.source,
    environment: input.environment,
    timestamp,
    received_at: input.received_at ?? timestamp,
    anonymous_id: input.anonymous_id ?? createId("anon"),
    session_id: input.session_id ?? createId("sess"),
    canonical_user_id: input.canonical_user_id,
    user_id_hash: input.user_id_hash,
    email_hmac: input.email_hmac,
    customer_id_hash: input.customer_id_hash,
    page: input.page,
    campaign: input.campaign,
    click_ids: input.click_ids,
    ecommerce: input.ecommerce,
    device: input.device,
    geo: input.geo,
    consent: input.consent ?? { analytics: true, ads: false, functional: true, source: "default", updated_at: timestamp },
    properties: input.properties ?? {},
    routing: input.routing,
    debug: input.debug ?? { request_id: createId("req"), sdk_version: "seed" }
  };
}

function pushRealtime(item: RealtimeItem): void {
  state.realtime.unshift(item);
  state.realtime = state.realtime.slice(0, 24);
}

function ensureIdentity(event: EventGatewayEvent): void {
  const identityKey = event.canonical_user_id ?? event.email_hmac ?? event.user_id_hash ?? event.anonymous_id ?? createId("user");
  const existing = state.identities.find((item) => item.canonical_user_id === identityKey);

  if (existing) {
    if (event.anonymous_id && !existing.anonymous_ids.includes(event.anonymous_id)) existing.anonymous_ids.push(event.anonymous_id);
    if (event.session_id && !existing.session_ids.includes(event.session_id)) existing.session_ids.push(event.session_id);
    existing.last_seen_at = event.received_at;
    existing.consent = {
      analytics: event.consent?.analytics ?? existing.consent.analytics,
      ads: event.consent?.ads ?? existing.consent.ads,
      functional: event.consent?.functional ?? existing.consent.functional
    };
    return;
  }

  state.identities.unshift({
    canonical_user_id: identityKey,
    site_id: event.site_id,
    anonymous_ids: event.anonymous_id ? [event.anonymous_id] : [],
    session_ids: event.session_id ? [event.session_id] : [],
    email_hmac: event.email_hmac,
    user_id_hash: event.user_id_hash,
    consent: {
      analytics: event.consent?.analytics ?? true,
      ads: event.consent?.ads ?? false,
      functional: event.consent?.functional ?? true
    },
    last_seen_at: event.received_at
  });
}

function activeCompiledConfig(): CompiledSiteRoutingConfig {
  return compileRoutingConfig({
    site_id: siteId,
    version: state.activeRoutingVersion,
    routes: state.routes,
    destinations: Object.fromEntries(
      state.destinations.map((destination) => [
        destination.id,
        { id: destination.id, name: destination.name, kind: destination.kind, enabled: destination.status === "active", config: destination.config }
      ])
    ),
    transformations: Object.fromEntries(
      state.transformations.map((transformation) => [
        transformation.id,
        {
          id: transformation.id,
          name: transformation.name,
          version: transformation.version,
          enabled: transformation.status === "active",
          destination_kind: transformation.destination_kind,
          mapping: transformation.mapping
        }
      ])
    )
  });
}

function storeDeliveries(event: EventGatewayEvent, plan: RoutePlan): DeliveryRecord[] {
  const created = plan.deliveries.map<DeliveryRecord>((intent) => ({
    id: createId("dlv"),
    site_id: intent.site_id,
    event_id: intent.event_id,
    route_id: intent.route_id,
    destination_id: intent.destination_id,
    status: intent.delivery_mode === "realtime" ? "healthy" : "pending",
    latency_ms: intent.delivery_mode === "realtime" ? 120 : undefined,
    attempts: intent.delivery_mode === "realtime" ? 1 : 0,
    queued_at: now(),
    sent_at: intent.delivery_mode === "realtime" ? now() : undefined
  }));

  for (const delivery of created) {
    state.deliveries.unshift(delivery);
    const destination = state.destinations.find((item) => item.id === delivery.destination_id);
    const route = state.routes.find((item) => item.id === delivery.route_id);
    pushRealtime({
      time: timeLabel(now()),
      eventType: event.type,
      route: route?.name ?? delivery.route_id,
      status: delivery.status === "healthy" ? "matched" : delivery.status,
      destination: destination?.name ?? delivery.destination_id
    });
  }

  return created;
}

function initialSeed(): void {
  if (state.events.length > 0) return;

  const seededEvents = [
    seedEvent({
      event_id: "evt_purchase_001",
      type: "Purchase",
      source: "browser",
      environment: "production",
      timestamp: now() - 60_000,
      received_at: now() - 59_900,
      canonical_user_id: "user_001",
      page: { url: "https://alpha.store/checkout/success", path: "/checkout/success", title: "Thank You" },
      campaign: { source: "meta", medium: "paid_social", campaign: "launch-q1" },
      ecommerce: { order_id: "ORD-1001", value: 249.99, currency: "USD" },
      consent: { analytics: true, ads: true, functional: true, source: "cmp", updated_at: now() - 61_000 },
      properties: { plan: "edge", test_order: false }
    }),
    seedEvent({
      event_id: "evt_lead_002",
      type: "Lead",
      source: "server",
      environment: "production",
      timestamp: now() - 45_000,
      received_at: now() - 44_950,
      page: { url: "https://alpha.store/pricing", path: "/pricing", title: "Pricing" },
      consent: { analytics: true, ads: false, functional: true, source: "cmp", updated_at: now() - 45_500 },
      properties: { plan: "pro" }
    }),
    seedEvent({
      event_id: "evt_page_003",
      type: "PageView",
      source: "browser",
      environment: "production",
      timestamp: now() - 20_000,
      received_at: now() - 19_990,
      page: { url: "https://alpha.store/", path: "/", title: "Home" },
      consent: { analytics: true, ads: false, functional: true, source: "default", updated_at: now() - 21_000 },
      properties: { landing_variant: "b" }
    })
  ];

  for (const event of seededEvents.reverse()) {
    collectEvent(event);
  }
}

export function collectEvent(input: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">) {
  const event = seedEvent(input);
  const plan = buildRoutePlan(event, state.routes);
  event.routing = {
    route_ids: plan.route_ids,
    destination_ids: plan.deliveries.map((item) => item.destination_id),
    route_trace_id: plan.trace_id
  };
  state.events.unshift(event);
  ensureIdentity(event);
  const deliveries = storeDeliveries(event, plan);

  return {
    accepted: true,
    event,
    plan,
    deliveries
  };
}

export function batchCollect(inputs: Array<Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">>) {
  return inputs.map((input) => collectEvent(input));
}

export function debugCollect(input: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">) {
  const event = seedEvent(input);
  const plan = buildRoutePlan(event, state.routes);
  return {
    accepted: true,
    normalized_event: event,
    identity: {
      canonical_user_id: event.canonical_user_id ?? event.anonymous_id,
      session_id: event.session_id
    },
    routing: plan,
    storage: {
      raw_bucket_key: `${event.site_id}/${event.event_id}.json`,
      would_persist: true
    }
  };
}

export function identifyUser(site_id: string, payload: { canonical_user_id: string; anonymous_id?: string; session_id?: string; consent?: IdentityRecord["consent"] }) {
  const existing = state.identities.find((item) => item.site_id === site_id && item.canonical_user_id === payload.canonical_user_id);
  if (existing) {
    if (payload.anonymous_id && !existing.anonymous_ids.includes(payload.anonymous_id)) existing.anonymous_ids.push(payload.anonymous_id);
    if (payload.session_id && !existing.session_ids.includes(payload.session_id)) existing.session_ids.push(payload.session_id);
    if (payload.consent) existing.consent = payload.consent;
    existing.last_seen_at = now();
    return clone(existing);
  }

  const created: IdentityRecord = {
    canonical_user_id: payload.canonical_user_id,
    site_id,
    anonymous_ids: payload.anonymous_id ? [payload.anonymous_id] : [],
    session_ids: payload.session_id ? [payload.session_id] : [],
    consent: payload.consent ?? { analytics: true, ads: false, functional: true },
    last_seen_at: now()
  };
  state.identities.unshift(created);
  return clone(created);
}

export function listRoutes(site_id: string): EventRoute[] {
  initialSeed();
  return clone(state.routes.filter((item) => item.site_id === site_id));
}

export function getRoute(site_id: string, routeId: string): EventRoute | undefined {
  return clone(state.routes.find((item) => item.site_id === site_id && item.id === routeId));
}

export function createRoute(site_id: string, route: Omit<EventRoute, "id" | "site_id">): EventRoute {
  const created: EventRoute = { ...route, id: createId("route"), site_id };
  state.routes.push(created);
  return clone(created);
}

export function updateRoute(site_id: string, routeId: string, patch: Partial<EventRoute>): EventRoute | undefined {
  const route = state.routes.find((item) => item.site_id === site_id && item.id === routeId);
  if (!route) return undefined;
  Object.assign(route, patch, { id: route.id, site_id: route.site_id });
  return clone(route);
}

export function deleteRoute(site_id: string, routeId: string): boolean {
  const next = state.routes.filter((item) => !(item.site_id === site_id && item.id === routeId));
  const changed = next.length !== state.routes.length;
  state.routes = next;
  return changed;
}

export function duplicateRoute(site_id: string, routeId: string): EventRoute | undefined {
  const route = state.routes.find((item) => item.site_id === site_id && item.id === routeId);
  if (!route) return undefined;
  const copy: EventRoute = clone({ ...route, id: createId("route"), name: `${route.name} Copy`, priority: route.priority + 1 });
  state.routes.push(copy);
  return copy;
}

export function publishRoutes(site_id: string) {
  state.activeRoutingVersion += 1;
  state.routesVersions.push(state.activeRoutingVersion);
  return {
    version: state.activeRoutingVersion,
    config: activeCompiledConfig()
  };
}

export function rollbackRoutes(site_id: string, version?: number) {
  const fallback = version && state.routesVersions.includes(version) ? version : Math.max(1, state.activeRoutingVersion - 1);
  state.activeRoutingVersion = fallback;
  return {
    version: state.activeRoutingVersion,
    config: activeCompiledConfig()
  };
}

export function listRouteVersions(site_id: string) {
  return state.routesVersions.map((version) => ({
    version,
    active: version === state.activeRoutingVersion
  }));
}

export function simulateRoute(site_id: string, routeId: string, event: Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">) {
  const targetRoutes = routeId === "all" ? state.routes.filter((item) => item.site_id === site_id) : state.routes.filter((item) => item.site_id === site_id && item.id === routeId);
  return simulateRoutes(seedEvent({ ...event, site_id }), targetRoutes);
}

export function listDestinations(site_id: string): DestinationRecord[] {
  initialSeed();
  return clone(state.destinations.filter((item) => item.site_id === site_id));
}

export function getDestination(site_id: string, destinationId: string): DestinationRecord | undefined {
  return clone(state.destinations.find((item) => item.site_id === site_id && item.id === destinationId));
}

export function createDestination(site_id: string, destination: Omit<DestinationRecord, "id" | "site_id" | "secret_preview">): DestinationRecord {
  const created: DestinationRecord = {
    ...destination,
    id: createId("dst"),
    site_id,
    secret_preview: `${destination.kind}_***${Math.floor(Math.random() * 90 + 10)}`
  };
  state.destinations.push(created);
  return clone(created);
}

export function updateDestination(site_id: string, destinationId: string, patch: Partial<DestinationRecord>): DestinationRecord | undefined {
  const destination = state.destinations.find((item) => item.site_id === site_id && item.id === destinationId);
  if (!destination) return undefined;
  Object.assign(destination, patch, { id: destination.id, site_id: destination.site_id });
  return clone(destination);
}

export function deleteDestination(site_id: string, destinationId: string): boolean {
  const next = state.destinations.filter((item) => !(item.site_id === site_id && item.id === destinationId));
  const changed = next.length !== state.destinations.length;
  state.destinations = next;
  return changed;
}

export function testDestination(site_id: string, destinationId: string) {
  const destination = state.destinations.find((item) => item.site_id === site_id && item.id === destinationId);
  return {
    destination_id: destinationId,
    ok: Boolean(destination),
    latency_ms: 132,
    message: destination ? `Connection to ${destination.name} is healthy.` : "Destination not found."
  };
}

export function rotateDestinationSecret(site_id: string, destinationId: string) {
  const destination = state.destinations.find((item) => item.site_id === site_id && item.id === destinationId);
  if (!destination) return undefined;
  destination.secret_preview = `${destination.kind}_***${Math.floor(Math.random() * 90 + 10)}`;
  return clone(destination);
}

export function listTransformations(site_id: string): TransformationRecord[] {
  return clone(state.transformations.filter((item) => item.site_id === site_id));
}

export function getTransformation(site_id: string, transformId: string): TransformationRecord | undefined {
  return clone(state.transformations.find((item) => item.site_id === site_id && item.id === transformId));
}

export function listEvents(site_id: string): EventGatewayEvent[] {
  initialSeed();
  return clone(state.events.filter((item) => item.site_id === site_id).slice(0, 50));
}

export function getEvent(site_id: string, eventId: string): EventGatewayEvent | undefined {
  return clone(state.events.find((item) => item.site_id === site_id && item.event_id === eventId));
}

export function validateEvent(payload: Partial<EventGatewayEvent>) {
  const issues: string[] = [];
  if (!payload.type) issues.push("Missing event type");
  if (!payload.site_id) issues.push("Missing site_id");
  if (!payload.environment) issues.push("Missing environment");
  return {
    valid: issues.length === 0,
    issues
  };
}

export function listDeliveries(site_id: string): DeliveryRecord[] {
  initialSeed();
  return clone(state.deliveries.filter((item) => item.site_id === site_id).slice(0, 100));
}

export function getDeliverySummary(site_id: string) {
  const deliveries = state.deliveries.filter((item) => item.site_id === site_id);
  return {
    pending: deliveries.filter((item) => item.status === "pending").length,
    healthy: deliveries.filter((item) => item.status === "healthy").length,
    retrying: deliveries.filter((item) => item.status === "retrying").length,
    failed: deliveries.filter((item) => item.status === "failed").length
  };
}

export function processPendingDeliveries(site_id: string, limit = 25) {
  const deliveries = state.deliveries.filter((item) => item.site_id === site_id && (item.status === "pending" || item.status === "retrying")).slice(0, limit);
  const processed: DeliveryRecord[] = [];

  for (const delivery of deliveries) {
    delivery.attempts += 1;
    if (delivery.attempts >= 2 || delivery.destination_id !== "dst_meta") {
      delivery.status = "healthy";
      delivery.latency_ms = 170 + Math.floor(Math.random() * 100);
      delivery.sent_at = now();
      delivery.last_error = undefined;
    } else {
      delivery.status = "retrying";
      delivery.last_error = "Transient upstream timeout";
    }
    processed.push(clone(delivery));
  }

  return processed;
}

export function getRealtime(site_id: string): RealtimeItem[] {
  initialSeed();
  return clone(state.realtime);
}

export function getOverview(site_id: string, range: DateRangePreset = "24h"): OverviewSnapshot {
  initialSeed();
  const siteEvents = state.events.filter((item) => item.site_id === site_id);
  const siteDeliveries = state.deliveries.filter((item) => item.site_id === site_id);
  const successfulDeliveries = siteDeliveries.filter((item) => item.status === "healthy").length;
  const queueDepth = siteDeliveries.filter((item) => item.status === "pending" || item.status === "retrying").length;
  const matchedEvents = siteEvents.filter((item) => (item.routing?.route_ids?.length ?? 0) > 0).length;
  const byType = Object.entries(
    siteEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((left, right) => right[1] - left[1]);

  return {
    ingestPerMinute: Math.max(12, Math.round(siteEvents.length * 8)),
    matchedRate: siteEvents.length ? Number(((matchedEvents / siteEvents.length) * 100).toFixed(1)) : 0,
    deliverySuccess: siteDeliveries.length ? Number(((successfulDeliveries / siteDeliveries.length) * 100).toFixed(1)) : 0,
    activeRoutes: state.routes.filter((item) => item.enabled && item.site_id === site_id).length,
    compiledVersion: state.activeRoutingVersion,
    queueDepth,
    topSignals: byType.slice(0, 3).map(([label, value], index) => ({
      label,
      value,
      delta: index === 0 ? "+12.4%" : index === 1 ? "+4.8%" : "+1.9%"
    }))
  };
}

export function getHealth(site_id: string) {
  const summary = getDeliverySummary(site_id);
  return [
    { service: "Collector", status: "healthy", detail: `${state.events.length} stored events, p95 48ms` },
    { service: "Routing compiler", status: "healthy", detail: `Version ${state.activeRoutingVersion} active` },
    { service: "Forwarder queue", status: summary.pending > 0 ? "pending" : "healthy", detail: `${summary.pending} queued, ${summary.retrying} retrying` },
    { service: "Destination auth", status: "healthy", detail: `${state.destinations.length} destination credentials loaded` }
  ];
}

export function getQueues(site_id: string) {
  const summary = getDeliverySummary(site_id);
  return {
    delivery_queue: {
      depth: summary.pending + summary.retrying,
      retrying: summary.retrying
    },
    dlq: {
      depth: summary.failed
    }
  };
}

export function getDlq(site_id: string): DeliveryRecord[] {
  return clone(state.deliveries.filter((item) => item.site_id === site_id && item.status === "failed"));
}

export function replayDlq(site_id: string) {
  const failed = state.deliveries.filter((item) => item.site_id === site_id && item.status === "failed");
  for (const delivery of failed) {
    delivery.status = "retrying";
    delivery.last_error = undefined;
  }
  return createOperation(site_id, "dlq_replay", `Queued ${failed.length} failed deliveries for retry.`);
}

export function replayEvent(site_id: string, eventId: string) {
  const event = state.events.find((item) => item.site_id === site_id && item.event_id === eventId);
  if (!event) return undefined;
  const plan = buildRoutePlan(event, state.routes);
  storeDeliveries(event, plan);
  return createOperation(site_id, "replay", `Replayed deliveries for event ${eventId}.`);
}

export function backfillAttribution(site_id: string) {
  return createOperation(site_id, "backfill_attribution", "Started attribution backfill for the last 7 days.");
}

export function exportRaw(site_id: string) {
  return createOperation(site_id, "export", "Prepared raw event export job.");
}

function createOperation(site_id: string, type: OperationJob["type"], detail: string): OperationJob {
  const job: OperationJob = {
    id: createId("job"),
    site_id,
    type,
    status: "completed",
    progress: 100,
    created_at: now(),
    finished_at: now(),
    detail
  };
  state.jobs.unshift(job);
  return clone(job);
}

export function getJob(site_id: string, jobId: string): OperationJob | undefined {
  return clone(state.jobs.find((item) => item.site_id === site_id && item.id === jobId));
}

export function listJobs(site_id: string): OperationJob[] {
  return clone(state.jobs.filter((item) => item.site_id === site_id));
}

export function listSchemas(site_id: string): SchemaSummary[] {
  const events = state.events.filter((item) => item.site_id === site_id);
  const grouped = new Map<string, EventGatewayEvent[]>();
  for (const event of events) {
    const bucket = grouped.get(event.type) ?? [];
    bucket.push(event);
    grouped.set(event.type, bucket);
  }

  return Array.from(grouped.entries()).map(([event_type, sample]) => ({
    event_type,
    count: sample.length,
    sample_paths: extractPaths(sample[0]).slice(0, 8)
  }));
}

function extractPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) return extractPaths(child, path);
    return [path];
  });
}

export function listUsers(site_id: string): IdentityRecord[] {
  return clone(state.identities.filter((item) => item.site_id === site_id));
}

export function getJourneys(site_id: string, canonicalUserId: string): CursorPage<EventGatewayEvent> {
  const items = state.events.filter((item) => item.site_id === site_id && (item.canonical_user_id === canonicalUserId || item.anonymous_id === canonicalUserId));
  return {
    items: clone(items),
    has_more: false
  };
}

export function getConsent(site_id: string) {
  return clone(
    state.identities
      .filter((item) => item.site_id === site_id)
      .map((item) => ({
        canonical_user_id: item.canonical_user_id,
        consent: item.consent,
        last_seen_at: item.last_seen_at
      }))
  );
}

export function getInstallConfig(site_id: string) {
  return {
    site_id,
    collector_url: "https://collector.eventsgateway.local/v1/collect",
    sdk_loader: "<script src=\"https://cdn.eventsgateway.local/tracker.js\" data-site-id=\"site_alpha\"></script>",
    npm_package: "@eventsgateway/tracker-sdk",
    sample_init: "tracker.init({ siteId: 'site_alpha', endpoint: 'https://collector.eventsgateway.local/v1/collect' })"
  };
}

export function getCompiledRouting(site_id: string) {
  return clone(activeCompiledConfig());
}

export function resetPlatformState() {
  state.events = [];
  state.deliveries = [];
  state.identities = [];
  state.jobs = [];
  state.realtime = [];
  state.activeRoutingVersion = 3;
  initialSeed();
}

initialSeed();
