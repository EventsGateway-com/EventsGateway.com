import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import type { RouteTraceItem } from "../../../packages/schemas/src/index";
import { formatRelativeWindow, statusColors } from "../../../packages/shared/src/index";
import {
  currentContext,
  dashboardApi,
  qk
} from "./mock-data";
import { useAuth } from "./auth";
import {
  readCaptchaSiteKey,
  requestDashboardPasswordReset,
  resetDashboardPassword,
  type CaptchaProvider,
  type DestinationCreateInput,
  type InstallWizardInput,
  type RouteUpdateInput,
  type TagManagerConsentRule,
  type TagManagerData,
  type TagManagerScriptRule,
  type TagManagerTag,
  type TagManagerTrigger,
  type TagManagerVariable
} from "./api-client";
import { CaptchaWidget, isCaptchaConfigured } from "./captcha-widget";

type NavItem = {
  label: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type InstallSeed = {
  site_id?: string;
  site_name?: string;
  collector_url?: string;
  public_key?: string;
  npm_package?: string;
  sdk_loader?: string;
  sample_init?: string;
};

const DEFAULT_INSTALL_INPUT: InstallWizardInput = {
  root_domain: "example.com",
  dashboard_domain: "dash.example.com",
  api_domain: "api.example.com",
  collector_domain: "events.example.com",
  cloudflare_account_id: "",
  cloudflare_zone_id: "",
  control_plane_database_id: "",
  control_plane_database_name: "eventsgateway-control-plane",
  events_queue_name: "eventsgateway-ingest",
  captcha_provider: "turnstile",
  captcha_site_key: "",
  captcha_secret_key: ""
};

function capitalizeWord(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function buildInstallWizardDefaults(seed?: InstallSeed): InstallWizardInput {
  const rootDomain = "example.com";
  const dashboardDomain = seed?.site_name?.includes(".") ? `dash.${seed.site_name}` : DEFAULT_INSTALL_INPUT.dashboard_domain;
  const apiDomain = seed?.site_name?.includes(".") ? `api.${seed.site_name}` : DEFAULT_INSTALL_INPUT.api_domain;
  const collectorDomain = seed?.collector_url
    ? new URL(seed.collector_url).hostname
    : DEFAULT_INSTALL_INPUT.collector_domain;

  return {
    ...DEFAULT_INSTALL_INPUT,
    root_domain: rootDomain,
    dashboard_domain: dashboardDomain,
    api_domain: apiDomain,
    collector_domain: collectorDomain
  };
}

function buildInstallArtifacts(input: InstallWizardInput, seed?: InstallSeed) {
  const apiBaseUrl = `https://${input.api_domain}`;
  const passwordResetBaseUrl = `https://${input.dashboard_domain}/reset-password`;
  const captchaProvider = input.captcha_provider;
  const trackerInstall = seed
    ? {
      site: seed.site_name ?? "",
      site_id: seed.site_id ?? "",
      collector_url: seed.collector_url ?? `https://${input.collector_domain}/v1/collect`,
      public_key: seed.public_key ?? "",
      npm_package: seed.npm_package ?? "@eventsgateway/tracker-sdk",
      script: seed.sdk_loader ?? "",
      init: seed.sample_init ?? ""
    }
    : null;

  return {
    dashboard_env: [
      `VITE_API_BASE_URL=${apiBaseUrl}`,
      captchaProvider === "turnstile"
        ? `VITE_TURNSTILE_SITE_KEY=${input.captcha_site_key || "replace-with-your-turnstile-site-key"}`
        : `VITE_CAPTCHA_PROVIDER=${captchaProvider}`
    ].join("\n"),
    api_dev_vars: [
      "API_TOKEN=replace-with-a-long-random-token",
      "BREVO_API_KEY=replace-with-your-brevo-api-key",
      "BREVO_SENDER_EMAIL=no-reply@example.com",
      `PASSWORD_RESET_BASE_URL=${passwordResetBaseUrl}`,
      captchaProvider === "turnstile"
        ? `TURNSTILE_SECRET_KEY=${input.captcha_secret_key || "replace-with-your-turnstile-secret-key"}`
        : `${captchaProvider.toUpperCase()}_SECRET_KEY=${input.captcha_secret_key || `replace-with-your-${captchaProvider}-secret-key`}`
    ].join("\n"),
    tracked_placeholders: {
      CLOUDFLARE_ACCOUNT_ID: input.cloudflare_account_id || "replace-with-your-cloudflare-account-id",
      CLOUDFLARE_ZONE_ID: input.cloudflare_zone_id || "replace-with-your-cloudflare-zone-id",
      CONTROL_PLANE_DATABASE_ID: input.control_plane_database_id || "replace-with-your-d1-database-id",
      CONTROL_PLANE_DATABASE_NAME: input.control_plane_database_name || "eventsgateway-control-plane",
      EVENTS_QUEUE_NAME: input.events_queue_name || "eventsgateway-ingest"
    },
    wrangler_private_values: {
      account_id: input.cloudflare_account_id || "replace-with-your-cloudflare-account-id",
      zone_id: input.cloudflare_zone_id || "replace-with-your-cloudflare-zone-id",
      database_id: input.control_plane_database_id || "replace-with-your-d1-database-id",
      database_name: input.control_plane_database_name || "eventsgateway-control-plane",
      queue_name: input.events_queue_name || "eventsgateway-ingest",
      routes: {
        root: input.root_domain,
        root_www: `www.${input.root_domain}`,
        dashboard: input.dashboard_domain,
        api: input.api_domain,
        collector: input.collector_domain
      }
    },
    captcha_summary: {
      provider: capitalizeWord(captchaProvider),
      site_key: input.captcha_site_key || `replace-with-your-${captchaProvider}-site-key`,
      secret_key_env: captchaProvider === "turnstile" ? "TURNSTILE_SECRET_KEY" : `${captchaProvider.toUpperCase()}_SECRET_KEY`
    },
    deploy_commands: [
      "npm install",
      "npm --prefix apps/dashboard install",
      "npm --prefix apps/api-worker install",
      "npm --prefix apps/collector-worker install",
      "npm --prefix apps/forwarder-worker install",
      "npm run deploy:dashboard",
      "npm run deploy:api",
      "npm run deploy:collector",
      "npm run deploy:forwarder"
    ],
    next_steps: [
      "Keep Cloudflare identifiers and captcha secrets in private local config or secret managers only.",
      "Build and deploy the dashboard after setting the public captcha site key.",
      "Set the API worker captcha secret before opening login, register, or forgot password.",
      "Create the first dashboard user after captcha is active.",
      "Open the tracker install area in the dashboard to connect the first site."
    ],
    tracker_install
  };
}

function sitePath(segment: string): string {
  return `/app/orgs/${currentContext.orgId}/projects/${currentContext.projectId}/sites/${currentContext.siteId}/${segment}`;
}

function getNavGroups(isAdmin: boolean): NavGroup[] {
  const groups: NavGroup[] = [
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
        { label: "Tag Manager", href: sitePath("settings/tag-manager") },
        { label: "Domains", href: sitePath("settings/domains") },
        { label: "API Keys", href: sitePath("settings/api-keys") },
        { label: "Members", href: sitePath("settings/members") },
        { label: "Settings", href: sitePath("settings/general") }
      ]
    }
  ];

  if (isAdmin) {
    groups.push({
      label: "Admin",
      items: [
        { label: "Platform Overview", href: sitePath("admin/overview") },
        { label: "Users Admin", href: sitePath("admin/users") },
        { label: "Sites Admin", href: sitePath("admin/sites") }
      ]
    });
  }

  return groups;
}

function AppShell() {
  const { bootstrap, logout, user } = useAuth();
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

  const navGroups = useMemo(() => getNavGroups(user?.role === "global_admin"), [user?.role]);

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
            {user ? (
              <>
                <span>Signed in as</span>
                <strong>{user.email}</strong>
              </>
            ) : null}
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
              <h1>{bootstrap?.site.name ?? currentContext.siteName}</h1>
              <p>{bootstrap?.site.org_name ?? params.orgId} · {bootstrap?.site.project_name ?? params.projectId} · {bootstrap?.site.environment ?? params.siteId}</p>
            </div>
          </div>
          <div className="eg-topbar__controls">
            <div className="eg-pill">{breadcrumb}</div>
            <div className="eg-pill">{currentContext.environment}</div>
            <div className="eg-pill">{formatRelativeWindow("24h")}</div>
            {user ? <div className="eg-pill">{user.name}</div> : null}
            {user?.role === "global_admin" ? <div className="eg-pill eg-pill--accent">Global admin</div> : null}
            <div className="eg-health-pill is-success">D1 auth active</div>
            <button className="eg-button eg-button--compact" onClick={() => void logout()} type="button">
              Logout
            </button>
          </div>
        </header>

        <main className="eg-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedAppShell() {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return (
      <div className="eg-auth-shell">
        <StateCard title="Preparing dashboard access" description="Restoring the last authenticated session from the API." />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <AppShell />;
}

function ProtectedAdminOutlet() {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return (
      <div className="eg-page">
        <StateCard title="Loading admin access" description="Checking the platform admin capability for this account." />
      </div>
    );
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (user.role !== "global_admin") {
    return (
      <div className="eg-page">
        <StateCard title="Admin access required" description="This area is restricted to the global platform admin." />
      </div>
    );
  }

  return <Outlet />;
}

function AuthShell({
  title,
  description,
  children,
  footer
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="eg-auth-shell">
      <section className="eg-auth-card">
        <div className="eg-auth-card__copy">
          <span className="eyebrow">Dashboard access</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <div className="eg-auth-card__footer">{footer}</div>
      </section>
    </div>
  );
}

function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate replace to={sitePath("overview")} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Complete the captcha challenge before signing in.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password, turnstile_token: captchaToken });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
      setCaptchaResetNonce((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Login to the dashboard"
      description="Use your real dashboard account to access the EventsGateway control plane."
      footer={
        <>
          <span>Need a new account?</span>
          <NavLink className="eg-inline-link" to="/register">
            Register
          </NavLink>
        </>
      }
    >
      <form className="eg-auth-form" onSubmit={handleSubmit}>
        <label className="eg-field">
          <span>Email</span>
          <input
            autoComplete="email"
            className="eg-input"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@eventsgateway.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="eg-field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            className="eg-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </label>

        <div className="eg-auth-form__meta">
          <div className="eg-auth-form__links">
            <NavLink className="eg-inline-link" to="/forgot-password">
              Forgot password?
            </NavLink>
          </div>
        </div>

        <CaptchaWidget onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
        {error ? <p className="eg-form-error">{error}</p> : null}

        <button className="eg-button eg-button--primary" disabled={isSubmitting || !isCaptchaConfigured() || !captchaToken} type="submit">
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthShell>
  );
}

function RegisterPage() {
  const { register, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate replace to={sitePath("overview")} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }
    if (!captchaToken) {
      setError("Complete the captcha challenge before creating the account.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name, email, password, turnstile_token: captchaToken });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Register failed.");
      setCaptchaResetNonce((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Register a dashboard account"
      description="Create a real dashboard account stored in the control plane database."
      footer={
        <>
          <span>Already registered?</span>
          <NavLink className="eg-inline-link" to="/login">
            Login
          </NavLink>
        </>
      }
    >
      <form className="eg-auth-form" onSubmit={handleSubmit}>
        <label className="eg-field">
          <span>Name</span>
          <input
            autoComplete="name"
            className="eg-input"
            onChange={(event) => setName(event.target.value)}
            placeholder="Operations admin"
            required
            type="text"
            value={name}
          />
        </label>

        <label className="eg-field">
          <span>Email</span>
          <input
            autoComplete="email"
            className="eg-input"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@eventsgateway.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="eg-field">
          <span>Password</span>
          <input
            autoComplete="new-password"
            className="eg-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={password}
          />
        </label>

        <label className="eg-field">
          <span>Confirm password</span>
          <input
            autoComplete="new-password"
            className="eg-input"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the password"
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        <CaptchaWidget onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
        {error ? <p className="eg-form-error">{error}</p> : null}

        <button className="eg-button eg-button--primary" disabled={isSubmitting || !isCaptchaConfigured() || !captchaToken} type="submit">
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthShell>
  );
}

function ForgotPasswordPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate replace to={sitePath("overview")} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!captchaToken) {
      setError("Complete the captcha challenge before requesting the reset link.");
      return;
    }

    setIsSubmitting(true);

    try {
      await requestDashboardPasswordReset({ email, turnstile_token: captchaToken });
      setSuccess("If an account exists for this email, we sent a reset link.");
      setCaptchaResetNonce((current) => current + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send reset link.");
      setCaptchaResetNonce((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address linked to your dashboard account and we will send you a reset link."
      footer={
        <>
          <span>Remembered your password?</span>
          <NavLink className="eg-inline-link" to="/login">
            Back to login
          </NavLink>
        </>
      }
    >
      <form className="eg-auth-form" onSubmit={handleSubmit}>
        <label className="eg-field">
          <span>Email</span>
          <input
            autoComplete="email"
            className="eg-input"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@eventsgateway.com"
            required
            type="email"
            value={email}
          />
        </label>

        <CaptchaWidget onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
        {success ? <p className="eg-form-success">{success}</p> : null}
        {error ? <p className="eg-form-error">{error}</p> : null}

        <button className="eg-button eg-button--primary" disabled={isSubmitting || !isCaptchaConfigured() || !captchaToken} type="submit">
          {isSubmitting ? "Sending link..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}

function ResetPasswordPage() {
  const { user } = useAuth();
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get("token")?.trim() ?? "", [location.search]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate replace to={sitePath("overview")} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("The reset link is missing a token.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetDashboardPassword({ token, password });
      setSuccess("Your password was updated. You can now sign in with the new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Set a new password for your EventsGateway dashboard account."
      footer={
        <>
          <span>Need to sign in instead?</span>
          <NavLink className="eg-inline-link" to="/login">
            Back to login
          </NavLink>
        </>
      }
    >
      <form className="eg-auth-form" onSubmit={handleSubmit}>
        <label className="eg-field">
          <span>New password</span>
          <input
            autoComplete="new-password"
            className="eg-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={password}
          />
        </label>

        <label className="eg-field">
          <span>Confirm new password</span>
          <input
            autoComplete="new-password"
            className="eg-input"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat the new password"
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        {!token ? <p className="eg-form-error">This reset link is invalid.</p> : null}
        {success ? <p className="eg-form-success">{success}</p> : null}
        {error ? <p className="eg-form-error">{error}</p> : null}

        <button className="eg-button eg-button--primary" disabled={isSubmitting || !token} type="submit">
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </form>
    </AuthShell>
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
  const queryClient = useQueryClient();
  const routesQuery = useQuery({
    queryKey: qk.routes(currentContext.siteId),
    queryFn: dashboardApi.fetchRoutes
  });
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });
  const [notice, setNotice] = useState("");
  const publishMutation = useMutation({
    mutationFn: dashboardApi.publishRoutes,
    onSuccess: async (payload) => {
      setNotice(`Compiled routing version v${payload.version} is now active.`);
      await queryClient.invalidateQueries({ queryKey: qk.routes(currentContext.siteId) });
    }
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
            <button className="eg-button" onClick={() => queryClient.invalidateQueries({ queryKey: qk.routes(currentContext.siteId) })} type="button">
              Simulate event
            </button>
            <button className="eg-button eg-button--primary" disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()} type="button">
              {publishMutation.isPending ? "Publishing..." : "Publish compiled version"}
            </button>
          </div>
        }
      />
      {notice ? <StateCard compact title="Routing published" description={notice} /> : null}

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Active routes" subtitle="Priority ordered routes in the compiled production config">
          <RoutesTable routes={routesQuery.data.routes} versions={routesQuery.data.versions} destinations={destinationsQuery.data} />
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

        <SurfaceCard title="Available destinations" subtitle="Control panel destinations that can be selected by routes">
          <DestinationPicker
            destinations={destinationsQuery.data}
            onToggle={() => undefined}
            selectedIds={[]}
            disabled
          />
        </SurfaceCard>
      </section>
    </div>
  );
}

function TransformationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const transformationsQuery = useQuery({
    queryKey: qk.transformations(currentContext.siteId),
    queryFn: dashboardApi.fetchTransformations
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [destinationKind, setDestinationKind] = useState<DestinationCreateInput["kind"]>("facebook-pixel");
  const [status, setStatus] = useState<"active" | "draft">("draft");
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([{ key: "", value: "" }]);
  const [mappingText, setMappingText] = useState('{\n  "event_name": "$.type"\n}');
  const [mappingError, setMappingError] = useState("");

  const createMutation = useMutation({
    mutationFn: (input: { name: string; destination_kind: DestinationCreateInput["kind"]; status: "active" | "draft"; mapping: Record<string, unknown> }) =>
      dashboardApi.createTransformation(input),
    onSuccess: async (transformation) => {
      setNotice(`Transformation ${transformation.name} created.`);
      setError("");
      setName("");
      setDestinationKind("facebook-pixel");
      setStatus("draft");
      setMappingRows([{ key: "", value: "" }]);
      setMappingText('{\n  "event_name": "$.type"\n}');
      setMappingError("");
      await queryClient.invalidateQueries({ queryKey: qk.transformations(currentContext.siteId) });
      navigate(sitePath(`transformations/${transformation.id}`));
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create transformation.");
    }
  });

  function handleMappingRowChange(nextRows: MappingRow[]) {
    setMappingRows(nextRows);
    setMappingText(JSON.stringify(rowsToMapping(nextRows), null, 2));
    setMappingError("");
  }

  function handleMappingTextChange(value: string) {
    setMappingText(value);
    try {
      const parsed = value.trim() ? JSON.parse(value) as Record<string, unknown> : {};
      setMappingRows(mappingToRows(parsed));
      setMappingError("");
    } catch {
      setMappingError("Mapping JSON must be valid.");
    }
  }

  function handleCreateTransformation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let mapping: Record<string, unknown> = {};
    try {
      mapping = mappingText.trim() ? JSON.parse(mappingText) as Record<string, unknown> : {};
      setMappingError("");
    } catch {
      setMappingError("Mapping JSON must be valid.");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      destination_kind: destinationKind,
      status,
      mapping
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Transformations"
        description="Map the internal event model into destination-specific payloads."
      />
      {notice ? <StateCard compact title="Transformation updated" description={notice} /> : null}
      {error ? <StateCard compact title="Transformation error" description={error} /> : null}
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Create transformation" subtitle="Define a reusable mapping for a destination kind">
          <form className="eg-auth-form" onSubmit={handleCreateTransformation}>
            <label className="eg-field">
              <span>Name</span>
              <input className="eg-input" onChange={(event) => setName(event.target.value)} required type="text" value={name} />
            </label>
            <label className="eg-field">
              <span>Destination kind</span>
              <select className="eg-input" onChange={(event) => setDestinationKind(event.target.value as DestinationCreateInput["kind"])} value={destinationKind}>
                {DESTINATION_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Status</span>
              <select className="eg-input" onChange={(event) => setStatus(event.target.value as "active" | "draft")} value={status}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
            <div className="eg-stack">
              <strong>Mapping fields</strong>
              {mappingRows.map((row, index) => (
                <div className="eg-grid eg-grid--two" key={`mapping-create-${index}`}>
                  <label className="eg-field">
                    <span>Destination field</span>
                    <input
                      className="eg-input"
                      onChange={(event) => handleMappingRowChange(mappingRows.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))}
                      placeholder="event_name"
                      type="text"
                      value={row.key}
                    />
                  </label>
                  <label className="eg-field">
                    <span>Event source</span>
                    <input
                      className="eg-input"
                      onChange={(event) => handleMappingRowChange(mappingRows.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))}
                      placeholder="$.ecommerce.value"
                      type="text"
                      value={row.value}
                    />
                  </label>
                </div>
              ))}
              <div className="eg-inline-actions">
                <button className="eg-button eg-button--compact" onClick={() => handleMappingRowChange([...mappingRows, { key: "", value: "" }])} type="button">
                  Add mapping row
                </button>
              </div>
              <label className="eg-field">
                <span>Advanced mapping JSON</span>
                <textarea className="eg-input" onChange={(event) => handleMappingTextChange(event.target.value)} rows={8} value={mappingText} />
              </label>
              {mappingError ? <p className="eg-form-error">{mappingError}</p> : null}
            </div>
            <button className="eg-button eg-button--primary" disabled={createMutation.isPending || name.trim().length < 2} type="submit">
              {createMutation.isPending ? "Creating..." : "Create transformation"}
            </button>
          </form>
        </SurfaceCard>
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
                    <NavLink className="eg-inline-link" to={sitePath(`transformations/${transformation.id}`)}>
                      {transformation.name}
                    </NavLink>
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
      </section>
    </div>
  );
}

const DESTINATION_KIND_OPTIONS: Array<{ value: DestinationCreateInput["kind"]; label: string }> = [
  { value: "meta", label: "Meta (Legacy)" },
  { value: "facebook-pixel", label: "Facebook Pixel" },
  { value: "ga4", label: "GA4 (Legacy)" },
  { value: "google-analytics-4", label: "Google Analytics 4" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok" },
  { value: "segment", label: "Segment" },
  { value: "ziprecruiter", label: "ZipRecruiter" },
  { value: "upward", label: "Upward" },
  { value: "tatari", label: "Tatari" },
  { value: "taboola", label: "Taboola" },
  { value: "snapchat", label: "Snapchat" },
  { value: "webhook", label: "Webhook" }
];

const DESTINATION_FORM_ALIASES: Record<string, string> = {
  meta: "facebook-pixel",
  ga4: "google-analytics-4"
};

const DESTINATION_CONFIG_DEFAULTS: Record<string, Record<string, unknown>> = {
  "facebook-pixel": {
    pixel_id: "123456789",
    access_token: "meta_access_token"
  },
  "google-analytics-4": {
    measurement_id: "G-XXXXXXX",
    api_secret: "ga4_api_secret"
  },
  google_ads: {
    conversion_id: "1234567890",
    conversion_label: "AbCdEfGh"
  },
  tiktok: {
    pixel_code: "C123456789",
    access_token: "tiktok_access_token"
  },
  segment: {
    write_key: "segment_write_key",
    hostname: "api.segment.io"
  },
  ziprecruiter: {
    key: "ziprecruiter_key"
  },
  upward: {
    tid: "upward_tid"
  },
  tatari: {
    key: "tatari_key"
  },
  taboola: {
    id: "taboola_id"
  },
  snapchat: {
    pid: "snapchat_pixel_id"
  },
  webhook: {
    url: "https://example.com/webhook",
    method: "POST"
  }
};

type DestinationFieldDefinition = {
  key: string;
  label: string;
  placeholder: string;
  help?: string;
  required?: boolean;
  type?: "text" | "password" | "url";
};

const DESTINATION_FORM_FIELDS: Record<string, DestinationFieldDefinition[]> = {
  "facebook-pixel": [
    { key: "pixel_id", label: "Pixel ID", placeholder: "123456789", required: true },
    { key: "access_token", label: "Access token", placeholder: "meta_access_token", required: true, type: "password" },
    { key: "test_event_code", label: "Test event code", placeholder: "TEST1234", help: "Optional Meta test code for validation." }
  ],
  "google-analytics-4": [
    { key: "measurement_id", label: "Measurement ID", placeholder: "G-XXXXXXX", required: true },
    { key: "api_secret", label: "API secret", placeholder: "ga4_api_secret", required: true, type: "password" }
  ],
  google_ads: [
    { key: "conversion_id", label: "Conversion ID", placeholder: "1234567890", required: true },
    { key: "conversion_label", label: "Conversion label", placeholder: "AbCdEfGh", required: true }
  ],
  tiktok: [
    { key: "pixel_code", label: "Pixel code", placeholder: "C123456789", required: true },
    { key: "access_token", label: "Access token", placeholder: "tiktok_access_token", required: true, type: "password" },
    { key: "test_event_code", label: "Test event code", placeholder: "TEST1234", help: "Optional TikTok test code for validation." }
  ],
  segment: [
    { key: "write_key", label: "Write key", placeholder: "segment_write_key", required: true, type: "password" },
    { key: "hostname", label: "Hostname", placeholder: "api.segment.io", help: "Leave the default host unless you use a custom Segment region." }
  ],
  ziprecruiter: [
    { key: "key", label: "Conversion key", placeholder: "ziprecruiter_key", required: true }
  ],
  upward: [
    { key: "tid", label: "Tracking ID", placeholder: "upward_tid", required: true }
  ],
  tatari: [
    { key: "key", label: "Tatari key", placeholder: "tatari_key", required: true, type: "password" }
  ],
  taboola: [
    { key: "id", label: "Account ID", placeholder: "taboola_id", required: true }
  ],
  snapchat: [
    { key: "pid", label: "Pixel ID", placeholder: "snapchat_pixel_id", required: true }
  ],
  webhook: [
    { key: "url", label: "Webhook URL", placeholder: "https://example.com/webhook", required: true, type: "url" },
    { key: "method", label: "HTTP method", placeholder: "POST" }
  ]
};

type DashboardDestination = Awaited<ReturnType<typeof dashboardApi.fetchDestinations>>[number];
type DashboardRoute = Awaited<ReturnType<typeof dashboardApi.fetchRouteDetail>>;
type DashboardTransformation = Awaited<ReturnType<typeof dashboardApi.fetchTransformationDetail>>;

function normalizeDestinationFormKind(kind: string) {
  return DESTINATION_FORM_ALIASES[kind] ?? kind;
}

function getDefaultDestinationConfig(kind: string): Record<string, unknown> {
  const normalizedKind = normalizeDestinationFormKind(kind);
  const defaults = DESTINATION_CONFIG_DEFAULTS[normalizedKind] ?? {};
  return JSON.parse(JSON.stringify(defaults)) as Record<string, unknown>;
}

function stringifyDestinationConfig(config: Record<string, unknown>) {
  return JSON.stringify(config, null, 2);
}

function updateDestinationConfigValue(config: Record<string, unknown>, key: string, value: string) {
  const nextConfig = { ...config };
  if (!value.trim()) {
    delete nextConfig[key];
    return nextConfig;
  }

  nextConfig[key] = value;
  return nextConfig;
}

function parseDestinationConfigText(value: string) {
  if (!value.trim()) return {};
  return JSON.parse(value) as Record<string, unknown>;
}

function DestinationConfigEditor({
  kind,
  config,
  configText,
  configTextError,
  onFieldChange,
  onConfigTextChange
}: {
  kind: string;
  config: Record<string, unknown>;
  configText: string;
  configTextError: string;
  onFieldChange: (key: string, value: string) => void;
  onConfigTextChange: (value: string) => void;
}) {
  const normalizedKind = normalizeDestinationFormKind(kind);
  const fields = DESTINATION_FORM_FIELDS[normalizedKind] ?? [];

  return (
    <div className="eg-stack">
      {fields.length ? (
        <div className="eg-grid eg-grid--two">
          {fields.map((field) => (
            <label className="eg-field" key={field.key}>
              <span>{field.label}</span>
              <input
                className="eg-input"
                onChange={(event) => onFieldChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type ?? "text"}
                value={typeof config[field.key] === "string" ? String(config[field.key] ?? "") : ""}
              />
              {field.help ? <small>{field.help}</small> : null}
            </label>
          ))}
        </div>
      ) : (
        <StateCard compact title="No vendor form yet" description="Use the advanced JSON editor for this destination kind." />
      )}
      <label className="eg-field">
        <span>Advanced config JSON</span>
        <textarea
          className="eg-input"
          onChange={(event) => onConfigTextChange(event.target.value)}
          rows={10}
          value={configText}
        />
      </label>
      {configTextError ? <p className="eg-form-error">{configTextError}</p> : null}
    </div>
  );
}

type MappingRow = { key: string; value: string };

function mappingToRows(mapping: Record<string, unknown>): MappingRow[] {
  const entries = Object.entries(mapping ?? {});
  if (!entries.length) return [{ key: "", value: "" }];
  return entries.map(([key, value]) => ({ key, value: typeof value === "string" ? value : JSON.stringify(value) }));
}

function rowsToMapping(rows: MappingRow[]) {
  return rows.reduce<Record<string, unknown>>((accumulator, row) => {
    const key = row.key.trim();
    const value = row.value.trim();
    if (!key || !value) return accumulator;
    accumulator[key] = value;
    return accumulator;
  }, {});
}

function parseBooleanNumberOrString(value: string) {
  const normalized = value.trim();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  if (normalized !== "" && !Number.isNaN(Number(normalized))) return Number(normalized);
  return normalized;
}

function parseConditionValue(op: string, value: string) {
  if (op === "exists" || op === "not_exists") return undefined;
  if (op === "in" || op === "not_in") {
    return value.split(",").map((item) => parseBooleanNumberOrString(item)).filter((item) => item !== "");
  }
  return parseBooleanNumberOrString(value);
}

function stringifyConditionValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "undefined") return "";
  return String(value);
}

function parseEventTypesInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderConditionGroupEditor({
  title,
  conditions,
  onChange
}: {
  title: string;
  conditions: DashboardRoute["match"]["all"];
  onChange: (next: NonNullable<DashboardRoute["match"]["all"]>) => void;
}) {
  const rows = conditions && conditions.length ? conditions : [{ path: "", op: "eq" as const, value: "" }];
  return (
    <div className="eg-stack">
      <strong>{title}</strong>
      {rows.map((condition, index) => (
        <div className="eg-grid eg-grid--two" key={`${title}-${index}`}>
          <label className="eg-field">
            <span>Path</span>
            <input
              className="eg-input"
              onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, path: event.target.value } : item))}
              placeholder="properties.plan"
              type="text"
              value={condition.path}
            />
          </label>
          <label className="eg-field">
            <span>Operator</span>
            <select
              className="eg-input"
              onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, op: event.target.value as typeof item.op } : item))}
              value={condition.op}
            >
              {["exists", "not_exists", "eq", "neq", "in", "not_in", "contains", "starts_with", "ends_with", "regex", "gt", "gte", "lt", "lte"].map((operator) => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>
          </label>
          <label className="eg-field">
            <span>Value</span>
            <input
              className="eg-input"
              disabled={condition.op === "exists" || condition.op === "not_exists"}
              onChange={(event) => onChange(rows.map((item, itemIndex) => itemIndex === index ? { ...item, value: parseConditionValue(item.op, event.target.value) } : item))}
              placeholder={condition.op === "in" || condition.op === "not_in" ? "pro, enterprise" : "true"}
              type="text"
              value={stringifyConditionValue(condition.value)}
            />
          </label>
          <div className="eg-inline-actions">
            <button
              className="eg-button eg-button--compact"
              onClick={() => onChange([...rows, { path: "", op: "eq", value: "" }])}
              type="button"
            >
              Add condition
            </button>
            <button
              className="eg-button eg-button--compact"
              onClick={() => onChange(rows.length === 1 ? [{ path: "", op: "eq", value: "" }] : rows.filter((_, itemIndex) => itemIndex !== index))}
              type="button"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function normalizeTemplateDestinationKind(templateKey: string): string {
  switch (templateKey) {
    case "ga4":
      return "google-analytics-4";
    case "meta-conversions":
      return "facebook-pixel";
    case "google-ads":
      return "google_ads";
    default:
      return templateKey;
  }
}

function getDestinationNames(selectedIds: string[], destinations: DashboardDestination[] | undefined) {
  if (!destinations?.length) return selectedIds;
  return selectedIds.map((id) => destinations.find((destination) => destination.id === id)?.name ?? id);
}

function DestinationChips({
  selectedIds,
  destinations
}: {
  selectedIds: string[];
  destinations: DashboardDestination[] | undefined;
}) {
  const selectedNames = getDestinationNames(selectedIds, destinations);
  if (!selectedNames.length) {
    return <span className="eg-pill">No destinations</span>;
  }

  return (
    <div className="eg-inline-actions">
      {selectedNames.map((name) => (
        <span className="eg-pill" key={name}>{name}</span>
      ))}
    </div>
  );
}

function DestinationPicker({
  destinations,
  selectedIds,
  onToggle,
  disabled = false
}: {
  destinations: DashboardDestination[] | undefined;
  selectedIds: string[];
  onToggle: (destinationId: string) => void;
  disabled?: boolean;
}) {
  if (!destinations?.length) {
    return <StateCard compact title="No destinations available" description="Create destinations in the control panel before wiring them into routes or tags." />;
  }

  return (
    <div className="eg-list">
      {destinations.map((destination) => {
        const selected = selectedIds.includes(destination.id);
        return (
          <div className="eg-list__row" key={destination.id}>
            <div>
              <strong>{destination.name}</strong>
              <span>{`${destination.kind} · ${destination.secret_preview}`}</span>
            </div>
            <div className="eg-inline-actions">
              <StatusBadge status={destination.status === "active" ? "healthy" : destination.status}>
                {destination.status}
              </StatusBadge>
              <button
                className="eg-button eg-button--compact"
                disabled={disabled}
                onClick={() => onToggle(destination.id)}
                type="button"
              >
                {selected ? "Remove" : "Select"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DestinationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    kind: "facebook-pixel" as DestinationCreateInput["kind"],
    status: "active" as DestinationCreateInput["status"]
  });
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>(getDefaultDestinationConfig("facebook-pixel"));
  const [configText, setConfigText] = useState(stringifyDestinationConfig(getDefaultDestinationConfig("facebook-pixel")));
  const [configTextError, setConfigTextError] = useState("");

  const createMutation = useMutation({
    mutationFn: (input: DestinationCreateInput) => dashboardApi.createDestination(input),
    onSuccess: async (destination) => {
      setNotice(`Destination ${destination.name} created in the control panel.`);
      setError("");
      setForm({
        name: "",
        kind: "facebook-pixel",
        status: "active"
      });
      const defaultConfig = getDefaultDestinationConfig("facebook-pixel");
      setConfigDraft(defaultConfig);
      setConfigText(stringifyDestinationConfig(defaultConfig));
      setConfigTextError("");
      await queryClient.invalidateQueries({ queryKey: qk.destinations(currentContext.siteId) });
      navigate(sitePath(`destinations/${destination.id}`));
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create destination.");
    }
  });

  function handleCreateDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = parseDestinationConfigText(configText);
      setConfigTextError("");
    } catch {
      setConfigTextError("Destination config must be valid JSON.");
      return;
    }

    createMutation.mutate({
      name: form.name,
      kind: form.kind,
      status: form.status,
      config: parsedConfig
    });
  }

  function handleKindChange(nextKind: DestinationCreateInput["kind"]) {
    const defaultConfig = getDefaultDestinationConfig(nextKind);
    setForm((current) => ({
      ...current,
      kind: nextKind
    }));
    setConfigDraft(defaultConfig);
    setConfigText(stringifyDestinationConfig(defaultConfig));
    setConfigTextError("");
  }

  function handleConfigFieldChange(key: string, value: string) {
    setConfigDraft((current) => {
      const nextConfig = updateDestinationConfigValue(current, key, value);
      setConfigText(stringifyDestinationConfig(nextConfig));
      setConfigTextError("");
      return nextConfig;
    });
  }

  function handleConfigTextChange(value: string) {
    setConfigText(value);
    try {
      const parsed = parseDestinationConfigText(value);
      setConfigDraft(parsed);
      setConfigTextError("");
    } catch {
      setConfigTextError("Destination config must be valid JSON.");
    }
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Destinations"
        description="Choose delivery destinations from the control panel and manage credentials, runtime config and delivery posture."
      />
      {notice ? <StateCard compact title="Destination updated" description={notice} /> : null}
      {error ? <StateCard compact title="Destination error" description={error} /> : null}
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Add destination" subtitle="Provision a destination directly from the control panel">
          <form className="eg-auth-form" onSubmit={handleCreateDestination}>
            <label className="eg-field">
              <span>Name</span>
              <input
                className="eg-input"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={form.name}
              />
            </label>
            <label className="eg-field">
              <span>Kind</span>
              <select
                className="eg-input"
                onChange={(event) => handleKindChange(event.target.value as DestinationCreateInput["kind"])}
                value={form.kind}
              >
                {DESTINATION_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Status</span>
              <select
                className="eg-input"
                onChange={(event) => setForm((current) => ({
                  ...current,
                  status: event.target.value as DestinationCreateInput["status"]
                }))}
                value={form.status}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <DestinationConfigEditor
              config={configDraft}
              configText={configText}
              configTextError={configTextError}
              kind={form.kind}
              onConfigTextChange={handleConfigTextChange}
              onFieldChange={handleConfigFieldChange}
            />
            <button className="eg-button eg-button--primary" disabled={createMutation.isPending} type="submit">
              {createMutation.isPending ? "Creating..." : "Create destination"}
            </button>
          </form>
        </SurfaceCard>
        <SurfaceCard title="Connected destinations" subtitle="Targets available to routing and tag delivery">
          {!destinationsQuery.data ? (
            <StateCard title="Loading destinations" description="Fetching destination configs and secret status." compact />
          ) : !destinationsQuery.data.length ? (
            <StateCard title="No destinations yet" description="Create the first destination to start wiring vendor delivery from the control panel." compact />
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
                    <NavLink className="eg-inline-link" to={sitePath(`destinations/${destination.id}`)}>
                      {destination.name}
                    </NavLink>
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
      </section>
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
      void queryClient.invalidateQueries({ queryKey: qk.dlq(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.jobs(currentContext.siteId) });
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
  const queryClient = useQueryClient();
  const queuesQuery = useQuery({
    queryKey: qk.queues(currentContext.siteId),
    queryFn: dashboardApi.fetchQueues,
    refetchInterval: 10000
  });
  const jobsQuery = useQuery({
    queryKey: qk.jobs(currentContext.siteId),
    queryFn: dashboardApi.fetchJobs
  });
  const flushMutation = useMutation({
    mutationFn: dashboardApi.flushForwarder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.queues(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.jobs(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.dlq(currentContext.siteId) });
      void queryClient.invalidateQueries({ queryKey: qk.deliveries(currentContext.siteId) });
    }
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Queues and Jobs"
        description="Inspect forwarder backlog, DLQ pressure and operation jobs from replay and export flows."
        action={
          <button className="eg-button" disabled={flushMutation.isPending} onClick={() => flushMutation.mutate()} type="button">
            {flushMutation.isPending ? "Flushing..." : "Flush forwarder"}
          </button>
        }
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

function SetupWizardSection({
  title,
  description,
  seed,
  compact
}: {
  title: string;
  description: string;
  seed?: InstallSeed;
  compact?: boolean;
}) {
  const [form, setForm] = useState<InstallWizardInput>(() => buildInstallWizardDefaults(seed));
  const artifacts = useMemo(() => buildInstallArtifacts(form, seed), [form, seed]);
  const configuredCaptchaSiteKey = readCaptchaSiteKey();

  function updateField<Key extends keyof InstallWizardInput>(key: Key, value: InstallWizardInput[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      {!compact ? <PageIntro title={title} description={description} /> : null}
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Cloudflare runtime" subtitle="Private identifiers and routing for the self-hosted deployment">
          <div className="eg-auth-form">
            <label className="eg-field">
              <span>Root domain</span>
              <input className="eg-input" onChange={(event) => updateField("root_domain", event.target.value)} type="text" value={form.root_domain} />
            </label>
            <label className="eg-field">
              <span>Dashboard domain</span>
              <input className="eg-input" onChange={(event) => updateField("dashboard_domain", event.target.value)} type="text" value={form.dashboard_domain} />
            </label>
            <label className="eg-field">
              <span>API domain</span>
              <input className="eg-input" onChange={(event) => updateField("api_domain", event.target.value)} type="text" value={form.api_domain} />
            </label>
            <label className="eg-field">
              <span>Collector domain</span>
              <input className="eg-input" onChange={(event) => updateField("collector_domain", event.target.value)} type="text" value={form.collector_domain} />
            </label>
            <label className="eg-field">
              <span>Cloudflare account ID</span>
              <input className="eg-input" onChange={(event) => updateField("cloudflare_account_id", event.target.value)} type="text" value={form.cloudflare_account_id} />
            </label>
            <label className="eg-field">
              <span>Cloudflare zone ID</span>
              <input className="eg-input" onChange={(event) => updateField("cloudflare_zone_id", event.target.value)} type="text" value={form.cloudflare_zone_id} />
            </label>
            <label className="eg-field">
              <span>D1 database ID</span>
              <input className="eg-input" onChange={(event) => updateField("control_plane_database_id", event.target.value)} type="text" value={form.control_plane_database_id} />
            </label>
            <label className="eg-field">
              <span>D1 database name</span>
              <input className="eg-input" onChange={(event) => updateField("control_plane_database_name", event.target.value)} type="text" value={form.control_plane_database_name} />
            </label>
            <label className="eg-field">
              <span>Queue name</span>
              <input className="eg-input" onChange={(event) => updateField("events_queue_name", event.target.value)} type="text" value={form.events_queue_name} />
            </label>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Captcha strategy" subtitle="Choose the provider before opening login or registration">
          <div className="eg-auth-form">
            <label className="eg-field">
              <span>Provider</span>
              <select className="eg-input" onChange={(event) => updateField("captcha_provider", event.target.value as CaptchaProvider)} value={form.captcha_provider}>
                <option value="turnstile">Cloudflare Turnstile</option>
                <option value="recaptcha">Google reCAPTCHA</option>
                <option value="hcaptcha">hCaptcha</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Site key</span>
              <input className="eg-input" onChange={(event) => updateField("captcha_site_key", event.target.value)} type="text" value={form.captcha_site_key} />
            </label>
            <label className="eg-field">
              <span>Secret key</span>
              <input className="eg-input" onChange={(event) => updateField("captcha_secret_key", event.target.value)} type="password" value={form.captcha_secret_key} />
            </label>
            <div className="eg-stack">
              <ActionLine title="Chosen provider" text={artifacts.captcha_summary.provider} />
              <ActionLine title="Dashboard build key" text={form.captcha_site_key || "Pending"} />
              <ActionLine title="API secret env" text={artifacts.captcha_summary.secret_key_env} />
              <ActionLine title="Current dashboard build" text={configuredCaptchaSiteKey || "No captcha site key is active in this build"} />
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Private environment files" subtitle="Generate local values without storing them in the repository">
          <JsonPanel
            value={{
              "apps/dashboard/.env.local": artifacts.dashboard_env,
              "apps/api-worker/.dev.vars": artifacts.api_dev_vars
            }}
          />
        </SurfaceCard>
        <SurfaceCard title="Private deployment values" subtitle="Use these values when preparing private Wrangler configuration">
          <JsonPanel
            value={{
              placeholders: artifacts.tracked_placeholders,
              private_values: artifacts.wrangler_private_values
            }}
          />
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Deploy sequence" subtitle="Run after private config and secrets are ready">
          <JsonPanel value={artifacts.deploy_commands} />
        </SurfaceCard>
        <SurfaceCard title="Installation checklist" subtitle="Minimum order to reach a working self-hosted setup">
          <JsonPanel value={artifacts.next_steps} />
        </SurfaceCard>
      </section>

      {artifacts.tracker_install ? (
        <section className="eg-grid eg-grid--two">
          <SurfaceCard title="Tracker install" subtitle="Site-specific browser setup after the platform is ready">
            <div className="eg-stack">
              <ActionLine title="Site" text={artifacts.tracker_install.site} />
              <ActionLine title="Site ID" text={artifacts.tracker_install.site_id} />
              <ActionLine title="Collector URL" text={artifacts.tracker_install.collector_url} />
              <ActionLine title="Public key" text={artifacts.tracker_install.public_key} />
              <ActionLine title="NPM package" text={artifacts.tracker_install.npm_package} />
            </div>
          </SurfaceCard>
          <SurfaceCard title="Starter snippets" subtitle="Tracker bootstrap for the first connected site">
            <JsonPanel
              value={{
                script: artifacts.tracker_install.script,
                init: artifacts.tracker_install.init
              }}
            />
          </SurfaceCard>
        </section>
      ) : null}
    </>
  );
}

function SetupPage() {
  return (
    <div className="eg-page eg-page--setup">
      <SetupWizardSection
        title="Initial Install Setup"
        description="Prepare the private Cloudflare identifiers, captcha provider, and local deployment values before opening the dashboard to users."
      />
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
        description="Connect the browser tracker and generate private deployment values for self-hosted installs."
      />
      {!installQuery.data ? (
        <StateCard title="Loading install config" description="Preparing SDK and collector setup instructions." />
      ) : (
        <SetupWizardSection
          compact
          title="Install Tracker"
          description="Connect the browser tracker and generate private deployment values for self-hosted installs."
          seed={installQuery.data}
        />
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
  const queryClient = useQueryClient();
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const domainsQuery = useQuery({
    queryKey: qk.domains(currentContext.siteId),
    queryFn: dashboardApi.fetchDomains
  });
  const createDomainMutation = useMutation({
    mutationFn: dashboardApi.createDomain,
    onSuccess: async () => {
      setDomain("");
      setDescription("");
      setError("");
      await queryClient.invalidateQueries({ queryKey: qk.domains(currentContext.siteId) });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to add domain.");
    }
  });
  const deleteDomainMutation = useMutation({
    mutationFn: dashboardApi.deleteDomain,
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: qk.domains(currentContext.siteId) });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete domain.");
    }
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    void createDomainMutation.mutate({
      domain,
      description
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Domains"
        description="Verified collection origins and production domains that are allowed to send browser events."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Verified domains" subtitle="Live allowlist used by the collector for browser-origin validation">
          {!domainsQuery.data ? (
            <StateCard title="Loading domains" description="Fetching trusted site origins from the control plane." compact />
          ) : (
            <div className="eg-list">
              {domainsQuery.data.map((item) => (
                <div className="eg-list__row" key={item.id}>
                  <div>
                    <strong>{item.domain}</strong>
                    <span>{item.description ?? `${item.kind} domain`}</span>
                  </div>
                  <div className="eg-inline-actions">
                    <StatusBadge status={item.status === "verified" || item.status === "internal" ? "healthy" : "pending"}>
                      {item.status}
                    </StatusBadge>
                    {item.domain !== "goldring.ro" && item.domain !== "www.goldring.ro" ? (
                      <button
                        className="eg-button eg-button--compact"
                        disabled={deleteDomainMutation.isPending}
                        onClick={() => deleteDomainMutation.mutate(item.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard title="Add domain" subtitle="Register another origin that should be accepted by the collector">
          <form className="eg-auth-form" onSubmit={handleSubmit}>
            <label className="eg-field">
              <span>Domain</span>
              <input
                className="eg-input"
                onChange={(event) => setDomain(event.target.value)}
                placeholder="shop.goldring.ro"
                required
                type="text"
                value={domain}
              />
            </label>
            <label className="eg-field">
              <span>Description</span>
              <input
                className="eg-input"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Staging storefront"
                type="text"
                value={description}
              />
            </label>
            {error ? <p className="eg-form-error">{error}</p> : null}
            <button className="eg-button eg-button--primary" disabled={createDomainMutation.isPending} type="submit">
              {createDomainMutation.isPending ? "Saving domain..." : "Add domain"}
            </button>
          </form>
        </SurfaceCard>
      </section>
    </div>
  );
}

function ApiKeysPage() {
  const apiKeysQuery = useQuery({
    queryKey: qk.apiKeys(currentContext.siteId),
    queryFn: dashboardApi.fetchApiKeys
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="API Keys"
        description="Active site keys used for browser collection and install snippets."
      />
      <SurfaceCard title="Collector keys" subtitle="Use these keys only inside trusted site integrations">
        {!apiKeysQuery.data ? (
          <StateCard title="Loading keys" description="Fetching active site keys from the control plane." compact />
        ) : (
          <div className="eg-list">
            {apiKeysQuery.data.map((item) => (
              <div className="eg-list__row" key={item.id}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.public_key}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={item.status === "active" ? "healthy" : "pending"}>{item.status}</StatusBadge>
                  <span className="eg-pill">{item.last_used_at ? "Used" : "Not used yet"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}

function MembersPage() {
  const { user } = useAuth();

  return (
    <div className="eg-page">
      <PageIntro
        title="Members"
        description="Current dashboard account and the access posture attached to this control plane."
      />
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Current operator" subtitle="Live account resolved from the D1-backed auth session">
          <div className="eg-list">
            <div className="eg-list__row">
              <div>
                <strong>{user?.name ?? "Unknown user"}</strong>
                <span>{user?.email ?? "No active email"}</span>
              </div>
              <div className="eg-inline-actions">
                <StatusBadge status={user?.role === "global_admin" ? "healthy" : "pending"}>{user?.role ?? "member"}</StatusBadge>
                <StatusBadge status={user?.status === "active" ? "healthy" : "warning"}>{user?.status ?? "active"}</StatusBadge>
              </div>
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

function TagManagerPage() {
  const queryClient = useQueryClient();
  const tagManagerQuery = useQuery({
    queryKey: qk.tagManager(currentContext.siteId),
    queryFn: dashboardApi.fetchTagManager
  });
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });
  const [draft, setDraft] = useState<TagManagerData | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [publishSummary, setPublishSummary] = useState("Ship managed tag manager UX controls.");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagForm, setTagForm] = useState({
    name: "",
    template_key: "ga4",
    delivery: "edge" as TagManagerTag["delivery"],
    trigger_id: "",
    destination_ids: [] as string[],
    consent_mode: "inherit" as TagManagerTag["consent_mode"],
    notes: ""
  });
  const [triggerForm, setTriggerForm] = useState({
    name: "",
    event: "",
    match: "",
    scope: "page" as TagManagerTrigger["scope"]
  });
  const [variableForm, setVariableForm] = useState({
    name: "",
    kind: "context" as TagManagerVariable["kind"],
    source: "",
    fallback: "",
    scope: "browser" as TagManagerVariable["scope"]
  });
  const [scriptForm, setScriptForm] = useState({
    name: "",
    script: "",
    placement: "head" as TagManagerScriptRule["placement"],
    strategy: "lazy" as TagManagerScriptRule["strategy"],
    consent_category: "inherit" as TagManagerScriptRule["consent_category"]
  });
  const [consentForm, setConsentForm] = useState({
    category: "analytics" as TagManagerConsentRule["category"],
    default_state: "denied" as TagManagerConsentRule["default_state"],
    enforcement: "queue" as TagManagerConsentRule["enforcement"],
    scope: ""
  });

  useEffect(() => {
    if (tagManagerQuery.data) {
      setDraft(tagManagerQuery.data);
      setTagForm((current) => ({
        ...current,
        template_key: current.template_key || tagManagerQuery.data.templates[0]?.key || "ga4"
      }));
    }
  }, [tagManagerQuery.data]);

  function createId(prefix: string) {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
    }

    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function buildDraftPayload(value: TagManagerData) {
    return {
      container_id: value.container_id,
      install_mode: value.install_mode,
      loader_status: value.loader_status,
      tags: value.tags,
      triggers: value.triggers,
      variables: value.variables,
      templates: value.templates,
      script_rules: value.script_rules,
      consent_rules: value.consent_rules,
      snippets: value.snippets
    };
  }

  function updateDraft(updater: (current: TagManagerData) => TagManagerData) {
    setDraft((current) => (current ? updater(current) : current));
    setNotice("");
    setError("");
  }

  const saveMutation = useMutation({
    mutationFn: (value: TagManagerData) => dashboardApi.saveTagManager(buildDraftPayload(value)),
    onSuccess: async (next) => {
      setDraft(next);
      setNotice("Draft saved inside the dashboard control plane.");
      setError("");
      await queryClient.invalidateQueries({ queryKey: qk.tagManager(currentContext.siteId) });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to save the tag manager draft.");
    }
  });

  const publishMutation = useMutation({
    mutationFn: ({ value, summary }: { value: TagManagerData; summary: string }) =>
      dashboardApi.publishTagManager({ draft: buildDraftPayload(value), summary }),
    onSuccess: async (next) => {
      setDraft(next);
      setNotice("Draft published as the active tag manager container.");
      setError("");
      await queryClient.invalidateQueries({ queryKey: qk.tagManager(currentContext.siteId) });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to publish the tag manager draft.");
    }
  });

  if (!draft) {
    return (
      <div className="eg-page">
        <StateCard title="Loading tag manager" description="Preparing tags, triggers, variables and publish workflow." />
      </div>
    );
  }

  const activeTagCount = draft.tags.filter((tag) => tag.status === "active").length;
  const activeTriggerCount = draft.triggers.filter((trigger) => trigger.status === "active").length;
  const activeScriptCount = draft.script_rules.filter((rule) => rule.status === "active").length;
  const governedConsentCount = draft.consent_rules.filter((rule) => rule.default_state !== "inherit").length;

  function getSuggestedDestinationIds(templateKey: string) {
    const normalizedKind = normalizeTemplateDestinationKind(templateKey);
    return (destinationsQuery.data ?? [])
      .filter((destination) => destination.kind === normalizedKind)
      .map((destination) => destination.id);
  }

  function addTagFromTemplate(templateKey: string) {
    const template = draft.templates.find((item) => item.key === templateKey);
    if (!template) return;
    const defaultTriggerId = draft.triggers[0]?.id ?? "";
    updateDraft((current) => ({
      ...current,
      tags: [
        ...current.tags,
        {
          id: createId("tag"),
          name: template.name,
          template_key: template.key,
          delivery: template.default_delivery,
          trigger_ids: defaultTriggerId ? [defaultTriggerId] : [],
          variable_ids: [],
          destination_ids: getSuggestedDestinationIds(template.key),
          consent_mode: template.default_consent,
          status: "draft",
          notes: template.description
        }
      ]
    }));
    setNotice(`Template ${template.name} added to the draft container.`);
  }

  function handleAddTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDraft((current) => ({
      ...current,
      tags: [
        ...current.tags,
        {
          id: createId("tag"),
          name: tagForm.name,
          template_key: tagForm.template_key,
          delivery: tagForm.delivery,
          trigger_ids: tagForm.trigger_id ? [tagForm.trigger_id] : [],
          variable_ids: [],
          destination_ids: tagForm.destination_ids,
          consent_mode: tagForm.consent_mode,
          status: "draft",
          notes: tagForm.notes
        }
      ]
    }));
    setTagForm((current) => ({
      ...current,
      name: "",
      trigger_id: "",
      destination_ids: [],
      notes: ""
    }));
  }

  function handleAddTrigger(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDraft((current) => ({
      ...current,
      triggers: [
        ...current.triggers,
        {
          id: createId("trigger"),
          name: triggerForm.name,
          event: triggerForm.event,
          match: triggerForm.match,
          scope: triggerForm.scope,
          status: "draft"
        }
      ]
    }));
    setTriggerForm({
      name: "",
      event: "",
      match: "",
      scope: "page"
    });
  }

  function handleAddVariable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDraft((current) => ({
      ...current,
      variables: [
        ...current.variables,
        {
          id: createId("variable"),
          name: variableForm.name,
          kind: variableForm.kind,
          source: variableForm.source,
          fallback: variableForm.fallback,
          scope: variableForm.scope,
          status: "draft"
        }
      ]
    }));
    setVariableForm({
      name: "",
      kind: "context",
      source: "",
      fallback: "",
      scope: "browser"
    });
  }

  function handleAddScriptRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDraft((current) => ({
      ...current,
      script_rules: [
        ...current.script_rules,
        {
          id: createId("script"),
          name: scriptForm.name,
          script: scriptForm.script,
          placement: scriptForm.placement,
          strategy: scriptForm.strategy,
          consent_category: scriptForm.consent_category,
          status: "draft"
        }
      ]
    }));
    setScriptForm({
      name: "",
      script: "",
      placement: "head",
      strategy: "lazy",
      consent_category: "inherit"
    });
  }

  function handleAddConsentRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDraft((current) => ({
      ...current,
      consent_rules: [
        ...current.consent_rules.filter((rule) => rule.category !== consentForm.category),
        {
          id: createId("consent"),
          category: consentForm.category,
          default_state: consentForm.default_state,
          enforcement: consentForm.enforcement,
          scope: consentForm.scope || `${consentForm.category} controlled tags`
        }
      ]
    }));
    setConsentForm({
      category: "analytics",
      default_state: "denied",
      enforcement: "queue",
      scope: ""
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Tag Manager"
        description="Manage tags, triggers, variables, script governance, consent firing and publish workflow from the same site-level control surface."
        action={(
          <div className="eg-actions">
            <button
              className="eg-button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate(draft)}
              type="button"
            >
              {saveMutation.isPending ? "Saving draft..." : "Save draft"}
            </button>
            <button
              className="eg-button eg-button--primary"
              disabled={publishMutation.isPending}
              onClick={() => publishMutation.mutate({ value: draft, summary: publishSummary })}
              type="button"
            >
              {publishMutation.isPending ? "Publishing..." : "Publish container"}
            </button>
          </div>
        )}
      />

      {notice ? <StateCard compact title="Draft status" description={notice} /> : null}
      {error ? <StateCard compact title="Action error" description={error} /> : null}

      <section className="eg-metric-grid">
        <MetricCard label="Active tags" value={activeTagCount} detail="Managed tags currently ready for firing." />
        <MetricCard label="Active triggers" value={activeTriggerCount} detail="Browser or edge rules driving tag execution." />
        <MetricCard label="Governed scripts" value={activeScriptCount} detail="Third-party scripts controlled by the governance layer." />
        <MetricCard label="Pending changes" value={draft.publish.pending_changes} detail="Items waiting to be published into the active container." />
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Container control" subtitle="Site-level tag manager surface aligned with EventsGateway routing">
          <form className="eg-auth-form" onSubmit={(event) => event.preventDefault()}>
            <label className="eg-field">
              <span>Container ID</span>
              <input
                className="eg-input"
                onChange={(event) => updateDraft((current) => ({ ...current, container_id: event.target.value }))}
                type="text"
                value={draft.container_id}
              />
            </label>
            <label className="eg-field">
              <span>Install mode</span>
              <select
                className="eg-input"
                onChange={(event) => updateDraft((current) => ({
                  ...current,
                  install_mode: event.target.value as TagManagerData["install_mode"]
                }))}
                value={draft.install_mode}
              >
                <option value="loader">Loader snippet</option>
                <option value="npm">NPM package</option>
                <option value="worker">Worker-first install</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Loader status</span>
              <select
                className="eg-input"
                onChange={(event) => updateDraft((current) => ({
                  ...current,
                  loader_status: event.target.value as TagManagerData["loader_status"]
                }))}
                value={draft.loader_status}
              >
                <option value="active">Active</option>
                <option value="draft">Draft only</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Loader snippet</span>
              <textarea
                className="eg-input"
                onChange={(event) => updateDraft((current) => ({
                  ...current,
                  snippets: { ...current.snippets, loader: event.target.value }
                }))}
                rows={4}
                value={draft.snippets.loader}
              />
            </label>
            <label className="eg-field">
              <span>Data layer snippet</span>
              <textarea
                className="eg-input"
                onChange={(event) => updateDraft((current) => ({
                  ...current,
                  snippets: { ...current.snippets, data_layer: event.target.value }
                }))}
                rows={4}
                value={draft.snippets.data_layer}
              />
            </label>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Publish workflow" subtitle="Draft and release flow comparable with a tag container">
          <div className="eg-stack">
            <ActionLine title="Draft version" text={`v${draft.publish.draft_version} is editable in the dashboard.`} />
            <ActionLine title="Active version" text={`v${draft.publish.active_version} is currently serving the live site.`} />
            <ActionLine title="Last published" text={`${formatDateTime(draft.publish.last_published_at)} by ${draft.publish.last_published_by}.`} />
            <label className="eg-field">
              <span>Publish summary</span>
              <input
                className="eg-input"
                onChange={(event) => setPublishSummary(event.target.value)}
                type="text"
                value={publishSummary}
              />
            </label>
            <div className="eg-list">
              {draft.versions
                .slice()
                .sort((left, right) => right.version - left.version)
                .map((version) => (
                  <div className="eg-list__row" key={version.id}>
                    <div>
                      <strong>{`v${version.version}`}</strong>
                      <span>{version.summary}</span>
                    </div>
                    <div className="eg-inline-actions">
                      <StatusBadge status={version.status === "active" ? "healthy" : version.status === "draft" ? "pending" : "subtle"}>
                        {version.status}
                      </StatusBadge>
                      <span className="eg-pill">{version.change_count} changes</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Tag templates" subtitle="Ready-made patterns that accelerate managed tag setup">
          <div className="eg-list">
            {draft.templates.map((template) => (
              <div className="eg-list__row" key={template.key}>
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={template.status === "ready" ? "healthy" : "pending"}>{template.status}</StatusBadge>
                  <button
                    className="eg-button eg-button--compact"
                    onClick={() => addTagFromTemplate(template.key)}
                    type="button"
                  >
                    Add to draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Managed tags" subtitle="Tags connected to triggers, consent and delivery mode">
          <div className="eg-list">
            {draft.tags.map((tag) => (
              <div className="eg-stack" key={tag.id}>
                <div className="eg-list__row">
                  <div>
                    <strong>{tag.name}</strong>
                    <span>{`${tag.template_key} · ${tag.delivery} delivery · ${tag.consent_mode} consent`}</span>
                    <DestinationChips destinations={destinationsQuery.data} selectedIds={tag.destination_ids} />
                  </div>
                  <div className="eg-inline-actions">
                    <StatusBadge status={tag.status === "active" ? "healthy" : tag.status === "paused" ? "warning" : "pending"}>
                      {tag.status}
                    </StatusBadge>
                    <button
                      className="eg-button eg-button--compact"
                      onClick={() => setEditingTagId((current) => current === tag.id ? null : tag.id)}
                      type="button"
                    >
                      {editingTagId === tag.id ? "Hide destinations" : "Choose destinations"}
                    </button>
                    <button
                      className="eg-button eg-button--compact"
                      onClick={() => updateDraft((current) => ({
                        ...current,
                        tags: current.tags.map((item) => (
                          item.id === tag.id
                            ? { ...item, status: item.status === "active" ? "paused" : "active" }
                            : item
                        ))
                      }))}
                      type="button"
                    >
                      {tag.status === "active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      className="eg-button eg-button--compact"
                      onClick={() => updateDraft((current) => ({
                        ...current,
                        tags: current.tags.filter((item) => item.id !== tag.id)
                      }))}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {editingTagId === tag.id ? (
                  <DestinationPicker
                    destinations={destinationsQuery.data}
                    onToggle={(destinationId) => updateDraft((current) => ({
                      ...current,
                      tags: current.tags.map((item) => (
                        item.id === tag.id
                          ? {
                            ...item,
                            destination_ids: item.destination_ids.includes(destinationId)
                              ? item.destination_ids.filter((candidate) => candidate !== destinationId)
                              : [...item.destination_ids, destinationId]
                          }
                          : item
                      ))
                    }))}
                    selectedIds={tag.destination_ids}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <form className="eg-auth-form" onSubmit={handleAddTag}>
            <label className="eg-field">
              <span>Tag name</span>
              <input
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={tagForm.name}
              />
            </label>
            <label className="eg-field">
              <span>Template</span>
              <select
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({
                  ...current,
                  template_key: event.target.value,
                  destination_ids: getSuggestedDestinationIds(event.target.value)
                }))}
                value={tagForm.template_key}
              >
                {draft.templates.map((template) => (
                  <option key={template.key} value={template.key}>{template.name}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Delivery mode</span>
              <select
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({
                  ...current,
                  delivery: event.target.value as TagManagerTag["delivery"]
                }))}
                value={tagForm.delivery}
              >
                <option value="edge">Edge</option>
                <option value="browser">Browser</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Trigger</span>
              <select
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({ ...current, trigger_id: event.target.value }))}
                value={tagForm.trigger_id}
              >
                <option value="">No trigger yet</option>
                {draft.triggers.map((trigger) => (
                  <option key={trigger.id} value={trigger.id}>{trigger.name}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Consent mode</span>
              <select
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({
                  ...current,
                  consent_mode: event.target.value as TagManagerTag["consent_mode"]
                }))}
                value={tagForm.consent_mode}
              >
                <option value="inherit">Inherit</option>
                <option value="analytics">Analytics</option>
                <option value="marketing">Marketing</option>
                <option value="always">Always</option>
              </select>
            </label>
            <div className="eg-field">
              <span>Destinations</span>
              <DestinationPicker
                destinations={destinationsQuery.data}
                onToggle={(destinationId) => setTagForm((current) => ({
                  ...current,
                  destination_ids: current.destination_ids.includes(destinationId)
                    ? current.destination_ids.filter((candidate) => candidate !== destinationId)
                    : [...current.destination_ids, destinationId]
                }))}
                selectedIds={tagForm.destination_ids}
              />
            </div>
            <label className="eg-field">
              <span>Notes</span>
              <textarea
                className="eg-input"
                onChange={(event) => setTagForm((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                value={tagForm.notes}
              />
            </label>
            <button className="eg-button eg-button--primary" type="submit">Add tag</button>
          </form>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Trigger builder" subtitle="Browser and edge conditions that decide when tags should fire">
          <div className="eg-list">
            {draft.triggers.map((trigger) => (
              <div className="eg-list__row" key={trigger.id}>
                <div>
                  <strong>{trigger.name}</strong>
                  <span>{`${trigger.event} · ${trigger.scope} scope · ${trigger.match}`}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={trigger.status === "active" ? "healthy" : trigger.status === "paused" ? "warning" : "pending"}>
                    {trigger.status}
                  </StatusBadge>
                  <button
                    className="eg-button eg-button--compact"
                    onClick={() => updateDraft((current) => ({
                      ...current,
                      triggers: current.triggers.map((item) => (
                        item.id === trigger.id
                          ? { ...item, status: item.status === "active" ? "paused" : "active" }
                          : item
                      ))
                    }))}
                    type="button"
                  >
                    {trigger.status === "active" ? "Pause" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form className="eg-auth-form" onSubmit={handleAddTrigger}>
            <label className="eg-field">
              <span>Trigger name</span>
              <input
                className="eg-input"
                onChange={(event) => setTriggerForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={triggerForm.name}
              />
            </label>
            <label className="eg-field">
              <span>Canonical event</span>
              <input
                className="eg-input"
                onChange={(event) => setTriggerForm((current) => ({ ...current, event: event.target.value }))}
                required
                type="text"
                value={triggerForm.event}
              />
            </label>
            <label className="eg-field">
              <span>Match expression</span>
              <textarea
                className="eg-input"
                onChange={(event) => setTriggerForm((current) => ({ ...current, match: event.target.value }))}
                required
                rows={3}
                value={triggerForm.match}
              />
            </label>
            <label className="eg-field">
              <span>Scope</span>
              <select
                className="eg-input"
                onChange={(event) => setTriggerForm((current) => ({
                  ...current,
                  scope: event.target.value as TagManagerTrigger["scope"]
                }))}
                value={triggerForm.scope}
              >
                <option value="page">Page</option>
                <option value="session">Session</option>
                <option value="user">User</option>
              </select>
            </label>
            <button className="eg-button eg-button--primary" type="submit">Add trigger</button>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Variables" subtitle="Resolved values available to managed tags and routing logic">
          <div className="eg-list">
            {draft.variables.map((variable) => (
              <div className="eg-list__row" key={variable.id}>
                <div>
                  <strong>{variable.name}</strong>
                  <span>{`${variable.kind} · ${variable.scope} · ${variable.source}`}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={variable.status === "active" ? "healthy" : "pending"}>{variable.status}</StatusBadge>
                  <button
                    className="eg-button eg-button--compact"
                    onClick={() => updateDraft((current) => ({
                      ...current,
                      variables: current.variables.filter((item) => item.id !== variable.id)
                    }))}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form className="eg-auth-form" onSubmit={handleAddVariable}>
            <label className="eg-field">
              <span>Variable name</span>
              <input
                className="eg-input"
                onChange={(event) => setVariableForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={variableForm.name}
              />
            </label>
            <label className="eg-field">
              <span>Kind</span>
              <select
                className="eg-input"
                onChange={(event) => setVariableForm((current) => ({
                  ...current,
                  kind: event.target.value as TagManagerVariable["kind"]
                }))}
                value={variableForm.kind}
              >
                <option value="context">Context</option>
                <option value="data_layer">Data layer</option>
                <option value="cookie">Cookie</option>
                <option value="query">Query</option>
                <option value="dom">DOM</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Source</span>
              <input
                className="eg-input"
                onChange={(event) => setVariableForm((current) => ({ ...current, source: event.target.value }))}
                required
                type="text"
                value={variableForm.source}
              />
            </label>
            <label className="eg-field">
              <span>Fallback</span>
              <input
                className="eg-input"
                onChange={(event) => setVariableForm((current) => ({ ...current, fallback: event.target.value }))}
                type="text"
                value={variableForm.fallback}
              />
            </label>
            <label className="eg-field">
              <span>Scope</span>
              <select
                className="eg-input"
                onChange={(event) => setVariableForm((current) => ({
                  ...current,
                  scope: event.target.value as TagManagerVariable["scope"]
                }))}
                value={variableForm.scope}
              >
                <option value="browser">Browser</option>
                <option value="edge">Edge</option>
              </select>
            </label>
            <button className="eg-button eg-button--primary" type="submit">Add variable</button>
          </form>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Script governance" subtitle="Third-party script controls inside the same governance surface">
          <div className="eg-list">
            {draft.script_rules.map((rule) => (
              <div className="eg-list__row" key={rule.id}>
                <div>
                  <strong>{rule.name}</strong>
                  <span>{`${rule.script} · ${rule.placement} · ${rule.strategy}`}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={rule.status === "active" ? "healthy" : rule.status === "blocked" ? "danger" : "pending"}>
                    {rule.status}
                  </StatusBadge>
                  <button
                    className="eg-button eg-button--compact"
                    onClick={() => updateDraft((current) => ({
                      ...current,
                      script_rules: current.script_rules.map((item) => (
                        item.id === rule.id
                          ? { ...item, status: item.status === "active" ? "blocked" : "active" }
                          : item
                      ))
                    }))}
                    type="button"
                  >
                    {rule.status === "active" ? "Block" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form className="eg-auth-form" onSubmit={handleAddScriptRule}>
            <label className="eg-field">
              <span>Script name</span>
              <input
                className="eg-input"
                onChange={(event) => setScriptForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={scriptForm.name}
              />
            </label>
            <label className="eg-field">
              <span>Script URL</span>
              <input
                className="eg-input"
                onChange={(event) => setScriptForm((current) => ({ ...current, script: event.target.value }))}
                required
                type="url"
                value={scriptForm.script}
              />
            </label>
            <label className="eg-field">
              <span>Placement</span>
              <select
                className="eg-input"
                onChange={(event) => setScriptForm((current) => ({
                  ...current,
                  placement: event.target.value as TagManagerScriptRule["placement"]
                }))}
                value={scriptForm.placement}
              >
                <option value="head">Head</option>
                <option value="body-end">Body end</option>
                <option value="event-hook">Event hook</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Strategy</span>
              <select
                className="eg-input"
                onChange={(event) => setScriptForm((current) => ({
                  ...current,
                  strategy: event.target.value as TagManagerScriptRule["strategy"]
                }))}
                value={scriptForm.strategy}
              >
                <option value="lazy">Lazy</option>
                <option value="immediate">Immediate</option>
                <option value="after-consent">After consent</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Consent category</span>
              <select
                className="eg-input"
                onChange={(event) => setScriptForm((current) => ({
                  ...current,
                  consent_category: event.target.value as TagManagerScriptRule["consent_category"]
                }))}
                value={scriptForm.consent_category}
              >
                <option value="inherit">Inherit</option>
                <option value="analytics">Analytics</option>
                <option value="marketing">Marketing</option>
                <option value="functional">Functional</option>
              </select>
            </label>
            <button className="eg-button eg-button--primary" type="submit">Add script rule</button>
          </form>
        </SurfaceCard>

        <SurfaceCard title="Consent firing" subtitle="Default consent posture and enforcement for managed tags">
          <div className="eg-list">
            {draft.consent_rules.map((rule) => (
              <div className="eg-list__row" key={rule.id}>
                <div>
                  <strong>{rule.category}</strong>
                  <span>{`${rule.default_state} by default · ${rule.enforcement} enforcement · ${rule.scope}`}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={rule.default_state === "granted" ? "healthy" : "warning"}>{rule.default_state}</StatusBadge>
                  <button
                    className="eg-button eg-button--compact"
                    onClick={() => updateDraft((current) => ({
                      ...current,
                      consent_rules: current.consent_rules.filter((item) => item.id !== rule.id)
                    }))}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form className="eg-auth-form" onSubmit={handleAddConsentRule}>
            <label className="eg-field">
              <span>Consent category</span>
              <select
                className="eg-input"
                onChange={(event) => setConsentForm((current) => ({
                  ...current,
                  category: event.target.value as TagManagerConsentRule["category"]
                }))}
                value={consentForm.category}
              >
                <option value="analytics">Analytics</option>
                <option value="marketing">Marketing</option>
                <option value="functional">Functional</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Default state</span>
              <select
                className="eg-input"
                onChange={(event) => setConsentForm((current) => ({
                  ...current,
                  default_state: event.target.value as TagManagerConsentRule["default_state"]
                }))}
                value={consentForm.default_state}
              >
                <option value="granted">Granted</option>
                <option value="denied">Denied</option>
                <option value="inherit">Inherit</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Enforcement</span>
              <select
                className="eg-input"
                onChange={(event) => setConsentForm((current) => ({
                  ...current,
                  enforcement: event.target.value as TagManagerConsentRule["enforcement"]
                }))}
                value={consentForm.enforcement}
              >
                <option value="block">Block</option>
                <option value="queue">Queue</option>
                <option value="annotate">Annotate</option>
              </select>
            </label>
            <label className="eg-field">
              <span>Scope note</span>
              <input
                className="eg-input"
                onChange={(event) => setConsentForm((current) => ({ ...current, scope: event.target.value }))}
                type="text"
                value={consentForm.scope}
              />
            </label>
            <button className="eg-button eg-button--primary" type="submit">Save consent rule</button>
          </form>
        </SurfaceCard>
      </section>

      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Management plan" subtitle="Detailed rollout now represented directly in the interface">
          <div className="eg-stack">
            <ActionLine title="1. Templates" text="Ready-made managed templates reduce setup time for standard analytics and ads tags." />
            <ActionLine title="2. Tags" text="Each tag owns delivery mode, trigger links and consent posture inside one canonical control layer." />
            <ActionLine title="3. Triggers" text="Rules are separated from tags so browser or edge firing can be changed without rewriting integrations." />
            <ActionLine title="4. Variables" text="Reusable values can be resolved from browser context, data layer or event payloads." />
            <ActionLine title="5. Script governance" text="Third-party scripts get explicit placement, strategy and consent controls instead of hidden snippets." />
            <ActionLine title="6. Consent firing" text="Consent posture is configured independently and can block, queue or annotate downstream delivery." />
            <ActionLine title="7. Publish workflow" text="Draft and active versions stay separate so configuration changes can be reviewed before release." />
          </div>
        </SurfaceCard>

        <SurfaceCard title="Draft snapshot" subtitle="Current tag manager payload stored by the dashboard">
          <JsonPanel
            value={{
              container_id: draft.container_id,
              install_mode: draft.install_mode,
              publish: draft.publish,
              tags: draft.tags,
              triggers: draft.triggers,
              variables: draft.variables,
              script_rules: draft.script_rules,
              consent_rules: draft.consent_rules
            }}
          />
          <div className="eg-stack">
            <MetricMini label="Tags" value={activeTagCount} />
            <MetricMini label="Triggers" value={activeTriggerCount} />
            <MetricMini label="Scripts" value={activeScriptCount} />
            <MetricMini label="Consent rules" value={governedConsentCount} />
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
          <ActionLine title="Tag manager" text="Control tags, triggers, variables, consent firing and publish workflow from one dashboard module." />
          <ActionLine title="Domains" text="Review verified domains and trusted collection origins." />
          <ActionLine title="API keys" text="Prepare scoped access for debug, routing and operations." />
          <ActionLine title="Members" text="Document team roles until RBAC is fully wired." />
        </div>
      </SurfaceCard>
    </div>
  );
}

function AdminOverviewPage() {
  const overviewQuery = useQuery({
    queryKey: qk.adminOverview(),
    queryFn: dashboardApi.fetchAdminOverview
  });

  if (!overviewQuery.data) {
    return <StateCard title="Loading admin overview" description="Preparing platform-wide totals and recent activity." />;
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Platform Admin"
        description="Global control surface for all users, all sites, platform totals, and privileged operations."
      />
      <section className="eg-metric-grid">
        <MetricCard label="Users" value={overviewQuery.data.totals.users} detail="All dashboard accounts on the platform" />
        <MetricCard label="Admins" value={overviewQuery.data.totals.admins} detail="Global admins with full platform access" />
        <MetricCard label="Blocked users" value={overviewQuery.data.totals.blocked_users} detail="Accounts prevented from signing in" />
        <MetricCard label="Active sessions" value={overviewQuery.data.totals.active_sessions} detail="Currently valid dashboard sessions" />
        <MetricCard label="Sites" value={overviewQuery.data.totals.sites} detail="Tracked sites across the platform" />
        <MetricCard label="Domains" value={overviewQuery.data.totals.domains} detail="Verified origins across all sites" />
        <MetricCard label="API keys" value={overviewQuery.data.totals.api_keys} detail="Collector keys across all sites" />
        <MetricCard label="Collected events" value={overviewQuery.data.totals.collected_events} detail="Accepted browser events stored in D1" />
      </section>
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Recent users" subtitle="Latest platform accounts and their access posture">
          <div className="eg-list">
            {overviewQuery.data.recent_users.map((item) => (
              <div className="eg-list__row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.email}</span>
                </div>
                <div className="eg-inline-actions">
                  <StatusBadge status={item.role === "global_admin" ? "healthy" : "pending"}>{item.role}</StatusBadge>
                  <StatusBadge status={item.status === "active" ? "healthy" : "warning"}>{item.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard title="Recent sites" subtitle="Newest tracked sites visible to the global admin">
          <div className="eg-list">
            {overviewQuery.data.recent_sites.map((item) => (
              <div className="eg-list__row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.org_name} · {item.project_name}</span>
                </div>
                <div className="eg-inline-actions">
                  <span className="eg-pill">{item.environment}</span>
                  <span className="eg-pill">{item.id}</span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const usersQuery = useQuery({
    queryKey: qk.adminUsers(),
    queryFn: dashboardApi.fetchAdminUsers
  });
  const refreshAdminQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.adminUsers() }),
      queryClient.invalidateQueries({ queryKey: qk.adminOverview() })
    ]);
  };
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: { role?: "member" | "global_admin"; status?: "active" | "blocked" } }) =>
      dashboardApi.updateAdminUser(userId, input),
    onSuccess: async () => {
      setError("");
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update user.");
    }
  });
  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) => dashboardApi.updateAdminUserPassword(userId, password),
    onSuccess: async (_, variables) => {
      setPasswordDrafts((current) => ({ ...current, [variables.userId]: "" }));
      setError("");
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to reset password.");
    }
  });
  const deleteUserMutation = useMutation({
    mutationFn: dashboardApi.deleteAdminUser,
    onSuccess: async () => {
      setError("");
      await refreshAdminQueries();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete user.");
    }
  });

  return (
    <div className="eg-page">
      <PageIntro
        title="Users Admin"
        description="Manage all platform users, change passwords, block access, promote admins, and delete accounts."
      />
      {error ? <p className="eg-form-error">{error}</p> : null}
      {!usersQuery.data ? (
        <StateCard title="Loading users" description="Preparing the global user administration list." />
      ) : (
        <section className="eg-stack">
          {usersQuery.data.map((item) => {
            const isCurrentUser = item.id === user?.id;
            const passwordDraft = passwordDrafts[item.id] ?? "";
            return (
              <SurfaceCard key={item.id} title={item.name} subtitle={`${item.email} · ${item.id}`}>
                <div className="eg-admin-user">
                  <div className="eg-admin-user__meta">
                    <ActionLine title="Role" text={item.role} />
                    <ActionLine title="Status" text={item.status} />
                    <ActionLine title="Created" text={formatDateTime(item.created_at)} />
                    <ActionLine title="Last login" text={formatDateTime(item.last_login_at)} />
                    <ActionLine title="Password changed" text={formatDateTime(item.password_changed_at)} />
                    <ActionLine title="Active sessions" text={String(item.session_count)} />
                  </div>
                  <div className="eg-admin-user__actions">
                    <div className="eg-inline-actions">
                      <StatusBadge status={item.role === "global_admin" ? "healthy" : "pending"}>{item.role}</StatusBadge>
                      <StatusBadge status={item.status === "active" ? "healthy" : "warning"}>{item.status}</StatusBadge>
                    </div>
                    <div className="eg-inline-actions">
                      <button
                        className="eg-button eg-button--compact"
                        disabled={updateUserMutation.isPending || isCurrentUser}
                        onClick={() =>
                          updateUserMutation.mutate({
                            userId: item.id,
                            input: { role: item.role === "global_admin" ? "member" : "global_admin" }
                          })}
                        type="button"
                      >
                        {item.role === "global_admin" ? "Demote to member" : "Promote to admin"}
                      </button>
                      <button
                        className="eg-button eg-button--compact"
                        disabled={updateUserMutation.isPending || isCurrentUser}
                        onClick={() =>
                          updateUserMutation.mutate({
                            userId: item.id,
                            input: { status: item.status === "active" ? "blocked" : "active" }
                          })}
                        type="button"
                      >
                        {item.status === "active" ? "Block user" : "Unblock user"}
                      </button>
                      <button
                        className="eg-button eg-button--compact"
                        disabled={deleteUserMutation.isPending || isCurrentUser}
                        onClick={() => deleteUserMutation.mutate(item.id)}
                        type="button"
                      >
                        Delete user
                      </button>
                    </div>
                    <div className="eg-admin-password">
                      <input
                        className="eg-input"
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value
                          }))}
                        placeholder={isCurrentUser ? "Use a separate profile screen later" : "Set a new password"}
                        type="text"
                        value={passwordDraft}
                      />
                      <button
                        className="eg-button eg-button--primary"
                        disabled={updatePasswordMutation.isPending || isCurrentUser || passwordDraft.trim().length < 8}
                        onClick={() => updatePasswordMutation.mutate({ userId: item.id, password: passwordDraft })}
                        type="button"
                      >
                        Reset password
                      </button>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
        </section>
      )}
    </div>
  );
}

function AdminSitesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [siteDraft, setSiteDraft] = useState({
    name: "",
    domain: "",
    org_name: "",
    project_name: "",
    environment: "production"
  });
  const [domainDrafts, setDomainDrafts] = useState<Record<string, string>>({});
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const [keyLabelDrafts, setKeyLabelDrafts] = useState<Record<string, string>>({});
  const sitesQuery = useQuery({
    queryKey: qk.adminSites(),
    queryFn: dashboardApi.fetchAdminSites
  });
  const refreshAdminSites = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.adminSites() }),
      queryClient.invalidateQueries({ queryKey: qk.adminOverview() })
    ]);
  };
  const createDomainMutation = useMutation({
    mutationFn: ({ siteId, input }: { siteId: string; input: { domain: string; description?: string } }) =>
      dashboardApi.createDomainForSite(siteId, input),
    onSuccess: async (_, variables) => {
      setError("");
      setDomainDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      setDescriptionDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to add domain.");
    }
  });
  const deleteDomainMutation = useMutation({
    mutationFn: ({ siteId, domainId }: { siteId: string; domainId: string }) => dashboardApi.deleteDomainForSite(siteId, domainId),
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete domain.");
    }
  });
  const createSiteMutation = useMutation({
    mutationFn: (input: { name: string; domain?: string; org_name?: string; project_name?: string; environment?: string }) =>
      dashboardApi.createAdminSite(input),
    onSuccess: async () => {
      setError("");
      setSiteDraft({
        name: "",
        domain: "",
        org_name: "",
        project_name: "",
        environment: "production"
      });
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create site.");
    }
  });
  const deleteSiteMutation = useMutation({
    mutationFn: dashboardApi.deleteAdminSite,
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete site.");
    }
  });
  const createKeyMutation = useMutation({
    mutationFn: ({ siteId, input }: { siteId: string; input: { label: string } }) => dashboardApi.createAdminSiteKey(siteId, input),
    onSuccess: async (_, variables) => {
      setError("");
      setKeyLabelDrafts((current) => ({ ...current, [variables.siteId]: "" }));
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to create collector key.");
    }
  });
  const revokeKeyMutation = useMutation({
    mutationFn: ({ siteId, keyId }: { siteId: string; keyId: string }) => dashboardApi.revokeAdminSiteKey(siteId, keyId),
    onSuccess: async () => {
      setError("");
      await refreshAdminSites();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to revoke collector key.");
    }
  });

  function handleCreateSiteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    createSiteMutation.mutate({
      name: siteDraft.name.trim(),
      domain: siteDraft.domain.trim() || undefined,
      org_name: siteDraft.org_name.trim() || undefined,
      project_name: siteDraft.project_name.trim() || undefined,
      environment: siteDraft.environment.trim() || undefined
    });
  }

  function handleAdminDomainSubmit(event: FormEvent<HTMLFormElement>, siteId: string) {
    event.preventDefault();
    setError("");
    const domain = (domainDrafts[siteId] ?? "").trim();
    const description = (descriptionDrafts[siteId] ?? "").trim();
    createDomainMutation.mutate({
      siteId,
      input: {
        domain,
        description: description || undefined
      }
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title="Sites Admin"
        description="Inspect all tracked sites, manage their domains, review collector keys, and monitor total event activity."
      />
      {error ? <p className="eg-form-error">{error}</p> : null}
      {!sitesQuery.data ? (
        <StateCard title="Loading sites" description="Fetching the global platform site inventory." />
      ) : (
        <section className="eg-stack">
          <SurfaceCard title="Create site" subtitle="Register a new tracked site with its first collector key and optional primary domain">
            <form className="eg-auth-form" onSubmit={handleCreateSiteSubmit}>
              <div className="eg-grid eg-grid--two">
                <label className="eg-field">
                  <span>Site name</span>
                  <input
                    className="eg-input"
                    onChange={(event) => setSiteDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Main storefront"
                    required
                    type="text"
                    value={siteDraft.name}
                  />
                </label>
                <label className="eg-field">
                  <span>Primary domain</span>
                  <input
                    className="eg-input"
                    onChange={(event) => setSiteDraft((current) => ({ ...current, domain: event.target.value }))}
                    placeholder="store.example.com"
                    type="text"
                    value={siteDraft.domain}
                  />
                </label>
                <label className="eg-field">
                  <span>Organization</span>
                  <input
                    className="eg-input"
                    onChange={(event) => setSiteDraft((current) => ({ ...current, org_name: event.target.value }))}
                    placeholder="Open Commerce Lab"
                    type="text"
                    value={siteDraft.org_name}
                  />
                </label>
                <label className="eg-field">
                  <span>Project</span>
                  <input
                    className="eg-input"
                    onChange={(event) => setSiteDraft((current) => ({ ...current, project_name: event.target.value }))}
                    placeholder="Events Core"
                    type="text"
                    value={siteDraft.project_name}
                  />
                </label>
              </div>
              <label className="eg-field">
                <span>Environment</span>
                <input
                  className="eg-input"
                  onChange={(event) => setSiteDraft((current) => ({ ...current, environment: event.target.value }))}
                  placeholder="production"
                  type="text"
                  value={siteDraft.environment}
                />
              </label>
              <button
                className="eg-button eg-button--primary"
                disabled={createSiteMutation.isPending || siteDraft.name.trim().length < 2}
                type="submit"
              >
                {createSiteMutation.isPending ? "Creating site..." : "Create site"}
              </button>
            </form>
          </SurfaceCard>
          {sitesQuery.data.map((site) => (
            <SurfaceCard key={site.id} title={site.name} subtitle={`${site.org_name} · ${site.project_name} · ${site.id}`}>
              <div className="eg-admin-site">
                <div className="eg-inline-actions">
                  <span className="eg-pill is-mono">{site.collector_url}</span>
                  {site.id === currentContext.siteId ? (
                    <span className="eg-pill">Primary site</span>
                  ) : (
                    <button
                      className="eg-button eg-button--compact"
                      disabled={deleteSiteMutation.isPending}
                      onClick={() => deleteSiteMutation.mutate(site.id)}
                      type="button"
                    >
                      Delete site
                    </button>
                  )}
                </div>
                <div className="eg-admin-site__meta">
                  <MetricMini label="Environment" value={site.environment} />
                  <MetricMini label="Domains" value={site.domain_count} />
                  <MetricMini label="API keys" value={site.api_key_count} />
                  <MetricMini label="Events" value={site.collected_event_count} />
                  <MetricMini label="Last event" value={formatDateTime(site.last_event_at)} />
                </div>
                <div className="eg-grid eg-grid--two">
                  <div className="eg-admin-panel">
                    <strong>Verified domains</strong>
                    <div className="eg-list">
                      {site.domains.map((domain) => (
                        <div className="eg-list__row" key={domain.id}>
                          <div>
                            <strong>{domain.domain}</strong>
                            <span>{domain.description ?? domain.kind}</span>
                          </div>
                          <div className="eg-inline-actions">
                            <StatusBadge status={domain.status === "verified" || domain.status === "internal" ? "healthy" : "pending"}>
                              {domain.status}
                            </StatusBadge>
                            {domain.domain !== "goldring.ro" && domain.domain !== "www.goldring.ro" ? (
                              <button
                                className="eg-button eg-button--compact"
                                disabled={deleteDomainMutation.isPending}
                                onClick={() => deleteDomainMutation.mutate({ siteId: site.id, domainId: domain.id })}
                                type="button"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="eg-pill">Protected</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form className="eg-auth-form" onSubmit={(event) => handleAdminDomainSubmit(event, site.id)}>
                      <label className="eg-field">
                        <span>Add domain</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setDomainDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="shop.example.com"
                          required
                          type="text"
                          value={domainDrafts[site.id] ?? ""}
                        />
                      </label>
                      <label className="eg-field">
                        <span>Description</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setDescriptionDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="Regional storefront"
                          type="text"
                          value={descriptionDrafts[site.id] ?? ""}
                        />
                      </label>
                      <button
                        className="eg-button eg-button--primary"
                        disabled={createDomainMutation.isPending || (domainDrafts[site.id] ?? "").trim().length === 0}
                        type="submit"
                      >
                        {createDomainMutation.isPending ? "Saving domain..." : "Add domain"}
                      </button>
                    </form>
                  </div>
                  <div className="eg-admin-panel">
                    <strong>Collector keys</strong>
                    <div className="eg-list">
                      {site.api_keys.map((item) => {
                        const activeKeyCount = site.api_keys.filter((key) => key.status === "active").length;
                        return (
                          <div className="eg-list__row" key={item.id}>
                            <div>
                              <strong>{item.label}</strong>
                              <span>{item.public_key}</span>
                            </div>
                            <div className="eg-inline-actions">
                              <StatusBadge status={item.status === "active" ? "healthy" : "warning"}>{item.status}</StatusBadge>
                              <span className="eg-pill">{item.last_used_at ? formatDateTime(item.last_used_at) : "Not used yet"}</span>
                              {item.status === "active" ? (
                                <button
                                  className="eg-button eg-button--compact"
                                  disabled={revokeKeyMutation.isPending || activeKeyCount <= 1}
                                  onClick={() => revokeKeyMutation.mutate({ siteId: site.id, keyId: item.id })}
                                  type="button"
                                >
                                  Revoke key
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <form
                      className="eg-auth-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setError("");
                        createKeyMutation.mutate({
                          siteId: site.id,
                          input: { label: (keyLabelDrafts[site.id] ?? "").trim() }
                        });
                      }}
                    >
                      <label className="eg-field">
                        <span>New key label</span>
                        <input
                          className="eg-input"
                          onChange={(event) =>
                            setKeyLabelDrafts((current) => ({
                              ...current,
                              [site.id]: event.target.value
                            }))}
                          placeholder="Regional browser key"
                          required
                          type="text"
                          value={keyLabelDrafts[site.id] ?? ""}
                        />
                      </label>
                      <button
                        className="eg-button eg-button--primary"
                        disabled={createKeyMutation.isPending || (keyLabelDrafts[site.id] ?? "").trim().length < 2}
                        type="submit"
                      >
                        {createKeyMutation.isPending ? "Creating key..." : "Create collector key"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </section>
      )}
    </div>
  );
}

function RouteDetailPage() {
  const { routeId = "" } = useParams();
  const queryClient = useQueryClient();
  const routeQuery = useQuery({
    queryKey: qk.route(currentContext.siteId, routeId),
    queryFn: () => dashboardApi.fetchRouteDetail(routeId),
    enabled: Boolean(routeId)
  });
  const destinationsQuery = useQuery({
    queryKey: qk.destinations(currentContext.siteId),
    queryFn: dashboardApi.fetchDestinations
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [routeDestinations, setRouteDestinations] = useState<DashboardRoute["destinations"]>([]);
  const [routeMatch, setRouteMatch] = useState<DashboardRoute["match"]>({});
  const [eventTypesInput, setEventTypesInput] = useState("");

  useEffect(() => {
    if (!routeQuery.data) return;
    setRouteDestinations(routeQuery.data.destinations);
    setRouteMatch(routeQuery.data.match);
    setEventTypesInput((routeQuery.data.match.event_types ?? []).join(", "));
  }, [routeQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (input: RouteUpdateInput) => dashboardApi.updateRoute(routeId, input),
    onSuccess: async () => {
      setNotice("Route definition updated from the visual editor.");
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.route(currentContext.siteId, routeId) }),
        queryClient.invalidateQueries({ queryKey: qk.routes(currentContext.siteId) })
      ]);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update route destinations.");
    }
  });

  if (!routeQuery.data) {
    return <StateCard title="Loading route detail" description="Fetching route definition, conditions and destinations." />;
  }

  function toggleRouteDestination(destinationId: string) {
    setRouteDestinations((current) => {
      const existing = current.find((destination) => destination.destination_id === destinationId);
      if (existing) {
        return current.filter((destination) => destination.destination_id !== destinationId);
      }

      return [
        ...current,
        {
          destination_id: destinationId,
          delivery_mode: "queued",
          enabled: true
        }
      ];
    });
  }

  function buildRouteMatch(nextPatch?: Partial<DashboardRoute["match"]>) {
    const baseMatch = {
      ...routeMatch,
      event_types: parseEventTypesInput(eventTypesInput)
    };
    return {
      ...baseMatch,
      ...(nextPatch ?? {})
    };
  }

  return (
    <div className="eg-page">
      <PageIntro title={routeQuery.data.name} description={routeQuery.data.description ?? "Detailed route definition."} />
      {notice ? <StateCard compact title="Route updated" description={notice} /> : null}
      {error ? <StateCard compact title="Route error" description={error} /> : null}
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
        <SurfaceCard title="Destinations" subtitle="Choose the live destinations that this route should fan out to">
          <div className="eg-stack">
            <DestinationChips
              destinations={destinationsQuery.data}
              selectedIds={routeDestinations.map((destination) => destination.destination_id)}
            />
            <DestinationPicker
              destinations={destinationsQuery.data}
              onToggle={toggleRouteDestination}
              selectedIds={routeDestinations.map((destination) => destination.destination_id)}
            />
            {!routeDestinations.length ? (
              <StateCard compact title="No destinations selected" description="Choose at least one destination so this route can deliver somewhere." />
            ) : (
              <div className="eg-list">
                {routeDestinations.map((destination) => (
                  <div className="eg-list__row" key={destination.destination_id}>
                    <div>
                      <strong>{getDestinationNames([destination.destination_id], destinationsQuery.data)[0]}</strong>
                      <span>{destination.destination_id}</span>
                    </div>
                    <div className="eg-inline-actions">
                      <select
                        className="eg-input"
                        onChange={(event) => setRouteDestinations((current) => current.map((item) => (
                          item.destination_id === destination.destination_id
                            ? { ...item, delivery_mode: event.target.value as DashboardRoute["destinations"][number]["delivery_mode"] }
                            : item
                        )))}
                        value={destination.delivery_mode}
                      >
                        <option value="queued">Queued</option>
                        <option value="realtime">Realtime</option>
                        <option value="batch">Batch</option>
                      </select>
                      <button
                        className="eg-button eg-button--compact"
                        onClick={() => setRouteDestinations((current) => current.map((item) => (
                          item.destination_id === destination.destination_id
                            ? { ...item, enabled: !item.enabled }
                            : item
                        )))}
                        type="button"
                      >
                        {destination.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="eg-button eg-button--primary" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate({ destinations: routeDestinations, match: buildRouteMatch() })} type="button">
              {saveMutation.isPending ? "Saving route..." : "Save route destinations"}
            </button>
          </div>
        </SurfaceCard>
      </section>
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Match builder" subtitle="Define event families and conditions without editing raw JSON">
          <div className="eg-stack">
            <label className="eg-field">
              <span>Event types</span>
              <input
                className="eg-input"
                onChange={(event) => setEventTypesInput(event.target.value)}
                placeholder="Purchase, Lead, PageView"
                type="text"
                value={eventTypesInput}
              />
            </label>
            {renderConditionGroupEditor({
              title: "All conditions",
              conditions: routeMatch.all,
              onChange: (next) => setRouteMatch((current) => ({ ...current, all: next.filter((item) => item.path.trim()) }))
            })}
            {renderConditionGroupEditor({
              title: "Any conditions",
              conditions: routeMatch.any,
              onChange: (next) => setRouteMatch((current) => ({ ...current, any: next.filter((item) => item.path.trim()) }))
            })}
            {renderConditionGroupEditor({
              title: "None conditions",
              conditions: routeMatch.none,
              onChange: (next) => setRouteMatch((current) => ({ ...current, none: next.filter((item) => item.path.trim()) }))
            })}
            <button
              className="eg-button eg-button--primary"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate({ destinations: routeDestinations, match: buildRouteMatch() })}
              type="button"
            >
              {saveMutation.isPending ? "Saving match..." : "Save match and destinations"}
            </button>
          </div>
        </SurfaceCard>
        <SurfaceCard title="Match JSON" subtitle="Current route condition tree after the visual editor">
          <JsonPanel value={buildRouteMatch()} />
        </SurfaceCard>
      </section>
    </div>
  );
}

function TransformationDetailPage() {
  const { transformId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const transformationQuery = useQuery({
    queryKey: qk.transformation(currentContext.siteId, transformId),
    queryFn: () => dashboardApi.fetchTransformationDetail(transformId),
    enabled: Boolean(transformId)
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [destinationKind, setDestinationKind] = useState<DestinationCreateInput["kind"]>("facebook-pixel");
  const [status, setStatus] = useState<"active" | "draft">("draft");
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([{ key: "", value: "" }]);
  const [mappingText, setMappingText] = useState("{}");
  const [mappingError, setMappingError] = useState("");

  useEffect(() => {
    if (!transformationQuery.data) return;
    setName(transformationQuery.data.name);
    setDestinationKind(transformationQuery.data.destination_kind);
    setStatus(transformationQuery.data.status);
    setMappingRows(mappingToRows(transformationQuery.data.mapping));
    setMappingText(JSON.stringify(transformationQuery.data.mapping, null, 2));
    setMappingError("");
  }, [transformationQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (input: { name: string; destination_kind: DestinationCreateInput["kind"]; status: "active" | "draft"; mapping: Record<string, unknown> }) =>
      dashboardApi.updateTransformation(transformId, input),
    onSuccess: async (transformation) => {
      setNotice(`Transformation ${transformation.name} saved.`);
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.transformations(currentContext.siteId) }),
        queryClient.invalidateQueries({ queryKey: qk.transformation(currentContext.siteId, transformId) })
      ]);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to save transformation.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => dashboardApi.deleteTransformation(transformId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.transformations(currentContext.siteId) });
      navigate(sitePath("transformations"));
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete transformation.");
    }
  });

  if (!transformationQuery.data) {
    return <StateCard title="Loading transformation" description="Fetching mapping definition and version metadata." />;
  }

  function handleMappingRowChange(nextRows: MappingRow[]) {
    setMappingRows(nextRows);
    setMappingText(JSON.stringify(rowsToMapping(nextRows), null, 2));
    setMappingError("");
  }

  function handleMappingTextChange(value: string) {
    setMappingText(value);
    try {
      const parsed = value.trim() ? JSON.parse(value) as Record<string, unknown> : {};
      setMappingRows(mappingToRows(parsed));
      setMappingError("");
    } catch {
      setMappingError("Mapping JSON must be valid.");
    }
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let mapping: Record<string, unknown> = {};
    try {
      mapping = mappingText.trim() ? JSON.parse(mappingText) as Record<string, unknown> : {};
      setMappingError("");
    } catch {
      setMappingError("Mapping JSON must be valid.");
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      destination_kind: destinationKind,
      status,
      mapping
    });
  }

  return (
    <div className="eg-page">
      <PageIntro
        title={transformationQuery.data.name}
        description="Destination payload mapping and version metadata."
        action={(
          <button className="eg-button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()} type="button">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        )}
      />
      {notice ? <StateCard compact title="Transformation updated" description={notice} /> : null}
      {error ? <StateCard compact title="Transformation error" description={error} /> : null}
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Transformation meta" subtitle="Kind, status and version">
          <div className="eg-stack">
            <ActionLine title="Destination kind" text={transformationQuery.data.destination_kind} />
            <ActionLine title="Version" text={`v${transformationQuery.data.version}`} />
            <ActionLine title="Status" text={transformationQuery.data.status} />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Edit transformation" subtitle="Adjust mapping and versioned status for this transformation">
          <form className="eg-auth-form" onSubmit={handleSave}>
            <label className="eg-field">
              <span>Name</span>
              <input className="eg-input" onChange={(event) => setName(event.target.value)} type="text" value={name} />
            </label>
            <label className="eg-field">
              <span>Destination kind</span>
              <select className="eg-input" onChange={(event) => setDestinationKind(event.target.value as DestinationCreateInput["kind"])} value={destinationKind}>
                {DESTINATION_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Status</span>
              <select className="eg-input" onChange={(event) => setStatus(event.target.value as "active" | "draft")} value={status}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
            <div className="eg-stack">
              <strong>Mapping fields</strong>
              {mappingRows.map((row, index) => (
                <div className="eg-grid eg-grid--two" key={`mapping-edit-${index}`}>
                  <label className="eg-field">
                    <span>Destination field</span>
                    <input
                      className="eg-input"
                      onChange={(event) => handleMappingRowChange(mappingRows.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))}
                      type="text"
                      value={row.key}
                    />
                  </label>
                  <label className="eg-field">
                    <span>Event source</span>
                    <input
                      className="eg-input"
                      onChange={(event) => handleMappingRowChange(mappingRows.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))}
                      type="text"
                      value={row.value}
                    />
                  </label>
                </div>
              ))}
              <div className="eg-inline-actions">
                <button className="eg-button eg-button--compact" onClick={() => handleMappingRowChange([...mappingRows, { key: "", value: "" }])} type="button">
                  Add mapping row
                </button>
              </div>
              <label className="eg-field">
                <span>Advanced mapping JSON</span>
                <textarea className="eg-input" onChange={(event) => handleMappingTextChange(event.target.value)} rows={10} value={mappingText} />
              </label>
              {mappingError ? <p className="eg-form-error">{mappingError}</p> : null}
            </div>
            <button className="eg-button eg-button--primary" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? "Saving..." : "Save transformation"}
            </button>
          </form>
        </SurfaceCard>
      </section>
      <SurfaceCard title="Mapping preview" subtitle="Current transformation payload mapping">
        <JsonPanel value={mappingRows.length ? rowsToMapping(mappingRows) : transformationQuery.data.mapping} />
      </SurfaceCard>
    </div>
  );
}

function DestinationDetailPage() {
  const { destinationId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const destinationQuery = useQuery({
    queryKey: qk.destination(currentContext.siteId, destinationId),
    queryFn: () => dashboardApi.fetchDestinationDetail(destinationId),
    enabled: Boolean(destinationId)
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("facebook-pixel");
  const [status, setStatus] = useState("active");
  const [configDraft, setConfigDraft] = useState<Record<string, unknown>>(getDefaultDestinationConfig("facebook-pixel"));
  const [configText, setConfigText] = useState(stringifyDestinationConfig(getDefaultDestinationConfig("facebook-pixel")));
  const [configTextError, setConfigTextError] = useState("");

  useEffect(() => {
    if (!destinationQuery.data) return;
    setName(destinationQuery.data.name);
    setKind(destinationQuery.data.kind);
    setStatus(destinationQuery.data.status);
    setConfigDraft(destinationQuery.data.config);
    setConfigText(stringifyDestinationConfig(destinationQuery.data.config));
    setConfigTextError("");
  }, [destinationQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (input: { name: string; kind: string; status: string; config: Record<string, unknown> }) =>
      dashboardApi.updateDestination(destinationId, input),
    onSuccess: async (destination) => {
      setNotice(`Destination ${destination.name} saved.`);
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.destinations(currentContext.siteId) }),
        queryClient.invalidateQueries({ queryKey: qk.destination(currentContext.siteId, destinationId) })
      ]);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to save destination.");
    }
  });

  const testMutation = useMutation({
    mutationFn: () => dashboardApi.testDestination(destinationId),
    onSuccess: (result) => {
      setNotice(result.message);
      setError("");
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to test destination.");
    }
  });

  const rotateMutation = useMutation({
    mutationFn: () => dashboardApi.rotateDestinationSecret(destinationId),
    onSuccess: async (destination) => {
      setNotice(`Secret preview rotated for ${destination.name}.`);
      setError("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qk.destinations(currentContext.siteId) }),
        queryClient.invalidateQueries({ queryKey: qk.destination(currentContext.siteId, destinationId) })
      ]);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to rotate secret.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => dashboardApi.deleteDestination(destinationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.destinations(currentContext.siteId) });
      navigate(sitePath("destinations"));
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to delete destination.");
    }
  });

  if (!destinationQuery.data) {
    return <StateCard title="Loading destination" description="Fetching destination configuration and secret posture." />;
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let parsedConfig: Record<string, unknown> = {};
    try {
      parsedConfig = parseDestinationConfigText(configText);
      setConfigTextError("");
    } catch {
      setConfigTextError("Destination config must be valid JSON.");
      return;
    }

    saveMutation.mutate({
      name,
      kind,
      status,
      config: parsedConfig
    });
  }

  function handleKindChange(nextKind: string) {
    const defaultConfig = getDefaultDestinationConfig(nextKind);
    setKind(nextKind);
    setConfigDraft(defaultConfig);
    setConfigText(stringifyDestinationConfig(defaultConfig));
    setConfigTextError("");
  }

  function handleConfigFieldChange(key: string, value: string) {
    setConfigDraft((current) => {
      const nextConfig = updateDestinationConfigValue(current, key, value);
      setConfigText(stringifyDestinationConfig(nextConfig));
      setConfigTextError("");
      return nextConfig;
    });
  }

  function handleConfigTextChange(value: string) {
    setConfigText(value);
    try {
      const parsed = parseDestinationConfigText(value);
      setConfigDraft(parsed);
      setConfigTextError("");
    } catch {
      setConfigTextError("Destination config must be valid JSON.");
    }
  }

  return (
    <div className="eg-page">
      <PageIntro
        title={destinationQuery.data.name}
        description="Destination credentials, config and operational posture."
        action={(
          <div className="eg-actions">
            <button className="eg-button" disabled={testMutation.isPending} onClick={() => testMutation.mutate()} type="button">
              {testMutation.isPending ? "Testing..." : "Test destination"}
            </button>
            <button className="eg-button" disabled={rotateMutation.isPending} onClick={() => rotateMutation.mutate()} type="button">
              {rotateMutation.isPending ? "Rotating..." : "Rotate secret"}
            </button>
            <button className="eg-button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate()} type="button">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      />
      {notice ? <StateCard compact title="Destination status" description={notice} /> : null}
      {error ? <StateCard compact title="Destination error" description={error} /> : null}
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Connection" subtitle="Runtime configuration currently attached to this target">
          <div className="eg-stack">
            <ActionLine title="Kind" text={destinationQuery.data.kind} />
            <ActionLine title="Status" text={destinationQuery.data.status} />
            <ActionLine title="Secret preview" text={destinationQuery.data.secret_preview} />
          </div>
        </SurfaceCard>
        <SurfaceCard title="Edit destination" subtitle="Choose the vendor and edit the runtime config stored in the control panel">
          <form className="eg-auth-form" onSubmit={handleSave}>
            <label className="eg-field">
              <span>Name</span>
              <input className="eg-input" onChange={(event) => setName(event.target.value)} type="text" value={name} />
            </label>
            <label className="eg-field">
              <span>Kind</span>
              <select className="eg-input" onChange={(event) => handleKindChange(event.target.value)} value={kind}>
                {DESTINATION_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="eg-field">
              <span>Status</span>
              <select className="eg-input" onChange={(event) => setStatus(event.target.value)} value={status}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <DestinationConfigEditor
              config={configDraft}
              configText={configText}
              configTextError={configTextError}
              kind={kind}
              onConfigTextChange={handleConfigTextChange}
              onFieldChange={handleConfigFieldChange}
            />
            <button className="eg-button eg-button--primary" disabled={saveMutation.isPending} type="submit">
              {saveMutation.isPending ? "Saving..." : "Save destination"}
            </button>
          </form>
        </SurfaceCard>
      </section>
      <section className="eg-grid eg-grid--two">
        <SurfaceCard title="Raw config" subtitle="Stored destination configuration snapshot">
          <JsonPanel value={configDraft} />
        </SurfaceCard>
        <SurfaceCard title="Vendor hints" subtitle="Suggested configuration fields for the selected destination kind">
          <JsonPanel value={getDefaultDestinationConfig(kind)} />
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
  versions,
  destinations
}: {
  routes: Awaited<ReturnType<typeof dashboardApi.fetchRoutes>>["routes"];
  versions: Awaited<ReturnType<typeof dashboardApi.fetchRoutes>>["versions"];
  destinations: DashboardDestination[] | undefined;
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
              <NavLink className="eg-inline-link" to={sitePath(`routing/routes/${route.id}`)}>
                {route.name}
              </NavLink>
              <small>{route.description}</small>
            </span>
            <span className="eg-table__cell" data-label="Priority">{route.priority}</span>
            <span className="eg-table__cell" data-label="Environment">{route.environment}</span>
            <span className="eg-table__cell" data-label="Destinations">
              <DestinationChips
                destinations={destinations}
                selectedIds={route.destinations.filter((destination) => destination.enabled).map((destination) => destination.destination_id)}
              />
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

function formatDateTime(value?: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
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
  const { isReady, user } = useAuth();

  if (!isReady) {
    return (
      <div className="eg-auth-shell">
        <StateCard title="Loading dashboard" description="Checking authentication state before the interface is rendered." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={user ? sitePath("overview") : "/login"} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/app/orgs/:orgId/projects/:projectId/sites/:siteId" element={<ProtectedAppShell />}>
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
        <Route path="settings/tag-manager" element={<TagManagerPage />} />
        <Route path="settings/domains" element={<DomainsPage />} />
        <Route path="settings/api-keys" element={<ApiKeysPage />} />
        <Route path="settings/members" element={<MembersPage />} />
        <Route path="settings/general" element={<SettingsPage />} />
        <Route element={<ProtectedAdminOutlet />}>
          <Route path="admin/overview" element={<AdminOverviewPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/sites" element={<AdminSitesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to={user ? sitePath("overview") : "/login"} />} />
    </Routes>
  );
}
