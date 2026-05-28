import type { Environment, EventSource } from "../../shared/src/index";

export type EventGatewayEvent = {
  version: "1.0";
  event_id: string;
  site_id: string;
  type: string;
  source: EventSource;
  environment: Environment;
  timestamp: number;
  received_at: number;
  anonymous_id?: string;
  session_id?: string;
  canonical_user_id?: string;
  user_id_hash?: string;
  email_hmac?: string;
  customer_id_hash?: string;
  page?: {
    url?: string;
    path?: string;
    title?: string;
    referrer?: string;
    referrer_domain?: string;
  };
  campaign?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  click_ids?: {
    gclid?: string;
    fbclid?: string;
    fbc?: string;
    fbp?: string;
    msclkid?: string;
    ttclid?: string;
  };
  ecommerce?: {
    order_id?: string;
    value?: number;
    currency?: string;
    items?: Array<{
      item_id?: string;
      sku?: string;
      name?: string;
      category?: string;
      quantity?: number;
      price?: number;
    }>;
  };
  device?: {
    user_agent_hash?: string;
    browser?: string;
    os?: string;
    device_type?: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
    language?: string;
    screen_width?: number;
    screen_height?: number;
  };
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  consent?: {
    analytics?: boolean;
    ads?: boolean;
    functional?: boolean;
    source?: "default" | "cmp" | "api";
    updated_at?: number;
  };
  properties?: Record<string, unknown>;
  routing?: {
    route_ids?: string[];
    destination_ids?: string[];
    route_trace_id?: string;
  };
  debug?: {
    request_id: string;
    sdk_version?: string;
    ip_hash?: string;
  };
};

export type RouteCondition = {
  path: string;
  op:
    | "exists"
    | "not_exists"
    | "eq"
    | "neq"
    | "in"
    | "not_in"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "regex"
    | "gt"
    | "gte"
    | "lt"
    | "lte";
  value?: unknown;
  case_sensitive?: boolean;
};

export type RouteMatch = {
  event_types?: string[];
  all?: RouteCondition[];
  any?: RouteCondition[];
  none?: RouteCondition[];
};

export type EventRoute = {
  id: string;
  site_id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  environment: Environment | "all";
  match: RouteMatch;
  consent_required?: {
    analytics?: boolean;
    ads?: boolean;
    functional?: boolean;
  };
  sampling?: {
    mode: "all" | "percentage" | "hash_mod";
    percentage?: number;
    hash_key?: string;
  };
  destinations: Array<{
    destination_id: string;
    transform_id?: string;
    delivery_mode: "queued" | "realtime" | "batch";
    enabled: boolean;
  }>;
};

export type RouteTraceItem = {
  route_id: string;
  route_name: string;
  matched: boolean;
  skipped_reason?: string;
  conditions?: Array<{
    path: string;
    op: string;
    expected?: unknown;
    actual?: unknown;
    matched: boolean;
  }>;
};

export type DeliveryIntent = {
  site_id: string;
  event_id: string;
  route_id: string;
  destination_id: string;
  transform_id?: string;
  delivery_mode: "queued" | "realtime" | "batch";
  idempotency_key: string;
};

export type RoutePlan = {
  trace_id: string;
  route_ids: string[];
  deliveries: DeliveryIntent[];
  trace: RouteTraceItem[];
};
