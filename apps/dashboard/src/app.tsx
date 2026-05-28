import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RouteTraceItem } from "../../../packages/schemas/src/index";
import { formatRelativeWindow, statusColors } from "../../../packages/shared/src/index";
import {
  currentContext,
  dashboardApi,
  qk
} from "./mock-data";

type NavItem = {
  label: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function sitePath(segment: string): string {
  return `/app/orgs/${currentContext.orgId}/projects/${currentContext.projectId}/sites/${currentContext.siteId}/${segment}`;
}

const navGroups: NavGroup[] = [
  {
    label: "Insights",
    items: [
      { label: "Overview", href: sitePath("overview") },
      { label: "Realtime", href: sitePath("realtime") },
      { label: "Acquisition", href: sitePath("acquisition") },
      { label: "Attribution", href: sitePath("attribution") },
      { label: "Funnels", href: sitePath("funnels") },
      { label: "Event Explorer", href: sitePath("events/explorer") },
      { label: "Event Schemas", href: sitePath("events/schemas") }
    ]
  },
  {
    label: "Events Gateway",
    items: [
      { label: "Routing Rules", href: sitePath("routing/routes") },
      { label: "Transformations", href: sitePath("routing/transformations") },
      { label: "Destinations", href: sitePath("destinations") },
      { label: "Delivery Logs", href: sitePath("deliveries") },
      { label: "Replay", href: sitePath("operations/replay") }
    ]
  },
  {
    label: "Identity",
    items: [
      { label: "Users", href: sitePath("identity/users") },
      { label: "Journeys", href: sitePath("identity/journeys") },
      { label: "Merge Rules", href: sitePath("identity/merge-rules") },
      { label: "Consent", href: sitePath("identity/consent") }
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Health", href: sitePath("operations/health") },
      { label: "Queues", href: sitePath("operations/queues") },
      { label: "Audit", href: sitePath("operations/audit") },
      { label: "Install", href: sitePath("settings/install") },
      { label: "Domains", href: sitePath("settings/domains") },
      { label: "API Keys", href: sitePath("settings/api-keys") },
      { label: "Members", href: sitePath("settings/members") },
      { label: "Settings", href: sitePath("settings/general") }
    ]
  }
];

function AppShell() {
  const params = useParams();
  const location = useLocation();
  const breadcrumb = location.pathname.split("/").filter(Boolean).slice(-2).join(" / ");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    if (isSidebarOpen) {
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className="eg-shell">
      <button
        aria-hidden={!isSidebarOpen}
        className={`eg-sidebar-backdrop${isSidebarOpen ? " is-visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        tabIndex={isSidebarOpen ? 0 : -1}
        type="button"
      />

      <aside className={`eg-sidebar${isSidebarOpen ? " is-open" : ""}`} id="dashboard-navigation">
        <div className="eg-brand">
          <div className="eg-brand__mark">EG</div>
          <div>
            <strong>EventsGateway</strong>
            <span>Control center</span>
          </div>
          <button
            aria-label="Close navigation"
            className="eg-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="eg-sidebar__content">
          {navGroups.map((group) => (
            <div className="eg-sidebar__group" key={group.label}>
              <p>{group.label}</p>
              <nav>
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) => `eg-nav-link${isActive ? " is-active" : ""}`}
                    key={item.href}
                    to={item.href}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          <div className="eg-sidebar__footer">
            <span>Compiled routing</span>
            <strong>v3 active</strong>
          </div>
        </div>
      </aside>

      <div className="eg-main">
        <header className="eg-topbar">
          <div className="eg-topbar__primary">
            <button
              aria-controls="dashboard-navigation"
              aria-expanded={isSidebarOpen}
              className="eg-mobile-nav-toggle"
              onClick={() => setIsSidebarOpen((open) => !open)}
              type="button"
            >
              Menu
            </button>
            <div>
              <div className="eyebrow">Org / Project / Site</div>
              <h1>{currentContext.siteName}</h1>
              <p>{params.orgId}.{params.projectId}.{params.siteId}</p>
            </div>
          </div>
          <div className="eg-topbar__controls">
            <div className="eg-pill">{breadcrumb}</div>
            <div className="eg-pill">{currentContext.environment}</div>
            <div className="eg-pill">{formatRelativeWindow("24h")}</div>
            <div className="eg-health-pill is-success">API-backed mock runtime</div>
          </div>
        </header>

        <main className="eg-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function OverviewPage() {
  const overviewQuery = useQuery({
    queryKey: qk.overview(currentContext.siteId, currentContext.dateRange),
    queryFn: dashboardApi.fetchOverview
  });

  if (!overviewQuery.data) return <StateCard title="Loading overview" description="Building the latest metrics snapshot." />;

  return (
    <div className="eg-page">
      <PageIntro
        title="Overview"
        description="Central view for ingestion, matching, delivery success and active routing state."
        action={<button className="eg-button eg-button--primary">Publish routing changes</button>}
      />

      <div className="eg-metric-grid">
        <MetricCard label="Events per minute" value={overviewQuery.data.ingestPerMinute} detail="Current ingest lane" />
        <MetricCard label="Matched rate" value={`${overviewQuery.data.matchedRate}%`} detail="Events that resolve into at least one route" />
        <MetricCard label="Delivery success" value={`${overviewQuery.data.deliverySuccess}%`} detail="Last 24h delivery performance" />
        <MetricCard label="Queue depth" value={overviewQuery.data.queueDepth} detail="Forwarder backlog" />
      </div>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Top signals" subtitle="Highest volume event families in the active window">
          <div className="eg-list">
            {overviewQuery.data.topSignals.map((signal) => (
              <div className="eg-list__row" key={signal.label}>
                <div>
                  <strong>{signal.label}</strong>
                  <span>{signal.value.toLocaleString()} events</span>
                </div>
                <StatusBadge status="healthy">{signal.delta}</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Routing state" subtitle="Production compiler and active pipeline">
          <div className="eg-stack">
            <div className="eg-stat-line">
              <span>Compiled version</span>
              <strong>v{overviewQuery.data.compiledVersion}</strong>
            </div>
            <div className="eg-stat-line">
              <span>Active routes</span>
              <strong>{overviewQuery.data.activeRoutes}</strong>
            </div>
            <div className="eg-stat-line">
              <span>Pipeline posture</span>
              <strong>Collect once, route everywhere</strong>
            </div>
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function RealtimePage() {
  const realtimeQuery = useQuery({
    queryKey: ["sites", currentContext.siteId, "realtime"],
    queryFn: dashboardApi.fetchRealtime,
    refetchInterval: 5000
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Realtime"
        description="Live feed of event matches, retries and routed destinations."
        action={<button className="eg-button">Pause stream</button>}
      />
      <SurfaceCard title="Realtime event rail" subtitle="Updates every 5 seconds">
        {!realtimeQuery.data ? (
          <StateCard title="Loading stream" description="Requesting the latest event rail." compact />
        ) : (
          <div className="eg-stream">
            {realtimeQuery.data.map((item) => (
              <div className="eg-stream__row" key={`${item.time}-${item.eventType}-${item.destination}`}>
                <span className="eg-stream__time">{item.time}</span>
                <div>
                  <strong>{item.eventType}</strong>
                  <p>{item.route}</p>
                </div>
                <StatusBadge status={item.status}>{item.status}</StatusBadge>
                <span className="eg-stream__dest">{item.destination}</span>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function AcquisitionPage() {
  const eventsQuery = useQuery({
    queryKey: qk.events(currentContext.siteId),
    queryFn: dashboardApi.fetchEvents
  });

  if (!eventsQuery.data) {
    return <StateCard title="Loading acquisition" description="Collecting source, landing page and campaign data." />;
  }

  const sourceCounts = eventsQuery.data.reduce<Record<string, number>>((acc, event) => {
    const source = event.campaign?.source ?? event.source;
    acc[source] = (acc[source] ?? 0) + 1;
    return acc;
  }, {});
  const landingCounts = eventsQuery.data.reduce<Record<string, number>>((acc, event) => {
    const path = event.page?.path ?? "/";
    acc[path] = (acc[path] ?? 0) + 1;
    return acc;
  }, {});
  const sourceRows = Object.entries(sourceCounts).sort((left, right) => right[1] - left[1]);
  const landingRows = Object.entries(landingCounts).sort((left, right) => right[1] - left[1]).slice(0, 5);
  const totalEvents = eventsQuery.data.length;

  return (
    <div className="eg-page">
      <PageIntro
        title="Acquisition"
        description="Campaign and source view for how traffic enters the event pipeline before identity and routing."
      />

      <div className="eg-metric-grid">
        <MetricCard label="Tracked sessions" value={totalEvents} detail="Recent browser and server touchpoints" />
        <MetricCard label="Top source" value={sourceRows[0]?.[0] ?? "n/a"} detail="Highest share of observed traffic" />
        <MetricCard label="Landing paths" value={landingRows.length} detail="Pages acting as acquisition entry points" />
        <MetricCard label="Ad-consented events" value={eventsQuery.data.filter((item) => item.consent?.ads).length} detail="Eligible for ads destinations" />
      </div>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Source mix" subtitle="Observed event volume by campaign source and collection channel">
          <div className="eg-list">
            {sourceRows.map(([source, count]) => (
              <div className="eg-list__row" key={source}>
                <div>
                  <strong>{source}</strong>
                  <span>{Math.round((count / Math.max(totalEvents, 1)) * 100)}% of tracked volume</span>
                </div>
                <StatusBadge status="healthy">{count} events</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Top landing pages" subtitle="Entry paths worth connecting to campaign and funnel analysis">
          <div className="eg-list">
            {landingRows.map(([path, count]) => (
              <div className="eg-list__row" key={path}>
                <div>
                  <strong>{path}</strong>
                  <span>{count} tracked entries</span>
                </div>
                <StatusBadge status="matched">entry</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function AttributionPage() {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({
    queryKey: qk.events(currentContext.siteId),
    queryFn: dashboardApi.fetchEvents
  });
  const jobsQuery = useQuery({
    queryKey: qk.jobs(currentContext.siteId),
    queryFn: dashboardApi.fetchJobs
  });
  const backfillMutation = useMutation({
    mutationFn: dashboardApi.backfillAttribution,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.jobs(currentContext.siteId) });
    }
  });

  if (!eventsQuery.data) {
    return <StateCard title="Loading attribution" description="Preparing revenue and source attribution summaries." />;
  }

  const purchases = eventsQuery.data.filter((item) => item.type === "Purchase" && item.ecommerce?.value);
  const revenueBySource = purchases.reduce<Record<string, number>>((acc, event) => {
    const source = event.campaign?.source ?? event.source;
    acc[source] = (acc[source] ?? 0) + (event.ecommerce?.value ?? 0);
    return acc;
  }, {});
  const rows = Object.entries(revenueBySource).sort((left, right) => right[1] - left[1]);
  const totalRevenue = rows.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="eg-page">
      <PageIntro
        title="Attribution"
        description="Revenue view built from current purchase events, campaign metadata and backfill operations."
        action={
          <div className="eg-actions">
            <button
              className="eg-button eg-button--primary"
              disabled={backfillMutation.isPending}
              onClick={() => backfillMutation.mutate()}
              type="button"
            >
              {backfillMutation.isPending ? "Starting backfill..." : "Run attribution backfill"}
            </button>
          </div>
        }
      />

      <div className="eg-metric-grid">
        <MetricCard label="Attributed revenue" value={formatCurrency(totalRevenue)} detail="Purchase value in the current event window" />
        <MetricCard label="Purchases" value={purchases.length} detail="Revenue-carrying events available for attribution" />
        <MetricCard label="Primary source" value={rows[0]?.[0] ?? "n/a"} detail="Top source by current purchase revenue" />
        <MetricCard label="Backfill jobs" value={jobsQuery.data?.filter((job) => job.type === "backfill_attribution").length ?? 0} detail="Completed or queued attribution operations" />
      </div>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Revenue by source" subtitle="Current last-touch style view from purchase events">
          <div className="eg-list">
            {rows.map(([source, value]) => (
              <div className="eg-list__row" key={source}>
                <div>
                  <strong>{source}</strong>
                  <span>{Math.round((value / Math.max(totalRevenue, 1)) * 100)}% of observed attributed revenue</span>
                </div>
                <StatusBadge status="healthy">{formatCurrency(value)}</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Attribution operations" subtitle="Backfill and export jobs connected to revenue analysis">
          {!jobsQuery.data?.length ? (
            <StateCard title="No attribution jobs yet" description="Run a backfill to create an operational record." compact />
          ) : (
            <div className="eg-list">
              {jobsQuery.data.slice(0, 5).map((job) => (
                <div className="eg-list__row" key={job.id}>
                  <div>
                    <strong>{job.type}</strong>
                    <span>{job.detail}</span>
                  </div>
                  <StatusBadge status={job.status === "completed" ? "healthy" : "pending"}>{job.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function FunnelsPage() {
  const eventsQuery = useQuery({
    queryKey: qk.events(currentContext.siteId),
    queryFn: dashboardApi.fetchEvents
  });

  if (!eventsQuery.data) {
    return <StateCard title="Loading funnels" description="Computing funnel transitions from recent event stream." />;
  }

  const stageCounts = {
    landing: eventsQuery.data.filter((item) => item.type === "PageView").length,
    lead: eventsQuery.data.filter((item) => item.type === "Lead").length,
    purchase: eventsQuery.data.filter((item) => item.type === "Purchase").length
  };
  const leadRate = Math.round((stageCounts.lead / Math.max(stageCounts.landing, 1)) * 100);
  const purchaseRate = Math.round((stageCounts.purchase / Math.max(stageCounts.lead, 1)) * 100);

  return (
    <div className="eg-page">
      <PageIntro
        title="Funnels"
        description="Current conversion steps from top-of-funnel page views into leads and purchases."
      />

      <div className="eg-metric-grid">
        <MetricCard label="Landing events" value={stageCounts.landing} detail="Top-of-funnel entries" />
        <MetricCard label="Leads" value={stageCounts.lead} detail="High-intent users entering CRM or sales flow" />
        <MetricCard label="Purchases" value={stageCounts.purchase} detail="Revenue events from the active window" />
        <MetricCard label="Lead to purchase" value={`${purchaseRate}%`} detail="Observed progression after lead creation" />
      </div>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Funnel stages" subtitle="Simple operational read of event-based funnel progression">
          <div className="eg-list">
            <div className="eg-list__row">
              <div>
                <strong>1. Landing</strong>
                <span>Page views entering the site</span>
              </div>
              <StatusBadge status="healthy">{stageCounts.landing}</StatusBadge>
            </div>
            <div className="eg-list__row">
              <div>
                <strong>2. Lead</strong>
                <span>{leadRate}% from landing to lead</span>
              </div>
              <StatusBadge status="matched">{stageCounts.lead}</StatusBadge>
            </div>
            <div className="eg-list__row">
              <div>
                <strong>3. Purchase</strong>
                <span>{purchaseRate}% from lead to purchase</span>
              </div>
              <StatusBadge status="healthy">{stageCounts.purchase}</StatusBadge>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Operational note" subtitle="How to use this MVP funnel view">
          <div className="eg-stack">
            <ActionLine title="Acquisition alignment" text="Compare landing volume with campaign source mix in Acquisition." />
            <ActionLine title="Routing impact" text="Check Routing Rules and Deliveries when conversion events stop moving downstream." />
            <ActionLine title="Attribution follow-up" text="Run an attribution backfill after major tracking or routing changes." />
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function EventExplorerPage() {
  const eventsQuery = useQuery({
    queryKey: qk.events(currentContext.siteId),
    queryFn: dashboardApi.fetchEvents
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Event Explorer"
        description="Inspect normalized event payloads before routing and forward delivery."
        action={<button className="eg-button">Open debug collect</button>}
      />

      {!eventsQuery.data ? (
        <StateCard title="Loading events" description="Fetching the most recent normalized payloads." />
      ) : (
        <section className="eg-grid eg-grid--two">
          <SurfaceCard title="Recent events" subtitle="Latest payloads collected by the edge pipeline">
            <div className="eg-table">
              <div className="eg-table__head eg-table__row">
                <span className="eg-table__cell">Event</span>
                <span className="eg-table__cell">Source</span>
                <span className="eg-table__cell">Environment</span>
                <span className="eg-table__cell">Consent</span>
              </div>
              {eventsQuery.data.map((event) => (
                <button className="eg-table__row eg-table__row--interactive" key={event.event_id} type="button">
                  <span className="eg-table__cell" data-label="Event">
                    <strong>{event.type}</strong>
                    <small>{event.event_id}</small>
                  </span>
                  <span className="eg-table__cell" data-label="Source">{event.source}</span>
                  <span className="eg-table__cell" data-label="Environment">{event.environment}</span>
                  <span className="eg-table__cell" data-label="Consent">
                    {event.consent?.ads ? "Analytics + ads" : "Analytics only"}
                  </span>
                </button>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title="Selected payload" subtitle="Recent purchase payload used by routing simulation">
            <JsonPanel value={eventsQuery.data[0]} />
          </SurfaceCard>
        </section>
      )}
    </div>
  );
}

function EventSchemasPage() {
  const schemasQuery = useQuery({
    queryKey: qk.schemas(currentContext.siteId),
    queryFn: dashboardApi.fetchSchemas
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Event Schemas"
        description="Discover normalized event families and inspect their most important fields."
      />
      <SurfaceCard title="Known event types" subtitle="Derived from the currently collected event stream">
        {!schemasQuery.data ? (
          <StateCard title="Loading schemas" description="Deriving schema summaries from recent events." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Event Type</span>
              <span className="eg-table__cell">Count</span>
              <span className="eg-table__cell">Sample Paths</span>
              <span className="eg-table__cell">Status</span>
            </div>
            {schemasQuery.data.map((schema) => (
              <div className="eg-table__row" key={schema.event_type}>
                <span className="eg-table__cell" data-label="Event Type">
                  <strong>{schema.event_type}</strong>
                </span>
                <span className="eg-table__cell" data-label="Count">{schema.count}</span>
                <span className="eg-table__cell" data-label="Sample Paths">{schema.sample_paths.join(", ")}</span>
                <div className="eg-table__cell" data-label="Status">
                  <StatusBadge status="healthy">tracked</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function RoutingPage() {
  const routesQuery = useQuery({
    queryKey: qk.routes(currentContext.siteId),
    queryFn: dashboardApi.fetchRoutes
  });

  if (!routesQuery.data) {
    return <StateCard title="Loading routing rules" description="Fetching the active route set and compiled config." />;
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Routing Rules"
        description="Evaluate event types, conditions, consent and destination delivery from a single control surface."
        action={
          <div className="eg-actions">
            <button className="eg-button">Simulate event</button>
            <button className="eg-button eg-button--primary">Publish compiled version</button>
          </div>
        }
      />

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Active routes" subtitle="Priority ordered routes in the compiled production config">
          <RoutesTable routes={routesQuery.data.routes} versions={routesQuery.data.versions} />
        </SurfaceCard>

        <SurfaceCard title="Simulation result" subtitle="Trace for the latest purchase event">
          <div className="eg-stack">
            <div className="eg-simulation-summary">
              <MetricMini label="Matched routes" value={routesQuery.data.routeSimulation.matched_routes} />
              <MetricMini label="Deliveries" value={routesQuery.data.routeSimulation.plan.deliveries.length} />
              <MetricMini label="Trace id" value={routesQuery.data.routeSimulation.plan.trace_id} mono />
            </div>
            <RouteTracePanel trace={routesQuery.data.routeSimulation.plan.trace} />
          </div>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Compiled config" subtitle="Current publishable JSON used by runtime workers">
          <JsonPanel value={routesQuery.data.compiledConfig} />
        </SurfaceCard>

        <SurfaceCard title="Delivery intents" subtitle="Fan-out generated by the simulation">
          <JsonPanel value={routesQuery.data.routeSimulation.plan.deliveries} />
        </SurfaceCard>
      </section>
    </div>
  );
}

function TransformationsPage() {
  const transformationsQuery = useQuery({
    queryKey: qk.transformations(currentContext.siteId),
    queryFn: dashboardApi.fetchTransformations
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Transformations"
        description="Map the internal event model into destination-specific payloads."
        action={<button className="eg-button">New transformation</button>}
      />
      <SurfaceCard title="Transformation library" subtitle="Reusable payload mappings per destination kind">
        {!transformationsQuery.data ? (
          <StateCard title="Loading transformations" description="Fetching the active transformation set." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Name</span>
              <span className="eg-table__cell">Kind</span>
              <span className="eg-table__cell">Version</span>
              <span className="eg-table__cell">Status</span>
            </div>
            {transformationsQuery.data.map((transformation) => (
              <div className="eg-table__row" key={transformation.id}>
                <span className="eg-table__cell" data-label="Name">
                  <strong>{transformation.name}</strong>
                  <small>{transformation.id}</small>
                </span>
                <span className="eg-table__cell" data-label="Kind">{transformation.destination_kind}</span>
                <span className="eg-table__cell" data-label="Version">v{transformation.version}</span>
                <div className="eg-table__cell" data-label="Status">
                  <StatusBadge status={transformation.status}>{transformation.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function DestinationsPage() {
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Destinations"
        description="Configure delivery targets, credentials and delivery posture across all connected channels."
        action={<button className="eg-button eg-button--primary">Add destination</button>}
      />
      <SurfaceCard title="Connected destinations" subtitle="Meta, analytics and custom webhooks sharing the same event stream">
        {!destinationsQuery.data ? (
          <StateCard title="Loading destinations" description="Fetching destination configs and secret status." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Destination</span>
              <span className="eg-table__cell">Kind</span>
              <span className="eg-table__cell">Secret</span>
              <span className="eg-table__cell">Status</span>
            </div>
            {destinationsQuery.data.map((destination) => (
              <div className="eg-table__row" key={destination.id}>
                <span className="eg-table__cell" data-label="Destination">
                  <strong>{destination.name}</strong>
                  <small>{destination.id}</small>
                </span>
                <span className="eg-table__cell" data-label="Kind">{destination.kind}</span>
                <span className="eg-table__cell" data-label="Secret">{destination.secret_preview}</span>
                <div className="eg-table__cell" data-label="Status">
                  <StatusBadge status={destination.status === "active" ? "healthy" : destination.status}>
                    {destination.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function DeliveriesPage() {
  const deliveriesQuery = useQuery({
    queryKey: qk.deliveries(currentContext.siteId),
    queryFn: dashboardApi.fetchDeliveries,
    refetchInterval: 15000
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Delivery Logs"
        description="Operational log of routed deliveries, retries and destination latency."
        action={<button className="eg-button">Replay failed deliveries</button>}
      />

      <SurfaceCard title="Recent delivery log" subtitle="Latest fan-out operations across all destinations">
        {!deliveriesQuery.data ? (
          <StateCard title="Loading deliveries" description="Collecting delivery attempts and queue state." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Event</span>
              <span className="eg-table__cell">Destination</span>
              <span className="eg-table__cell">Status</span>
              <span className="eg-table__cell">Latency</span>
              <span className="eg-table__cell">Attempts</span>
            </div>
            {deliveriesQuery.data.map((delivery) => (
              <div className="eg-table__row" key={`${delivery.eventId}-${delivery.destination}`}>
                <span className="eg-table__cell" data-label="Event">
                  <strong>{delivery.route}</strong>
                  <small>{delivery.eventId}</small>
                </span>
                <span className="eg-table__cell" data-label="Destination">{delivery.destination}</span>
                <div className="eg-table__cell" data-label="Status">
                  <StatusBadge status={delivery.status}>{delivery.status}</StatusBadge>
                </div>
                <span className="eg-table__cell" data-label="Latency">{delivery.latency}</span>
                <span className="eg-table__cell" data-label="Attempts">{delivery.attempts}</span>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function ReplayPage() {
  const queryClient = useQueryClient();
  const dlqQuery = useQuery({
    queryKey: qk.dlq(currentContext.siteId),
    queryFn: dashboardApi.fetchDlq
  });
  const jobsQuery = useQuery({
    queryKey: qk.jobs(currentContext.siteId),
    queryFn: dashboardApi.fetchJobs
  });
  const replayDlqMutation = useMutation({
    mutationFn: dashboardApi.replayDlq,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.dlq(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.jobs(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.deliveries(currentContext.siteId) });
    }
  });
  const flushMutation = useMutation({
    mutationFn: dashboardApi.flushForwarder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.deliveries(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.queues(currentContext.siteId) });
    }
  });
  const exportMutation = useMutation({
    mutationFn: dashboardApi.exportRaw,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.jobs(currentContext.siteId) });
    }
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Replay and Backfill"
        description="Operational controls for replaying DLQ items, flushing pending deliveries and exporting raw data."
        action={
          <div className="eg-actions">
            <button className="eg-button" disabled={flushMutation.isPending} onClick={() => flushMutation.mutate()} type="button">
              {flushMutation.isPending ? "Flushing..." : "Flush forwarder"}
            </button>
            <button className="eg-button" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()} type="button">
              {exportMutation.isPending ? "Exporting..." : "Export raw"}
            </button>
            <button className="eg-button eg-button--primary" disabled={replayDlqMutation.isPending} onClick={() => replayDlqMutation.mutate()} type="button">
              {replayDlqMutation.isPending ? "Queueing replay..." : "Replay DLQ"}
            </button>
          </div>
        }
      />

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Dead letter queue" subtitle="Deliveries currently blocked and awaiting replay">
          {!dlqQuery.data?.length ? (
            <StateCard title="DLQ is empty" description="No failed deliveries require operator intervention." compact />
          ) : (
            <div className="eg-list">
              {dlqQuery.data.map((delivery) => (
                <div className="eg-list__row" key={delivery.id}>
                  <div>
                    <strong>{delivery.destination_id}</strong>
                    <span>{delivery.event_id} · attempts {delivery.attempts}</span>
                  </div>
                  <StatusBadge status="failed">{delivery.last_error ?? "failed"}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Operation jobs" subtitle="Replay, export and attribution work executed from the control plane">
          {!jobsQuery.data?.length ? (
            <StateCard title="No jobs yet" description="Replay and export operations will appear here once triggered." compact />
          ) : (
            <div className="eg-list">
              {jobsQuery.data.slice(0, 8).map((job) => (
                <div className="eg-list__row" key={job.id}>
                  <div>
                    <strong>{job.type}</strong>
                    <span>{job.detail}</span>
                  </div>
                  <StatusBadge status={job.status === "completed" ? "healthy" : "pending"}>{job.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function UsersPage() {
  const usersQuery = useQuery({
    queryKey: qk.users(currentContext.siteId),
    queryFn: dashboardApi.fetchUsers
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Identity Users"
        description="Identity graph overview for canonical users, anonymous links and session stitching."
      />
      <SurfaceCard title="Known users" subtitle="Profiles resolved by identify events and repeated traffic">
        {!usersQuery.data ? (
          <StateCard title="Loading users" description="Building identity graph snapshot." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Canonical User</span>
              <span className="eg-table__cell">Anonymous IDs</span>
              <span className="eg-table__cell">Sessions</span>
              <span className="eg-table__cell">Consent</span>
            </div>
            {usersQuery.data.map((user) => (
              <div className="eg-table__row" key={user.canonical_user_id}>
                <span className="eg-table__cell" data-label="Canonical User">
                  <strong>{user.canonical_user_id}</strong>
                </span>
                <span className="eg-table__cell" data-label="Anonymous IDs">{user.anonymous_ids.length}</span>
                <span className="eg-table__cell" data-label="Sessions">{user.session_ids.length}</span>
                <span className="eg-table__cell" data-label="Consent">
                  {user.consent.analytics ? "Analytics" : "Blocked"} / {user.consent.ads ? "Ads" : "No ads"}
                </span>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function JourneysPage() {
  const usersQuery = useQuery({
    queryKey: qk.users(currentContext.siteId),
    queryFn: dashboardApi.fetchUsers
  });
  const selectedUserId = usersQuery.data?.[0]?.canonical_user_id;
  const journeysQuery = useQuery({
    queryKey: qk.journeys(currentContext.siteId, selectedUserId ?? "pending"),
    queryFn: () => dashboardApi.fetchJourneys(selectedUserId ?? ""),
    enabled: Boolean(selectedUserId)
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Journeys"
        description="Read recent user journeys from identity stitching and event chronology."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Journey candidates" subtitle="Canonical users available for journey inspection">
          {!usersQuery.data?.length ? (
            <StateCard title="No stitched users yet" description="Identity journeys appear after repeated sessions or identify calls." compact />
          ) : (
            <div className="eg-list">
              {usersQuery.data.slice(0, 6).map((user) => (
                <div className="eg-list__row" key={user.canonical_user_id}>
                  <div>
                    <strong>{user.canonical_user_id}</strong>
                    <span>{user.session_ids.length} sessions · {user.anonymous_ids.length} anonymous ids</span>
                  </div>
                  <a className="eg-badge eg-badge--info" href={sitePath(`identity/users/${user.canonical_user_id}`)}>
                    Open detail
                  </a>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Selected journey" subtitle="Chronological event flow for the most recent canonical user">
          {!journeysQuery.data?.items?.length ? (
            <StateCard title="No journey events" description="Pick a user with stitched activity to inspect the event timeline." compact />
          ) : (
            <div className="eg-stream">
              {journeysQuery.data.items.map((event) => (
                <div className="eg-stream__row" key={event.event_id}>
                  <span className="eg-stream__time">{new Date(event.received_at).toISOString().slice(11, 19)}</span>
                  <div>
                    <strong>{event.type}</strong>
                    <p>{event.page?.path ?? event.source}</p>
                  </div>
                  <StatusBadge status={(event.routing?.route_ids?.length ?? 0) > 0 ? "matched" : "pending"}>
                    {(event.routing?.route_ids?.length ?? 0) > 0 ? "routed" : "stored"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function MergeRulesPage() {
  const usersQuery = useQuery({
    queryKey: qk.users(currentContext.siteId),
    queryFn: dashboardApi.fetchUsers
  });

  const stitchedUsers = usersQuery.data?.filter((user) => user.anonymous_ids.length > 0 && user.session_ids.length > 0) ?? [];

  return (
    <div className="eg-page">
      <PageIntro
        title="Merge Rules"
        description="Operational explanation of how identities are stitched from canonical ids, anonymous ids and sessions."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Active merge policy" subtitle="Rules applied by the current MVP identity resolver">
          <div className="eg-stack">
            <ActionLine title="Canonical priority" text="Canonical user id, email hash and user id hash win over anonymous identifiers." />
            <ActionLine title="Anonymous stitching" text="New anonymous ids are attached to an existing canonical profile when later identify events arrive." />
            <ActionLine title="Consent carry-over" text="Latest known consent snapshot updates the stitched profile and downstream routing checks." />
          </div>
        </SurfaceCard>

        <SurfaceCard title="Profiles affected" subtitle="Recently stitched identities that validate the merge model">
          {!stitchedUsers.length ? (
            <StateCard title="No stitched profiles yet" description="Collect identify calls or repeated sessions to validate merge rules." compact />
          ) : (
            <div className="eg-list">
              {stitchedUsers.slice(0, 6).map((user) => (
                <div className="eg-list__row" key={user.canonical_user_id}>
                  <div>
                    <strong>{user.canonical_user_id}</strong>
                    <span>{user.anonymous_ids.join(", ") || "No anonymous ids"}</span>
                  </div>
                  <StatusBadge status="matched">{user.session_ids.length} sessions</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function ConsentPage() {
  const consentQuery = useQuery({
    queryKey: qk.consent(currentContext.siteId),
    queryFn: dashboardApi.fetchConsent
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Consent"
        description="Review effective consent posture before routing events into ads destinations."
      />
      <SurfaceCard title="Consent ledger" subtitle="Latest known consent state for tracked identities">
        {!consentQuery.data ? (
          <StateCard title="Loading consent" description="Collecting consent snapshots from identity store." compact />
        ) : (
          <div className="eg-table">
            <div className="eg-table__head eg-table__row">
              <span className="eg-table__cell">Canonical User</span>
              <span className="eg-table__cell">Analytics</span>
              <span className="eg-table__cell">Ads</span>
              <span className="eg-table__cell">Functional</span>
            </div>
            {consentQuery.data.map((entry) => (
              <div className="eg-table__row" key={entry.canonical_user_id}>
                <span className="eg-table__cell" data-label="Canonical User">{entry.canonical_user_id}</span>
                <div className="eg-table__cell" data-label="Analytics">
                  <StatusBadge status={entry.consent.analytics ? "healthy" : "blocked"}>
                    {entry.consent.analytics ? "granted" : "blocked"}
                  </StatusBadge>
                </div>
                <div className="eg-table__cell" data-label="Ads">
                  <StatusBadge status={entry.consent.ads ? "healthy" : "blocked"}>
                    {entry.consent.ads ? "granted" : "blocked"}
                  </StatusBadge>
                </div>
                <div className="eg-table__cell" data-label="Functional">
                  <StatusBadge status={entry.consent.functional ? "healthy" : "blocked"}>
                    {entry.consent.functional ? "granted" : "blocked"}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function HealthPage() {
  const healthQuery = useQuery({
    queryKey: qk.health(currentContext.siteId),
    queryFn: dashboardApi.fetchHealth,
    refetchInterval: 10000
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Operations Health"
        description="Health indicators for collector, compiler, queue and destination credentials."
        action={<button className="eg-button">Refresh now</button>}
      />

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Service health" subtitle="Platform operational posture for the active site">
          <div className="eg-list">
            {healthQuery.data?.map((service) => (
              <div className="eg-list__row" key={service.service}>
                <div>
                  <strong>{service.service}</strong>
                  <span>{service.detail}</span>
                </div>
                <StatusBadge status={service.status}>{service.status}</StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Runbook focus" subtitle="Immediate actions for routing and delivery operations">
          <div className="eg-stack">
            <ActionLine title="Queue depth" text="Forwarder queue is healthy; no replay action required." />
            <ActionLine title="Compiler" text="Draft routes can be published safely to v4." />
            <ActionLine title="Destination auth" text="No credential rotations pending." />
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function QueuesPage() {
  const queuesQuery = useQuery({
    queryKey: qk.queues(currentContext.siteId),
    queryFn: dashboardApi.fetchQueues,
    refetchInterval: 10000
  });
  const jobsQuery = useQuery({
    queryKey: qk.jobs(currentContext.siteId),
    queryFn: dashboardApi.fetchJobs
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Queues and Jobs"
        description="Inspect forwarder backlog, DLQ pressure and operation jobs from replay and export flows."
        action={<button className="eg-button">Flush forwarder</button>}
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Queue state" subtitle="Operational view of pending and failed deliveries">
          {!queuesQuery.data ? (
            <StateCard title="Loading queues" description="Inspecting queue metrics." compact />
          ) : (
            <div className="eg-stack">
              <ActionLine
                title="Delivery queue"
                text={`${queuesQuery.data.delivery_queue.depth} messages pending, ${queuesQuery.data.delivery_queue.retrying} retrying.`}
              />
              <ActionLine title="Dead letter queue" text={`${queuesQuery.data.dlq.depth} failed deliveries awaiting replay.`} />
            </div>
          )}
        </SurfaceCard>
        <SurfaceCard title="Operation jobs" subtitle="Replay, backfill and export jobs">
          {!jobsQuery.data?.length ? (
            <StateCard title="No jobs yet" description="Replay, export and backfill operations will appear here." compact />
          ) : (
            <div className="eg-list">
              {jobsQuery.data.map((job) => (
                <div className="eg-list__row" key={job.id}>
                  <div>
                    <strong>{job.type}</strong>
                    <span>{job.detail}</span>
                  </div>
                  <StatusBadge status={job.status === "completed" ? "healthy" : "pending"}>{job.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function InstallPage() {
  const installQuery = useQuery({
    queryKey: qk.install(currentContext.siteId),
    queryFn: dashboardApi.fetchInstall
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Install Tracker"
        description="Provide browser SDK and collector configuration to connect the public site into EventsGateway."
      />
      {!installQuery.data ? (
        <StateCard title="Loading install config" description="Preparing SDK and collector setup instructions." />
      ) : (
        <section className="eg-grid eg-grid--two">
          <SurfaceCard title="Install surface" subtitle="Use either the script tag or the NPM package">
            <div className="eg-stack">
              <ActionLine title="Collector URL" text={installQuery.data.collector_url} />
              <ActionLine title="NPM package" text={installQuery.data.npm_package} />
            </div>
          </SurfaceCard>
          <SurfaceCard title="Starter snippets" subtitle="Bootstrap code for browser integration">
            <JsonPanel
              value={{
                script: installQuery.data.sdk_loader,
                init: installQuery.data.sample_init
              }}
            />
          </SurfaceCard>
        </section>
      )}
    </div>
  );
}

function AuditPage() {
  const routesQuery = useQuery({
    queryKey: qk.routes(currentContext.siteId),
    queryFn: dashboardApi.fetchRoutes
  });
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });
  const jobsQuery = useQuery({
    queryKey: qk.jobs(currentContext.siteId),
    queryFn: dashboardApi.fetchJobs
  });

  const auditRows = [
    ...(routesQuery.data?.versions.map((version) => ({
      title: `Routing version v${version.version}`,
      detail: version.active ? "Currently active compiled version." : "Historical routing version retained for rollback.",
      status: version.active ? "healthy" : "subtle"
    })) ?? []),
    ...(destinationsQuery.data?.map((destination) => ({
      title: `${destination.name} credential posture`,
      detail: `${destination.kind} destination is ${destination.status}.`,
      status: destination.status === "active" ? "healthy" : destination.status
    })) ?? []),
    ...(jobsQuery.data?.map((job) => ({
      title: `${job.type} job`,
      detail: job.detail,
      status: job.status === "completed" ? "healthy" : "pending"
    })) ?? [])
  ].slice(0, 12);

  return (
    <div className="eg-page">
      <PageIntro
        title="Audit Log"
        description="Operational timeline of publish, destination and replay activity visible in the current MVP."
      />
      <SurfaceCard title="Recent operator-visible activity" subtitle="Synthetic audit feed built from versions, jobs and delivery controls">
        {!auditRows.length ? (
          <StateCard title="No audit entries yet" description="Publish, replay or destination operations will populate this stream." compact />
        ) : (
          <div className="eg-list">
            {auditRows.map((row, index) => (
              <div className="eg-list__row" key={`${row.title}-${index}`}>
                <div>
                  <strong>{row.title}</strong>
                  <span>{row.detail}</span>
                </div>
                <StatusBadge status={row.status}>{row.status}</StatusBadge>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function DomainsPage() {
  return (
    <div className="eg-page">
      <PageIntro
        title="Domains"
        description="Verified collection origins and deployment domains that define where tracking is allowed."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Verified domains" subtitle="Current MVP surface prepared for origin verification">
          <div className="eg-list">
            <div className="eg-list__row">
              <div>
                <strong>alpha.store</strong>
                <span>Primary production storefront</span>
              </div>
              <StatusBadge status="healthy">verified</StatusBadge>
            </div>
            <div className="eg-list__row">
              <div>
                <strong>dash.eventsgateway.com</strong>
                <span>Control plane interface</span>
              </div>
              <StatusBadge status="healthy">internal</StatusBadge>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Origin posture" subtitle="How domain trust should be managed in this installation">
          <div className="eg-stack">
            <ActionLine title="Collector allowlist" text="Restrict browser collection to verified production and staging domains." />
            <ActionLine title="Site mapping" text="Bind each domain to a site id so event ownership stays explicit." />
            <ActionLine title="Environment split" text="Use separate domains or subdomains for staging versus production traffic." />
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function ApiKeysPage() {
  return (
    <div className="eg-page">
      <PageIntro
        title="API Keys"
        description="Scoped access keys for collection, debug and operations workflows."
      />
      <SurfaceCard title="Suggested key scopes" subtitle="Administrative model prepared for the next auth/RBAC layer">
        <div className="eg-list">
          <div className="eg-list__row">
            <div>
              <strong>Collect key</strong>
              <span>Ingest events into collector endpoints for a specific site.</span>
            </div>
            <StatusBadge status="healthy">site scoped</StatusBadge>
          </div>
          <div className="eg-list__row">
            <div>
              <strong>Debug key</strong>
              <span>Validate and inspect debug collect payloads without publish rights.</span>
            </div>
            <StatusBadge status="pending">planned</StatusBadge>
          </div>
          <div className="eg-list__row">
            <div>
              <strong>Operations key</strong>
              <span>Replay DLQ, flush queues and export raw data from the control plane.</span>
            </div>
            <StatusBadge status="pending">planned</StatusBadge>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function MembersPage() {
  return (
    <div className="eg-page">
      <PageIntro
        title="Members"
        description="Team access model for operating routing, identity and delivery workflows."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Suggested roles" subtitle="Control plane access patterns aligned to the current MVP">
          <div className="eg-list">
            <div className="eg-list__row">
              <div>
                <strong>Admin</strong>
                <span>Can publish routes, rotate secrets and access operations tools.</span>
              </div>
              <StatusBadge status="healthy">full access</StatusBadge>
            </div>
            <div className="eg-list__row">
              <div>
                <strong>Analyst</strong>
                <span>Can inspect events, funnels, attribution and identity without destructive actions.</span>
              </div>
              <StatusBadge status="matched">read focused</StatusBadge>
            </div>
            <div className="eg-list__row">
              <div>
                <strong>Operator</strong>
                <span>Can monitor health, queues and replay workflows.</span>
              </div>
              <StatusBadge status="pending">ops focused</StatusBadge>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Current team context" subtitle="Open source control plane baseline for this site">
          <div className="eg-stack">
            <ActionLine title="Organization" text={currentContext.orgName} />
            <ActionLine title="Project" text={currentContext.projectName} />
            <ActionLine title="Site" text={currentContext.siteName} />
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="eg-page">
      <PageIntro
        title="General Settings"
        description="Administrative hub for install, domains, API access and team membership."
      />
      <SurfaceCard title="Settings roadmap" subtitle="Administrative modules prepared for site and member settings">
        <div className="eg-stack">
          <ActionLine title="Install" text="Use the install module to expose browser SDK and collector setup details." />
          <ActionLine title="Domains" text="Review verified domains and trusted collection origins." />
          <ActionLine title="API keys" text="Prepare scoped access for debug, routing and operations." />
          <ActionLine title="Members" text="Document team roles until RBAC is fully wired." />
        </div>
      </SurfaceCard>
    </div>
  );
}

function RouteDetailPage() {
  const { routeId = "" } = useParams();
  const routeQuery = useQuery({
    queryKey: qk.route(currentContext.siteId, routeId),
    queryFn: () => dashboardApi.fetchRouteDetail(routeId),
    enabled: Boolean(routeId)
  });

  if (!routeQuery.data) {
    return <StateCard title="Loading route detail" description="Fetching route definition, conditions and destinations." />;
  }

  return (
    <div className="eg-page">
      <PageIntro title={routeQuery.data.name} description={routeQuery.data.description ?? "Detailed route definition."} />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Route posture" subtitle="Priority, environment and consent requirements">
          <div className="eg-stack">
            <ActionLine title="Priority" text={String(routeQuery.data.priority)} />
            <ActionLine title="Environment" text={routeQuery.data.environment} />
            <ActionLine
              title="Consent required"
              text={`Analytics ${routeQuery.data.consent_required?.analytics ? "required" : "optional"} · Ads ${routeQuery.data.consent_required?.ads ? "required" : "optional"}`}
            />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Destinations" subtitle="Fan-out targets enabled by this route">
          <JsonPanel value={routeQuery.data.destinations} />
        </SurfaceCard>
      </section>
      <SurfaceCard title="Match definition" subtitle="Current route condition tree">
        <JsonPanel value={routeQuery.data.match} />
      </SurfaceCard>
    </div>
  );
}

function TransformationDetailPage() {
  const { transformId = "" } = useParams();
  const transformationQuery = useQuery({
    queryKey: qk.transformation(currentContext.siteId, transformId),
    queryFn: () => dashboardApi.fetchTransformationDetail(transformId),
    enabled: Boolean(transformId)
  });

  if (!transformationQuery.data) {
    return <StateCard title="Loading transformation" description="Fetching mapping definition and version metadata." />;
  }

  return (
    <div className="eg-page">
      <PageIntro title={transformationQuery.data.name} description="Destination payload mapping and version metadata." />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Transformation meta" subtitle="Kind, status and version">
          <div className="eg-stack">
            <ActionLine title="Destination kind" text={transformationQuery.data.destination_kind} />
            <ActionLine title="Version" text={`v${transformationQuery.data.version}`} />
            <ActionLine title="Status" text={transformationQuery.data.status} />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Mapping" subtitle="Internal to destination payload mapping">
          <JsonPanel value={transformationQuery.data.mapping} />
        </SurfaceCard>
      </section>
    </div>
  );
}

function DestinationDetailPage() {
  const { destinationId = "" } = useParams();
  const destinationQuery = useQuery({
    queryKey: qk.destination(currentContext.siteId, destinationId),
    queryFn: () => dashboardApi.fetchDestinationDetail(destinationId),
    enabled: Boolean(destinationId)
  });

  if (!destinationQuery.data) {
    return <StateCard title="Loading destination" description="Fetching destination configuration and secret posture." />;
  }

  return (
    <div className="eg-page">
      <PageIntro title={destinationQuery.data.name} description="Destination credentials, config and operational posture." />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Connection" subtitle="Runtime configuration currently attached to this target">
          <div className="eg-stack">
            <ActionLine title="Kind" text={destinationQuery.data.kind} />
            <ActionLine title="Status" text={destinationQuery.data.status} />
            <ActionLine title="Secret preview" text={destinationQuery.data.secret_preview} />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Raw config" subtitle="Stored destination configuration snapshot">
          <JsonPanel value={destinationQuery.data.config} />
        </SurfaceCard>
      </section>
    </div>
  );
}

function UserDetailPage() {
  const { canonicalUserId = "" } = useParams();
  const usersQuery = useQuery({
    queryKey: qk.users(currentContext.siteId),
    queryFn: dashboardApi.fetchUsers
  });
  const journeysQuery = useQuery({
    queryKey: qk.journeys(currentContext.siteId, canonicalUserId),
    queryFn: () => dashboardApi.fetchJourneys(canonicalUserId),
    enabled: Boolean(canonicalUserId)
  });
  const user = usersQuery.data?.find((item) => item.canonical_user_id === canonicalUserId);

  if (!user) {
    return <StateCard title="User not found" description="The selected canonical user is not available in the current identity snapshot." />;
  }

  return (
    <div className="eg-page">
      <PageIntro title={user.canonical_user_id} description="Identity detail with consent, sessions and stitched journey." />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Identity profile" subtitle="Canonical record stored by the current stitching layer">
          <div className="eg-stack">
            <ActionLine title="Anonymous ids" text={user.anonymous_ids.join(", ") || "None"} />
            <ActionLine title="Sessions" text={user.session_ids.join(", ") || "None"} />
            <ActionLine title="Consent" text={`Analytics ${user.consent.analytics ? "yes" : "no"} · Ads ${user.consent.ads ? "yes" : "no"}`} />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Journey events" subtitle="Chronological events tied to this canonical record">
          {!journeysQuery.data?.items?.length ? (
            <StateCard title="No journey data" description="No recent events were found for this canonical user." compact />
          ) : (
            <div className="eg-stream">
              {journeysQuery.data.items.map((event) => (
                <div className="eg-stream__row" key={event.event_id}>
                  <span className="eg-stream__time">{new Date(event.received_at).toISOString().slice(11, 19)}</span>
                  <div>
                    <strong>{event.type}</strong>
                    <p>{event.page?.path ?? event.source}</p>
                  </div>
                  <StatusBadge status={(event.routing?.route_ids?.length ?? 0) > 0 ? "matched" : "pending"}>
                    {(event.routing?.route_ids?.length ?? 0) > 0 ? "routed" : "stored"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function DeliveryDetailPage() {
  const { eventId = "" } = useParams();
  const eventQuery = useQuery({
    queryKey: qk.event(currentContext.siteId, eventId),
    queryFn: () => dashboardApi.fetchEvent(eventId),
    enabled: Boolean(eventId)
  });
  const deliveriesQuery = useQuery({
    queryKey: qk.deliveries(currentContext.siteId),
    queryFn: dashboardApi.fetchDeliveries
  });
  const replayMutation = useMutation({
    mutationFn: () => dashboardApi.replayEvent(eventId)
  });
  const eventDeliveries = deliveriesQuery.data?.filter((item) => item.eventId === eventId) ?? [];

  if (!eventQuery.data) {
    return <StateCard title="Loading delivery detail" description="Fetching event payload and downstream delivery attempts." />;
  }

  return (
    <div className="eg-page">
      <PageIntro
        title={`Delivery Detail · ${eventId}`}
        description="Inspect event payload and downstream delivery attempts for a single event."
        action={
          <button className="eg-button eg-button--primary" disabled={replayMutation.isPending} onClick={() => replayMutation.mutate()} type="button">
            {replayMutation.isPending ? "Replaying..." : "Replay event"}
          </button>
        }
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Payload" subtitle="Normalized event stored before routing">
          <JsonPanel value={eventQuery.data} />
        </SurfaceCard>
        <SurfaceCard title="Delivery attempts" subtitle="Known fan-out operations for this event id">
          {!eventDeliveries.length ? (
            <StateCard title="No deliveries yet" description="This event has not created any downstream delivery attempts." compact />
          ) : (
            <div className="eg-list">
              {eventDeliveries.map((delivery) => (
                <div className="eg-list__row" key={`${delivery.destination}-${delivery.attempts}`}>
                  <div>
                    <strong>{delivery.destination}</strong>
                    <span>{delivery.route} · {delivery.latency}</span>
                  </div>
                  <StatusBadge status={delivery.status}>{delivery.status}</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </section>
    </div>
  );
}

function SchemaDetailPage() {
  const { eventType = "" } = useParams();
  const eventsQuery = useQuery({
    queryKey: qk.events(currentContext.siteId),
    queryFn: dashboardApi.fetchEvents
  });
  const schemasQuery = useQuery({
    queryKey: qk.schemas(currentContext.siteId),
    queryFn: dashboardApi.fetchSchemas
  });
  const schema = schemasQuery.data?.find((item) => item.event_type === eventType);
  const examples = eventsQuery.data?.filter((item) => item.type === eventType).slice(0, 3) ?? [];

  if (!schema) {
    return <StateCard title="Schema not found" description="The selected event type is not present in the current normalized stream." />;
  }

  return (
    <div className="eg-page">
      <PageIntro title={`Schema · ${eventType}`} description="Tracked fields and sample payloads for one normalized event family." />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Observed shape" subtitle="Field paths detected for this event type">
          <JsonPanel value={schema.sample_paths} />
        </SurfaceCard>
        <SurfaceCard title="Sample payloads" subtitle="Recent examples that produced the current schema view">
          <JsonPanel value={examples} />
        </SurfaceCard>
      </section>
    </div>
  );
}

function RoutesTable({
  routes,
  versions
}: {
  routes: Awaited<ReturnType<typeof dashboardApi.fetchRoutes>>["routes"];
  versions: Awaited<ReturnType<typeof dashboardApi.fetchRoutes>>["versions"];
}) {
  return (
    <div className="eg-stack">
      <div className="eg-version-strip">
        {versions.map((version) => (
          <StatusBadge key={version.version} status={version.active ? "healthy" : "subtle"}>
            v{version.version}{version.active ? " active" : ""}
          </StatusBadge>
        ))}
      </div>
      <div className="eg-table">
        <div className="eg-table__head eg-table__row">
          <span className="eg-table__cell">Route</span>
          <span className="eg-table__cell">Priority</span>
          <span className="eg-table__cell">Environment</span>
          <span className="eg-table__cell">Destinations</span>
        </div>
        {routes.map((route) => (
          <div className="eg-table__row" key={route.id}>
            <span className="eg-table__cell" data-label="Route">
              <strong>{route.name}</strong>
              <small>{route.description}</small>
            </span>
            <span className="eg-table__cell" data-label="Priority">{route.priority}</span>
            <span className="eg-table__cell" data-label="Environment">{route.environment}</span>
            <span className="eg-table__cell" data-label="Destinations">
              {route.destinations.filter((destination) => destination.enabled).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteTracePanel({ trace }: { trace: RouteTraceItem[] }) {
  return (
    <div className="eg-trace">
      {trace.map((item) => (
        <div className="eg-trace__item" key={item.route_id}>
          <div className="eg-trace__header">
            <div>
              <strong>{item.route_name}</strong>
              <p>{item.route_id}</p>
            </div>
            <StatusBadge status={item.matched ? "matched" : "blocked"}>
              {item.matched ? "matched" : item.skipped_reason ?? "blocked"}
            </StatusBadge>
          </div>
          {item.conditions?.length ? (
            <div className="eg-conditions">
              {item.conditions.map((condition, index) => (
                <div className="eg-conditions__row" key={`${condition.path}-${index}`}>
                  <span>{condition.path}</span>
                  <span>{condition.op}</span>
                  <span>{String(condition.actual ?? "-")}</span>
                  <StatusBadge status={condition.matched ? "matched" : "skipped"}>
                    {condition.matched ? "pass" : "fail"}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function JsonPanel({ value }: { value: unknown }) {
  const json = useMemo(() => JSON.stringify(value, null, 2), [value]);
  return <pre className="eg-json">{json}</pre>;
}

function PageIntro({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="eg-page-intro">
      <div>
        <div className="eyebrow">Dashboard module</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function SurfaceCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="eg-card">
      <header className="eg-card__header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="eg-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function MetricMini({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="eg-metric-mini">
      <span>{label}</span>
      <strong className={mono ? "is-mono" : ""}>{value}</strong>
    </div>
  );
}

function ActionLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="eg-action-line">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function StateCard({
  title,
  description,
  compact = false
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div className={`eg-state-card${compact ? " is-compact" : ""}`}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function StatusBadge({
  status,
  children
}: {
  status: keyof typeof statusColors | string;
  children: ReactNode;
}) {
  const tone = status in statusColors ? statusColors[status as keyof typeof statusColors] : "info";
  return <span className={`eg-badge eg-badge--${tone}`}>{children}</span>;
}

function NotFoundPage() {
  return (
    <div className="eg-page">
      <StateCard title="Route not found" description="This dashboard module is not mapped in the current control center." />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={sitePath("overview")} />} />
      <Route path="/app/orgs/:orgId/projects/:projectId/sites/:siteId" element={<AppShell />}>
        <Route index element={<Navigate replace to="overview" />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="realtime" element={<RealtimePage />} />
        <Route path="acquisition" element={<AcquisitionPage />} />
        <Route path="attribution" element={<AttributionPage />} />
        <Route path="funnels" element={<FunnelsPage />} />
        <Route path="events/explorer" element={<EventExplorerPage />} />
        <Route path="events/schemas" element={<EventSchemasPage />} />
        <Route path="events/schemas/:eventType" element={<SchemaDetailPage />} />
        <Route path="routing/routes" element={<RoutingPage />} />
        <Route path="routing/routes/:routeId" element={<RouteDetailPage />} />
        <Route path="routing/transformations" element={<TransformationsPage />} />
        <Route path="routing/transformations/:transformId" element={<TransformationDetailPage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="destinations/:destinationId" element={<DestinationDetailPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="deliveries/:eventId" element={<DeliveryDetailPage />} />
        <Route path="identity/users" element={<UsersPage />} />
        <Route path="identity/users/:canonicalUserId" element={<UserDetailPage />} />
        <Route path="identity/journeys" element={<JourneysPage />} />
        <Route path="identity/merge-rules" element={<MergeRulesPage />} />
        <Route path="identity/consent" element={<ConsentPage />} />
        <Route path="operations/health" element={<HealthPage />} />
        <Route path="operations/queues" element={<QueuesPage />} />
        <Route path="operations/replay" element={<ReplayPage />} />
        <Route path="operations/audit" element={<AuditPage />} />
        <Route path="settings/install" element={<InstallPage />} />
        <Route path="settings/domains" element={<DomainsPage />} />
        <Route path="settings/api-keys" element={<ApiKeysPage />} />
        <Route path="settings/members" element={<MembersPage />} />
        <Route path="settings/general" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to={sitePath("overview")} />} />
    </Routes>
  );
}
