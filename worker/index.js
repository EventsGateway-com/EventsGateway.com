import { handleApiRequest } from "../apps/api-worker/src/index.ts";
import {
  handleCollectorRequest,
  handleCollectorScheduled
} from "../apps/collector-worker/src/index.ts";
import { handleForwarderQueue } from "../apps/forwarder-worker/src/index.ts";
import { VisitorStateDurableObject as BaseVisitorStateDurableObject } from "../packages/runtime/src/visitor-state.ts";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "access-control-allow-origin": "*",
      ...init.headers
    }
  });
}

const INFRA_STATUS_CACHE_MS = 8000;
let infraStatusCache = {
  expiresAt: 0,
  payload: null
};

function roundUsd(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function isoHourKey(input) {
  const date = new Date(input);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function hourLabel(input) {
  return new Date(input).toISOString().slice(11, 16);
}

function buildSyntheticHistory() {
  const hours = [];
  const now = Date.now();

  for (let index = 23; index >= 0; index -= 1) {
    const bucketDate = new Date(now - index * 60 * 60 * 1000);
    const bucketStart = isoHourKey(bucketDate);
    const hourOfDay = bucketDate.getUTCHours();
    const events = Math.max(18, Math.round(220 + Math.sin(hourOfDay / 24 * Math.PI * 2) * 120 + (23 - index) * 6));
    const valueUsd = roundUsd(events * 6.35 + (hourOfDay % 3) * 42.5);
    hours.push({
      bucket_start: bucketStart,
      label: hourLabel(bucketStart),
      routed_events: events,
      routed_value_usd: valueUsd
    });
  }

  return hours;
}

async function queryTelemetryRows(db, siteId) {
  const result = await db.prepare(
    `
      SELECT
        ce.event_id,
        ce.event_type,
        MAX(da.queued_at) AS routed_at,
        COALESCE(
          CASE
            WHEN ce.event_type = 'Purchase' THEN CAST(json_extract(ce.payload_json, '$.ecommerce.value') AS REAL)
            WHEN ce.event_type = 'Lead' THEN COALESCE(
              CAST(json_extract(ce.payload_json, '$.properties.lead_value_usd') AS REAL),
              CAST(json_extract(ce.payload_json, '$.properties.value_usd') AS REAL),
              CAST(json_extract(ce.payload_json, '$.properties.value') AS REAL),
              CAST(json_extract(ce.payload_json, '$.properties.revenue_usd') AS REAL)
            )
            ELSE 0
          END,
          0
        ) AS routed_value_usd
      FROM collected_events ce
      INNER JOIN delivery_attempts da ON da.collected_event_id = ce.id
      WHERE ce.site_id = ?
        AND datetime(da.queued_at) >= datetime('now', '-24 hours')
      GROUP BY ce.event_id, ce.event_type, ce.payload_json
      ORDER BY routed_at DESC
    `
  ).bind(siteId).all();

  return result.results ?? [];
}

function buildTelemetryPayload(rows) {
  if (!rows.length) {
    const history = buildSyntheticHistory();
    return {
      site_id: "site_alpha",
      window_seconds: 120,
      current_routed_events: history[history.length - 1]?.routed_events ?? 0,
      current_routed_value_usd: history[history.length - 1]?.routed_value_usd ?? 0,
      last_24h_routed_events: history.reduce((sum, item) => sum + item.routed_events, 0),
      last_24h_routed_value_usd: roundUsd(history.reduce((sum, item) => sum + item.routed_value_usd, 0)),
      history
    };
  }

  const now = Date.now();
  const currentWindowStart = now - 2 * 60 * 1000;
  const buckets = new Map();

  for (let index = 23; index >= 0; index -= 1) {
    const bucketStart = isoHourKey(now - index * 60 * 60 * 1000);
    buckets.set(bucketStart, {
      bucket_start: bucketStart,
      label: hourLabel(bucketStart),
      routed_events: 0,
      routed_value_usd: 0
    });
  }

  let currentRoutedEvents = 0;
  let currentRoutedValueUsd = 0;
  let last24hRoutedEvents = 0;
  let last24hRoutedValueUsd = 0;

  for (const row of rows) {
    const routedAt = Date.parse(row.routed_at);
    if (!Number.isFinite(routedAt)) continue;

    const valueUsd = roundUsd(row.routed_value_usd);
    last24hRoutedEvents += 1;
    last24hRoutedValueUsd += valueUsd;

    if (routedAt >= currentWindowStart) {
      currentRoutedEvents += 1;
      currentRoutedValueUsd += valueUsd;
    }

    const bucketStart = isoHourKey(routedAt);
    const bucket = buckets.get(bucketStart);
    if (bucket) {
      bucket.routed_events += 1;
      bucket.routed_value_usd = roundUsd(bucket.routed_value_usd + valueUsd);
    }
  }

  return {
    site_id: rows[0]?.site_id ?? "site_alpha",
    window_seconds: 120,
    current_routed_events: currentRoutedEvents,
    current_routed_value_usd: roundUsd(currentRoutedValueUsd),
    last_24h_routed_events: last24hRoutedEvents,
    last_24h_routed_value_usd: roundUsd(last24hRoutedValueUsd),
    history: Array.from(buckets.values())
  };
}

async function handleLiveStats(env) {
  const siteId = env.PUBLIC_STATS_SITE_ID || "site_alpha";

  if (!env.DB) {
    return json(buildTelemetryPayload([]));
  }

  try {
    const rows = await queryTelemetryRows(env.DB, siteId);
    return json(buildTelemetryPayload(rows));
  } catch {
    return json(buildTelemetryPayload([]));
  }
}

async function countKvItems(namespace) {
  if (!namespace?.list) {
    return { count: 0, status: "disabled" };
  }

  let count = 0;
  let cursor;

  do {
    const page = await namespace.list({
      limit: 1000,
      cursor
    });
    count += Array.isArray(page.keys) ? page.keys.length : 0;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return { count, status: "ready" };
}

async function countSingleRow(db, sql, ...params) {
  const row = await db.prepare(sql).bind(...params).first();
  return Number(row?.count ?? 0);
}

function buildSparkline(seed, value) {
  const safeValue = Math.max(Number(value) || 0, 1);
  return Array.from({ length: 18 }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.7 + seed) * 0.25 + 0.75;
    const drift = 0.6 + index / 30;
    return Math.max(8, Math.round(Math.log10(safeValue + 10) * 22 * wave * drift));
  });
}

async function queryInfrastructureSnapshot(env) {
  const kvMetrics = await countKvItems(env.CACHE);

  if (!env.DB) {
    return {
      updated_at: new Date().toISOString(),
      refresh_seconds: 3,
      totals: {
        kv_items: kvMetrics.count,
        do_items: 0,
        d1_rows: 0,
        r2_items: 0
      },
      cards: [
        {
          key: "kv",
          label: "KV items",
          value: kvMetrics.count,
          status: kvMetrics.status,
          description: "Published edge configuration and cache records available in KV.",
          sparkline: buildSparkline(1, kvMetrics.count)
        },
        {
          key: "do",
          label: "DO items",
          value: 0,
          status: "waiting",
          description: "Visitor state snapshots are not available because D1 is not bound on this edge.",
          sparkline: buildSparkline(2, 0)
        },
        {
          key: "d1",
          label: "D1 rows",
          value: 0,
          status: "waiting",
          description: "Operational storage is not currently readable from the public worker.",
          sparkline: buildSparkline(3, 0)
        },
        {
          key: "r2",
          label: "R2 items",
          value: 0,
          status: "waiting",
          description: "Ledger object counts will appear after R2 is enabled and events are archived.",
          sparkline: buildSparkline(4, 0)
        }
      ]
    };
  }

  const [
    sitesCount,
    domainsCount,
    keysCount,
    collectedEventsCount,
    identityCount,
    deliveryCount,
    routeCount,
    destinationCount,
    transformationCount,
    routeVersionCount,
    billingCustomerCount,
    billingSubscriptionCount,
    billingInvoiceCount,
    billingTransactionCount,
    billingReminderCount,
    visitorStateCount,
    ledgerItemCount
  ] = await Promise.all([
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM sites"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_domains"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_keys"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM collected_events"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM identity_profiles"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM delivery_attempts"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_routes"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_destinations"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_transformations"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM site_route_versions"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM billing_customers"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM billing_subscriptions"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM billing_invoices"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM billing_transactions"),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM billing_reminders"),
    countSingleRow(
      env.DB,
      "SELECT COUNT(DISTINCT json_extract(visitor_state_json, '$.visitor_key')) AS count FROM collected_events WHERE visitor_state_json IS NOT NULL"
    ),
    countSingleRow(env.DB, "SELECT COUNT(*) AS count FROM collected_events WHERE ledger_r2_key IS NOT NULL")
  ]);

  const d1Rows = [
    sitesCount,
    domainsCount,
    keysCount,
    collectedEventsCount,
    identityCount,
    deliveryCount,
    routeCount,
    destinationCount,
    transformationCount,
    routeVersionCount,
    billingCustomerCount,
    billingSubscriptionCount,
    billingInvoiceCount,
    billingTransactionCount,
    billingReminderCount
  ].reduce((sum, value) => sum + value, 0);

  return {
    updated_at: new Date().toISOString(),
    refresh_seconds: 3,
    totals: {
      kv_items: kvMetrics.count,
      do_items: visitorStateCount,
      d1_rows: d1Rows,
      r2_items: ledgerItemCount
    },
    cards: [
      {
        key: "kv",
        label: "KV items",
        value: kvMetrics.count,
        status: kvMetrics.status,
        description: "Published edge configuration and hot cache records currently stored in KV.",
        sparkline: buildSparkline(1, kvMetrics.count)
      },
      {
        key: "do",
        label: "DO items",
        value: visitorStateCount,
        status: visitorStateCount > 0 ? "ready" : "warming",
        description: "Live visitor state snapshots mirrored from Durable Objects through the ingestion path.",
        sparkline: buildSparkline(2, visitorStateCount)
      },
      {
        key: "d1",
        label: "D1 rows",
        value: d1Rows,
        status: d1Rows > 0 ? "ready" : "warming",
        description: "Operational rows across routing, identity, deliveries, billing, and recent event history.",
        sparkline: buildSparkline(3, d1Rows)
      },
      {
        key: "r2",
        label: "R2 items",
        value: ledgerItemCount,
        status: ledgerItemCount > 0 ? "ready" : "waiting",
        description: ledgerItemCount > 0
          ? "Raw ledger objects successfully archived for longer-lived event history."
          : "Ledger writes have not started yet or R2 is not enabled on this account.",
        sparkline: buildSparkline(4, ledgerItemCount)
      }
    ]
  };
}

async function handleInfrastructureStatus(env) {
  const now = Date.now();
  if (infraStatusCache.payload && infraStatusCache.expiresAt > now) {
    return json(infraStatusCache.payload);
  }

  try {
    const payload = await queryInfrastructureSnapshot(env);
    infraStatusCache = {
      payload,
      expiresAt: now + INFRA_STATUS_CACHE_MS
    };
    return json(payload);
  } catch {
    const payload = {
      updated_at: new Date().toISOString(),
      refresh_seconds: 3,
      totals: {
        kv_items: 0,
        do_items: 0,
        d1_rows: 0,
        r2_items: 0
      },
      cards: [
        {
          key: "kv",
          label: "KV items",
          value: 0,
          status: "error",
          description: "The public worker could not query infrastructure telemetry right now.",
          sparkline: buildSparkline(1, 0)
        },
        {
          key: "do",
          label: "DO items",
          value: 0,
          status: "error",
          description: "The public worker could not query infrastructure telemetry right now.",
          sparkline: buildSparkline(2, 0)
        },
        {
          key: "d1",
          label: "D1 rows",
          value: 0,
          status: "error",
          description: "The public worker could not query infrastructure telemetry right now.",
          sparkline: buildSparkline(3, 0)
        },
        {
          key: "r2",
          label: "R2 items",
          value: 0,
          status: "error",
          description: "The public worker could not query infrastructure telemetry right now.",
          sparkline: buildSparkline(4, 0)
        }
      ]
    };
    return json(payload, { status: 200 });
  }
}

async function resolvePublicSiteTracking(env, hostname) {
  if (!env.DB) {
    return null;
  }

  const row = await env.DB.prepare(
    `
      SELECT
        sd.site_id AS site_id,
        sk.public_key AS api_key
      FROM site_domains sd
      INNER JOIN site_keys sk
        ON sk.site_id = sd.site_id
       AND sk.status = 'active'
      WHERE sd.domain = ?
      ORDER BY sk.created_at ASC
      LIMIT 1
    `
  ).bind(hostname).first();

  if (!row?.site_id || !row?.api_key) {
    return null;
  }

  return {
    enabled: true,
    site_id: row.site_id,
    api_key: row.api_key,
    loader_url: "/e/",
    endpoint: "/i/"
  };
}

function isCollectorPath(pathname) {
  return pathname === "/e"
    || pathname === "/e/"
    || pathname === "/i"
    || pathname === "/i/"
    || pathname === "/i/identify"
    || pathname === "/v1/collect"
    || pathname === "/v1/batch"
    || pathname === "/v1/identify"
    || pathname === "/v1/debug/collect"
    || pathname === "/health";
}

async function handleDashboardRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.startsWith("/assets/") || pathname === "/favicon.ico" || pathname === "/manifest.webmanifest") {
    return env.ASSETS.fetch(request);
  }

  const shellRequest = new Request(new URL("/__dashboard/dashboard-shell.txt", request.url), request);
  const shellResponse = await env.ASSETS.fetch(shellRequest);
  if (!shellResponse.ok) {
    return shellResponse;
  }

  const headers = new Headers(shellResponse.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(shellResponse.body, {
    status: 200,
    headers
  });
}

async function handlePublicSiteTracking(request, env) {
  const hostname = new URL(request.url).hostname.toLowerCase();

  try {
    const config = await resolvePublicSiteTracking(env, hostname);
    return json(config ?? { enabled: false });
  } catch {
    return json({ enabled: false }, { status: 200 });
  }
}

async function handleContactRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type"
      }
    });
  }

  if (request.method !== "POST") {
    return json({ error: { message: "Method not allowed." } }, { status: 405 });
  }

  const apiKey = env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: { message: "Contact email is not configured." } }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { message: "Invalid contact payload." } }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const department = String(body?.department || "").trim();
  const subject = String(body?.subject || "").trim();
  const company = String(body?.company || "").trim();
  const website = String(body?.website || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !department || !subject || !message) {
    return json({ error: { message: "Complete all required contact fields." } }, { status: 400 });
  }

  const senderEmail = env.BREVO_SENDER_EMAIL?.trim() || "no-reply@eventsgateway.com";
  const recipientEmail = "marian@agilemedia.com";
  const formattedSubject = `[EVENTS Gateway Contact] ${department}: ${subject}`;
  const htmlContent = [
    "<p>New contact request from eventsgateway.com</p>",
    `<p><strong>Department:</strong> ${department}</p>`,
    `<p><strong>Name:</strong> ${name}</p>`,
    `<p><strong>Email:</strong> ${email}</p>`,
    `<p><strong>Company:</strong> ${company || "-"}</p>`,
    `<p><strong>Website:</strong> ${website || "-"}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${message.replace(/\n/g, "<br />")}</p>`
  ].join("");
  const textContent = [
    "New contact request from eventsgateway.com",
    `Department: ${department}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "-"}`,
    `Website: ${website || "-"}`,
    "Message:",
    message
  ].join("\n");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: "EVENTS Gateway"
      },
      replyTo: {
        email,
        name
      },
      to: [{ email: recipientEmail, name: "Marian Vasile" }],
      subject: formattedSubject,
      htmlContent,
      textContent
    })
  });

  if (!response.ok) {
    return json({ error: { message: "Unable to deliver the contact email right now." } }, { status: 502 });
  }

  return json({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    if (isCollectorPath(pathname)) {
      return handleCollectorRequest(request, env);
    }

    if (hostname === "www.eventsgateway.com") {
      url.hostname = "eventsgateway.com";
      return Response.redirect(url.toString(), 301);
    }

    if (hostname === "dash.eventsgateway.com") {
      return handleDashboardRequest(request, env);
    }

    if (hostname === "api.eventsgateway.com") {
      return handleApiRequest(request, env);
    }

    if (hostname === "e.eventsgateway.com" || hostname === "sources.eventsgateway.com") {
      return handleCollectorRequest(request, env);
    }

    if (pathname === "/api/public-site-tracking") {
      return handlePublicSiteTracking(request, env);
    }

    if (pathname === "/api/contact") {
      return handleContactRequest(request, env);
    }

    if (pathname === "/api/live-stats") {
      return handleLiveStats(env);
    }

    if (pathname === "/api/infrastructure-status") {
      return handleInfrastructureStatus(env);
    }

    return env.ASSETS.fetch(request);
  },
  async queue(batch, env) {
    await handleForwarderQueue(batch, env);
  },
  async scheduled(controller, env) {
    await handleCollectorScheduled(controller, env);
  }
};

export class VisitorStateDurableObject extends BaseVisitorStateDurableObject {}
