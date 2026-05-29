import {
  createDestination,
  createRoute,
  createTransformation,
  deleteDestination,
  deleteRoute,
  deleteTransformation,
  duplicateRoute,
  getCompiledRouting,
  getConsent,
  getDestination,
  getEvent,
  getInstallConfig,
  getJourneys,
  getOverview,
  getRealtime,
  getRoute,
  getTransformation,
  listDeliveries,
  listDestinations,
  listEvents,
  listRouteVersions,
  listRoutes,
  listSchemas,
  listTransformations,
  listUsers,
  publishRoutes,
  rollbackRoutes,
  rotateDestinationSecret,
  simulateRoute,
  testDestination,
  updateDestination,
  updateTransformation,
  updateRoute,
  validateEvent
} from "../../../packages/platform-data/src/index";
import {
  acceptSiteInvite,
  addSiteDomain,
  adminSetUserPassword,
  backfillAttributionJob,
  createSiteInvite,
  createAdminSite,
  createAdminSiteKey,
  requestUserPasswordReset,
  createSiteDestination,
  createUserSession,
  deleteAdminSite,
  deleteAdminUser,
  deleteSiteDomain,
  deleteSiteDestination,
  ensureControlPlane,
  exportRawJob,
  getAdminOverview,
  getBootstrap,
  getInstallConfigFromDb,
  getOperationJob,
  getOperationsHealth,
  getOperationsQueues,
  getSiteAccess,
  getSiteCompiledRouting,
  getSiteMembersPayload,
  getSiteDestination,
  getSiteRoute,
  getSiteTransformation,
  getSessionByToken,
  listAdminSites,
  listAdminUsers,
  listOperationJobs,
  listOperationsDlq,
  listSiteDestinations,
  listSiteDomains,
  listSiteKeys,
  listSiteRoutes,
  listSiteRouteVersions,
  listSiteTransformations,
  loginUserSession,
  flushPendingDeliveries,
  publishSiteRoutes,
  replayCollectedEvent,
  replayDlqOperations,
  resetUserPasswordWithToken,
  revokeSession,
  revokeAdminSiteKey,
  revokeSiteInvite,
  rollbackSiteRoutes,
  rotateSiteDestinationSecret,
  simulateSiteRoute,
  testSiteDestination,
  createSiteRoute,
  deleteSiteMembership,
  updateSiteRoute,
  deleteSiteRoute,
  duplicateSiteRoute,
  createSiteTransformation,
  updateSiteTransformation,
  deleteSiteTransformation,
  updateSiteDestination,
  updateAdminUser,
  updateSiteMembershipRole,
  updateMyProfile
} from "../../../packages/runtime/src/control-plane";
import {
  createSiteBillingCheckoutSession,
  createSiteBillingPortalSession,
  getAdminBillingOverview,
  getSiteBillingSummary,
  issueAdminInvoice,
  listAdminBillingSubscriptions,
  listAdminBillingTransactions,
  listSiteBillingInvoices,
  processStripeWebhook,
  updateAdminBillingSubscription
} from "../../../packages/runtime/src/billing";
import {
  createRequestContext,
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
import type { EventGatewayEvent, EventRoute } from "../../../packages/schemas/src/index";
import type { DateRangePreset } from "../../../packages/shared/src/index";

type MutableRoute = Omit<EventRoute, "id" | "site_id">;

type TurnstileVerificationResult = {
  success?: boolean;
  "error-codes"?: string[];
};

type CaptchaProvider = "turnstile" | "recaptcha" | "hcaptcha";

function siteIdFromSegments(segments: string[]) {
  return segments[2];
}

function authTokenFromRequest(request: Request) {
  return request.headers.get("x-api-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}

function clientIpFromRequest(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
}

function resolveCaptchaProvider(env: Pick<EnvironmentBindings, "CAPTCHA_PROVIDER"> | undefined): CaptchaProvider {
  const provider = env?.CAPTCHA_PROVIDER?.trim().toLowerCase();
  if (provider === "recaptcha" || provider === "hcaptcha") {
    return provider;
  }
  return "turnstile";
}

function resolveCaptchaSecret(env: Pick<EnvironmentBindings, "CAPTCHA_SECRET_KEY" | "TURNSTILE_SECRET_KEY"> | undefined) {
  return env?.CAPTCHA_SECRET_KEY?.trim() || env?.TURNSTILE_SECRET_KEY?.trim() || "";
}

function resolveCaptchaSiteKey(env: Pick<EnvironmentBindings, "CAPTCHA_SITE_KEY" | "TURNSTILE_SITE_KEY"> | undefined) {
  return env?.CAPTCHA_SITE_KEY?.trim() || env?.TURNSTILE_SITE_KEY?.trim() || "";
}

function captchaVerifyEndpoint(provider: CaptchaProvider) {
  if (provider === "recaptcha") {
    return "https://www.google.com/recaptcha/api/siteverify";
  }
  if (provider === "hcaptcha") {
    return "https://hcaptcha.com/siteverify";
  }
  return "https://challenges.cloudflare.com/turnstile/v0/siteverify";
}

async function verifyCaptchaToken(
  request: Request,
  env: Pick<EnvironmentBindings, "CAPTCHA_PROVIDER" | "CAPTCHA_SECRET_KEY" | "TURNSTILE_SECRET_KEY"> | undefined,
  token: string
) {
  const secret = resolveCaptchaSecret(env);
  if (!secret) {
    throw new Error("Captcha verification is not configured for this deployment.");
  }

  const responseToken = token.trim();
  if (!responseToken) {
    throw new Error("Complete the captcha challenge before submitting the form.");
  }

  const body = new URLSearchParams({
    secret,
    response: responseToken
  });
  const remoteIp = clientIpFromRequest(request);
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const verificationResponse = await fetch(captchaVerifyEndpoint(resolveCaptchaProvider(env)), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!verificationResponse.ok) {
    throw new Error("Captcha verification is temporarily unavailable.");
  }

  const verification = await verificationResponse.json() as TurnstileVerificationResult;
  if (!verification.success) {
    throw new Error("Captcha verification failed. Please try again.");
  }
}

async function authorizeRequest(request: Request, env: EnvironmentBindings | undefined) {
  const token = authTokenFromRequest(request);
  if (!token) return null;
  if (env?.API_TOKEN && token === env.API_TOKEN) {
    return { kind: "api_token" as const };
  }

  if (!env?.DB) return null;
  const session = await getSessionByToken(env.DB, token);
  if (!session) return null;

  return {
    kind: "session" as const,
    ...session
  };
}

function requireSessionAuthorization(
  context: ReturnType<typeof createRequestContext>,
  authorization: Awaited<ReturnType<typeof authorizeRequest>>
) {
  if (!authorization || authorization.kind !== "session") {
    return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
  }

  return null;
}

function requireGlobalAdmin(
  context: ReturnType<typeof createRequestContext>,
  authorization: Awaited<ReturnType<typeof authorizeRequest>>
) {
  const unauthorized = requireSessionAuthorization(context, authorization);
  if (unauthorized) {
    return unauthorized;
  }

  if (!authorization || authorization.kind !== "session") {
    return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
  }

  if (authorization.user.role !== "global_admin") {
    return errorResponse(context, "forbidden", "Global admin access is required.", 403);
  }

  return null;
}

export async function handleApiRequest(request: Request, env?: EnvironmentBindings) {
  const context = createRequestContext(request);
  const optionsResponse = withOptions(context);
  if (optionsResponse) return optionsResponse;

  if (env?.DB) {
    await ensureControlPlane(env.DB);
  }

  const segments = pathSegments(context);
  const method = context.method;

  if (segments.length === 1 && segments[0] === "health") {
    const methodResponse = ensureMethod(context, ["GET"]);
    if (methodResponse) return methodResponse;
    return json(context, { service: "api-worker", status: "healthy" });
  }

  if (segments[0] === "v1" && segments[1] === "billing" && segments[2] === "stripe-webhook") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    const methodResponse = ensureMethod(context, ["POST"]);
    if (methodResponse) return methodResponse;

    try {
      const signatureHeader = request.headers.get("stripe-signature") || "";
      const payload = await request.text();
      const result = await processStripeWebhook(env.DB, env, signatureHeader, payload);
      return json(context, result);
    } catch (error) {
      return errorResponse(context, "stripe_webhook_failed", error instanceof Error ? error.message : "Unable to process Stripe webhook.", 400);
    }
  }

  if (segments[0] === "v1" && segments[1] === "auth") {
    if (segments[2] === "captcha-config" && method === "GET") {
      return json(context, {
        provider: resolveCaptchaProvider(env),
        site_key: resolveCaptchaSiteKey(env)
      });
    }

    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    if (segments[2] === "register" && method === "POST") {
      try {
        const body = await readJson<{ name: string; email: string; password: string; captcha_token?: string; turnstile_token?: string }>(request);
        await verifyCaptchaToken(request, env, body.captcha_token || body.turnstile_token || "");
        const result = await createUserSession(env.DB, env, body);
        return json(context, result, { status: 201 });
      } catch (error) {
        return errorResponse(context, "register_failed", error instanceof Error ? error.message : "Register failed.", 400);
      }
    }

    if (segments[2] === "login" && method === "POST") {
      try {
        const body = await readJson<{ email: string; password: string; captcha_token?: string; turnstile_token?: string }>(request);
        await verifyCaptchaToken(request, env, body.captcha_token || body.turnstile_token || "");
        const result = await loginUserSession(env.DB, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(context, "login_failed", error instanceof Error ? error.message : "Login failed.", 401);
      }
    }

    if (segments[2] === "logout" && method === "POST") {
      const token = authTokenFromRequest(request);
      if (token) {
        await revokeSession(env.DB, token);
      }
      return json(context, { logged_out: true });
    }

    if (segments[2] === "forgot-password" && method === "POST") {
      try {
        const body = await readJson<{ email: string; captcha_token?: string; turnstile_token?: string }>(request);
        await verifyCaptchaToken(request, env, body.captcha_token || body.turnstile_token || "");
        const result = await requestUserPasswordReset(env.DB, env, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(
          context,
          "password_reset_request_failed",
          error instanceof Error ? error.message : "Unable to request password reset.",
          400
        );
      }
    }

    if (segments[2] === "reset-password" && method === "POST") {
      try {
        const body = await readJson<{ token: string; password: string }>(request);
        const result = await resetUserPasswordWithToken(env.DB, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(
          context,
          "password_reset_failed",
          error instanceof Error ? error.message : "Unable to reset password.",
          400
        );
      }
    }

    if (segments[2] === "accept-invite" && method === "POST") {
      try {
        const body = await readJson<{ token: string; name?: string; password: string }>(request);
        const result = await acceptSiteInvite(env.DB, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(
          context,
          "invite_accept_failed",
          error instanceof Error ? error.message : "Unable to accept invite.",
          400
        );
      }
    }

    if (segments[2] === "me" && method === "GET") {
      const authorization = await authorizeRequest(request, env);
      if (!authorization || authorization.kind !== "session") {
        return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
      }

      const bootstrap = await getBootstrap(env.DB, authorization.user.id);
      return json(context, bootstrap);
    }

    if (segments[2] === "me" && segments[3] === "profile" && method === "PATCH") {
      const authorization = await authorizeRequest(request, env);
      if (!authorization || authorization.kind !== "session") {
        return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
      }
      try {
        const body = await readJson<{ name?: string; email?: string; phone?: string; password?: string }>(request);
        const result = await updateMyProfile(env.DB, authorization.user.id, body);
        return json(context, result);
      } catch (error) {
        return errorResponse(
          context,
          "profile_update_failed",
          error instanceof Error ? error.message : "Unable to update profile.",
          400
        );
      }
    }
  }

  if (segments[0] === "v1" && segments[1] === "bootstrap" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }
    const authorization = await authorizeRequest(request, env);
    if (!authorization || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    return json(context, await getBootstrap(env.DB, authorization.user.id));
  }

  if (segments[0] === "v1" && segments[1] === "admin") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    const authorization = await authorizeRequest(request, env);
    const forbidden = requireGlobalAdmin(context, authorization);
    if (forbidden) {
      return forbidden;
    }
    if (!authorization || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    if (segments[2] === "overview" && method === "GET") {
      return json(context, await getAdminOverview(env.DB));
    }

    if (segments[2] === "billing" && segments[3] === "overview" && method === "GET") {
      return json(context, await getAdminBillingOverview(env.DB));
    }

    if (segments[2] === "billing" && segments[3] === "subscriptions" && method === "GET") {
      return json(context, await listAdminBillingSubscriptions(env.DB));
    }

    if (segments[2] === "billing" && segments[3] === "transactions" && method === "GET") {
      return json(context, await listAdminBillingTransactions(env.DB));
    }

    if (segments[2] === "billing" && segments[3] === "subscriptions" && segments[4] && method === "PATCH") {
      try {
        const body = await readJson<{
          plan_code?: "free" | "growth" | "enterprise";
          status?: "active" | "past_due" | "suspended" | "canceled";
          included_events?: number;
          overage_block_price_usd?: number;
          suspension_reason?: string | null;
        }>(request);
        return json(context, await updateAdminBillingSubscription(env.DB, segments[4], body));
      } catch (error) {
        return errorResponse(context, "billing_subscription_update_failed", error instanceof Error ? error.message : "Unable to update subscription.", 400);
      }
    }

    if (segments[2] === "billing" && segments[3] === "invoices" && method === "POST") {
      try {
        const body = await readJson<{ site_id: string; amount_usd: number; due_in_days?: number; note?: string }>(request);
        return json(context, await issueAdminInvoice(env.DB, body.site_id, body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "billing_invoice_create_failed", error instanceof Error ? error.message : "Unable to issue invoice.", 400);
      }
    }

    if (segments[2] === "users" && segments.length === 3 && method === "GET") {
      return json(context, await listAdminUsers(env.DB));
    }

    if (segments[2] === "users" && segments[3] && method === "PATCH") {
      try {
        const body = await readJson<{ role?: "member" | "global_admin"; status?: "active" | "blocked" }>(request);
        return json(context, await updateAdminUser(env.DB, authorization.user.id, segments[3], body));
      } catch (error) {
        return errorResponse(context, "admin_user_update_failed", error instanceof Error ? error.message : "Unable to update user.", 400);
      }
    }

    if (segments[2] === "users" && segments[3] && segments[4] === "password" && method === "POST") {
      try {
        const body = await readJson<{ password: string }>(request);
        return json(context, await adminSetUserPassword(env.DB, segments[3], body.password));
      } catch (error) {
        return errorResponse(context, "admin_password_reset_failed", error instanceof Error ? error.message : "Unable to update password.", 400);
      }
    }

    if (segments[2] === "users" && segments[3] && method === "DELETE") {
      try {
        const deleted = await deleteAdminUser(env.DB, authorization.user.id, segments[3]);
        return deleted ? json(context, { deleted: true }) : notFound(context, `User ${segments[3]} not found`);
      } catch (error) {
        return errorResponse(context, "admin_user_delete_failed", error instanceof Error ? error.message : "Unable to delete user.", 400);
      }
    }

    if (segments[2] === "sites" && segments.length === 3 && method === "GET") {
      return json(context, await listAdminSites(env.DB));
    }

    if (segments[2] === "sites" && segments.length === 3 && method === "POST") {
      try {
        const body = await readJson<{
          name: string;
          domain?: string;
          org_name?: string;
          project_name?: string;
          environment?: string;
        }>(request);
        return json(context, await createAdminSite(env.DB, body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "admin_site_create_failed", error instanceof Error ? error.message : "Unable to create site.", 400);
      }
    }

    if (segments[2] === "sites" && segments.length === 4 && segments[3] && method === "DELETE") {
      try {
        const deleted = await deleteAdminSite(env.DB, segments[3]);
        return deleted ? json(context, { deleted: true }) : notFound(context, `Site ${segments[3]} not found`);
      } catch (error) {
        return errorResponse(context, "admin_site_delete_failed", error instanceof Error ? error.message : "Unable to delete site.", 400);
      }
    }

    if (segments[2] === "sites" && segments[3] && segments[4] === "keys" && method === "POST") {
      try {
        const body = await readJson<{ label: string }>(request);
        return json(context, await createAdminSiteKey(env.DB, segments[3], body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "admin_site_key_create_failed", error instanceof Error ? error.message : "Unable to create key.", 400);
      }
    }

    if (segments[2] === "sites" && segments[3] && segments[4] === "keys" && segments[5] && method === "DELETE") {
      try {
        const key = await revokeAdminSiteKey(env.DB, segments[3], segments[5]);
        return key ? json(context, key) : notFound(context, `Key ${segments[5]} not found`);
      } catch (error) {
        return errorResponse(context, "admin_site_key_revoke_failed", error instanceof Error ? error.message : "Unable to revoke key.", 400);
      }
    }

    return notFound(context, `Unknown API route: ${context.url.pathname}`);
  }

  const authorization = await authorizeRequest(request, env);
  if (!authorization) {
    return errorResponse(context, "unauthorized", "Missing or invalid API token.", 401);
  }

  if (segments[0] !== "v1" || segments[1] !== "sites" || !segments[2]) {
    return notFound(context, `Unknown API route: ${context.url.pathname}`);
  }

  const siteId = siteIdFromSegments(segments);
  if (env?.DB && authorization.kind === "session") {
    const siteAccess = await getSiteAccess(env.DB, authorization.user.id, siteId);
    if (!siteAccess) {
      return errorResponse(context, "forbidden", "You do not have access to this site.", 403);
    }
  }

  if (segments[3] === "overview" && method === "GET") {
    const range = (context.url.searchParams.get("range") ?? "24h") as DateRangePreset;
    return json(context, getOverview(siteId, range));
  }

  if (segments[3] === "billing" && method === "GET") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    return json(context, await getSiteBillingSummary(env.DB, siteId));
  }

  if (segments[3] === "billing" && segments[4] === "invoices" && method === "GET") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    return json(context, await listSiteBillingInvoices(env.DB, siteId));
  }

  if (segments[3] === "billing" && segments[4] === "checkout" && method === "POST") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    try {
      return json(context, await createSiteBillingCheckoutSession(env.DB, env ?? {}, siteId), { status: 201 });
    } catch (error) {
      return errorResponse(context, "billing_checkout_failed", error instanceof Error ? error.message : "Unable to start Stripe Checkout.", 400);
    }
  }

  if (segments[3] === "billing" && segments[4] === "portal" && method === "POST") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    try {
      return json(context, await createSiteBillingPortalSession(env.DB, env ?? {}, siteId), { status: 201 });
    } catch (error) {
      return errorResponse(context, "billing_portal_failed", error instanceof Error ? error.message : "Unable to open Stripe Billing Portal.", 400);
    }
  }

  if (segments[3] === "realtime" && method === "GET") {
    return json(context, getRealtime(siteId));
  }

  if (segments[3] === "compiled-routing" && method === "GET") {
    if (env?.DB) return json(context, await getSiteCompiledRouting(env.DB, siteId, env));
    return json(context, getCompiledRouting(siteId));
  }

  if (segments[3] === "routes" && segments.length === 4) {
    if (method === "GET") {
      if (env?.DB) return json(context, await listSiteRoutes(env.DB, siteId));
      return json(context, listRoutes(siteId));
    }
    if (method === "POST") {
      const body = await readJson<MutableRoute>(request);
      if (env?.DB) return json(context, await createSiteRoute(env.DB, siteId, body), { status: 201 });
      return json(context, createRoute(siteId, body), { status: 201 });
    }
  }

  if (segments[3] === "routes" && segments[4] === "publish" && method === "POST") {
    if (env?.DB) return json(context, await publishSiteRoutes(env.DB, siteId, env));
    return json(context, publishRoutes(siteId));
  }

  if (segments[3] === "routes" && segments[4] === "versions" && method === "GET") {
    if (env?.DB) return json(context, await listSiteRouteVersions(env.DB, siteId));
    return json(context, listRouteVersions(siteId));
  }

  if (segments[3] === "routes" && segments[4] === "rollback" && method === "POST") {
    const body = await readJson<{ version?: number }>(request);
    if (env?.DB) return json(context, await rollbackSiteRoutes(env.DB, siteId, body.version, env));
    return json(context, rollbackRoutes(siteId, body.version));
  }

  if (segments[3] === "routes" && segments[4]) {
    const routeId = segments[4];
    if (segments[5] === "duplicate" && method === "POST") {
      const route = env?.DB
        ? await duplicateSiteRoute(env.DB, siteId, routeId)
        : duplicateRoute(siteId, routeId);
      return route ? json(context, route, { status: 201 }) : notFound(context, `Route ${routeId} not found`);
    }

    if (segments[5] === "simulate" && method === "POST") {
      const body = await readJson<Partial<EventGatewayEvent> & Pick<EventGatewayEvent, "type" | "source" | "environment">>(request);
      if (env?.DB) return json(context, await simulateSiteRoute(env.DB, siteId, routeId, body));
      return json(context, simulateRoute(siteId, routeId, body));
    }

    if (method === "GET") {
      const route = env?.DB
        ? await getSiteRoute(env.DB, siteId, routeId)
        : getRoute(siteId, routeId);
      return route ? json(context, route) : notFound(context, `Route ${routeId} not found`);
    }

    if (method === "PATCH") {
      const patch = await readJson<Partial<EventRoute>>(request);
      if (env?.DB) {
        const route = await updateSiteRoute(env.DB, siteId, routeId, patch);
        await publishSiteRoutes(env.DB, siteId, env);
        return route ? json(context, route) : notFound(context, `Route ${routeId} not found`);
      }
      const route = updateRoute(siteId, routeId, patch);
      return route ? json(context, route) : notFound(context, `Route ${routeId} not found`);
    }

    if (method === "DELETE") {
      if (env?.DB) {
        const deleted = await deleteSiteRoute(env.DB, siteId, routeId);
        if (deleted) await publishSiteRoutes(env.DB, siteId, env);
        return deleted ? json(context, { deleted: true }) : notFound(context, `Route ${routeId} not found`);
      }
      const deleted = deleteRoute(siteId, routeId);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Route ${routeId} not found`);
    }
  }

  if (segments[3] === "destinations" && segments.length === 4) {
    if (method === "GET") {
      if (env?.DB) return json(context, await listSiteDestinations(env.DB, siteId));
      return json(context, listDestinations(siteId));
    }
    if (method === "POST") {
      const body = await readJson<Omit<ReturnType<typeof listDestinations>[number], "id" | "site_id" | "secret_preview">>(request);
      if (env?.DB) {
        try {
          const destination = await createSiteDestination(env.DB, siteId, body);
          await publishSiteRoutes(env.DB, siteId, env);
          return json(context, destination, { status: 201 });
        } catch (error) {
          return errorResponse(context, "destination_create_failed", error instanceof Error ? error.message : "Unable to create destination.", 400);
        }
      }
      return json(context, createDestination(siteId, body), { status: 201 });
    }
  }

  if (segments[3] === "destinations" && segments[4]) {
    const destinationId = segments[4];
    if (segments[5] === "test" && method === "POST") {
      if (env?.DB) return json(context, await testSiteDestination(env.DB, siteId, destinationId));
      return json(context, testDestination(siteId, destinationId));
    }
    if (segments[5] === "rotate-secret" && method === "POST") {
      const destination = env?.DB
        ? await rotateSiteDestinationSecret(env.DB, siteId, destinationId)
        : rotateDestinationSecret(siteId, destinationId);
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "GET") {
      const destination = env?.DB
        ? await getSiteDestination(env.DB, siteId, destinationId)
        : getDestination(siteId, destinationId);
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "PATCH") {
      const patch = await readJson<Record<string, unknown>>(request);
      const destination = env?.DB
        ? await updateSiteDestination(env.DB, siteId, destinationId, patch)
        : updateDestination(siteId, destinationId, patch);
      return destination ? json(context, destination) : notFound(context, `Destination ${destinationId} not found`);
    }
    if (method === "DELETE") {
      const deleted = env?.DB
        ? await deleteSiteDestination(env.DB, siteId, destinationId)
        : deleteDestination(siteId, destinationId);
      return deleted
        ? json(context, { deleted: true })
        : notFound(context, `Destination ${destinationId} not found`);
    }
  }

  if (segments[3] === "transformations" && segments.length === 4) {
    if (method === "GET") {
      if (env?.DB) return json(context, await listSiteTransformations(env.DB, siteId));
      return json(context, listTransformations(siteId));
    }
    if (method === "POST") {
      const body = await readJson<Omit<ReturnType<typeof listTransformations>[number], "id" | "site_id" | "version">>(request);
      if (env?.DB) {
        const transformation = await createSiteTransformation(env.DB, siteId, body);
        await publishSiteRoutes(env.DB, siteId, env);
        return json(context, transformation, { status: 201 });
      }
      return json(
        context,
        createTransformation(siteId, body),
        { status: 201 }
      );
    }
  }

  if (segments[3] === "transformations" && segments[4]) {
    const transformId = segments[4];
    if (method === "GET") {
      const transformation = env?.DB
        ? await getSiteTransformation(env.DB, siteId, transformId)
        : getTransformation(siteId, transformId);
      return transformation ? json(context, transformation) : notFound(context, `Transformation ${transformId} not found`);
    }
    if (method === "PATCH") {
      const patch = await readJson<Record<string, unknown>>(request);
      if (env?.DB) {
        const transformation = await updateSiteTransformation(env.DB, siteId, transformId, patch);
        await publishSiteRoutes(env.DB, siteId, env);
        return transformation ? json(context, transformation) : notFound(context, `Transformation ${transformId} not found`);
      }
      const transformation = updateTransformation(siteId, transformId, patch);
      return transformation ? json(context, transformation) : notFound(context, `Transformation ${transformId} not found`);
    }
    if (method === "DELETE") {
      if (env?.DB) {
        const deleted = await deleteSiteTransformation(env.DB, siteId, transformId);
        if (deleted) await publishSiteRoutes(env.DB, siteId, env);
        return deleted ? json(context, { deleted: true }) : notFound(context, `Transformation ${transformId} not found`);
      }
      const deleted = deleteTransformation(siteId, transformId);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Transformation ${transformId} not found`);
    }
  }

  if (segments[3] === "events" && segments[4] === "recent" && method === "GET") {
    return json(context, listEvents(siteId));
  }

  if (segments[3] === "events" && segments[4] === "schemas" && method === "GET") {
    return json(context, listSchemas(siteId));
  }

  if (segments[3] === "events" && segments[4] === "debug" && method === "POST") {
    const body = await readJson<Partial<EventGatewayEvent>>(request);
    return json(context, { valid: validateEvent(body), sample: body });
  }

  if (segments[3] === "events" && segments[4] === "validate" && method === "POST") {
    return json(context, validateEvent(await readJson<Partial<EventGatewayEvent>>(request)));
  }

  if (segments[3] === "events" && segments[4] && method === "GET") {
    const event = getEvent(siteId, segments[4]);
    return event ? json(context, event) : notFound(context, `Event ${segments[4]} not found`);
  }

  if (segments[3] === "deliveries" && segments.length === 4 && method === "GET") {
    return json(context, listDeliveries(siteId));
  }

  if (segments[3] === "identity" && segments[4] === "users" && method === "GET") {
    return json(context, listUsers(siteId));
  }

  if (segments[3] === "identity" && segments[4] === "journeys" && segments[5] && method === "GET") {
    return json(context, getJourneys(siteId, segments[5]));
  }

  if (segments[3] === "identity" && segments[4] === "consent" && method === "GET") {
    return json(context, getConsent(siteId));
  }

  if (segments[3] === "settings" && segments[4] === "install" && method === "GET") {
    if (env?.DB) {
      try {
        return json(context, await getInstallConfigFromDb(env.DB, siteId));
      } catch (error) {
        return errorResponse(context, "install_config_failed", error instanceof Error ? error.message : "Install config unavailable.", 404);
      }
    }
    return json(context, getInstallConfig(siteId));
  }

  if (segments[3] === "settings" && segments[4] === "members" && segments.length === 5) {
    if (!env?.DB || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    if (method === "GET") {
      try {
        return json(context, await getSiteMembersPayload(env.DB, authorization.user.id, siteId));
      } catch (error) {
        return errorResponse(context, "members_fetch_failed", error instanceof Error ? error.message : "Unable to load members.", 400);
      }
    }

    if (method === "POST") {
      try {
        const body = await readJson<{ email: string; invited_name?: string; role?: "admin" | "user" }>(request);
        return json(context, await createSiteInvite(env.DB, env, authorization.user.id, siteId, body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "invite_create_failed", error instanceof Error ? error.message : "Unable to create invite.", 400);
      }
    }
  }

  if (segments[3] === "settings" && segments[4] === "members" && segments[5] && method === "PATCH") {
    if (!env?.DB || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    try {
      const body = await readJson<{ role: "admin" | "user" }>(request);
      return json(context, await updateSiteMembershipRole(env.DB, authorization.user.id, siteId, segments[5], body.role));
    } catch (error) {
      return errorResponse(context, "membership_update_failed", error instanceof Error ? error.message : "Unable to update member role.", 400);
    }
  }

  if (segments[3] === "settings" && segments[4] === "members" && segments[5] && method === "DELETE") {
    if (!env?.DB || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    try {
      const deleted = await deleteSiteMembership(env.DB, authorization.user.id, siteId, segments[5]);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Membership ${segments[5]} not found`);
    } catch (error) {
      return errorResponse(context, "membership_delete_failed", error instanceof Error ? error.message : "Unable to remove member.", 400);
    }
  }

  if (segments[3] === "settings" && segments[4] === "members" && segments[5] === "invites" && segments[6] && method === "DELETE") {
    if (!env?.DB || authorization.kind !== "session") {
      return errorResponse(context, "unauthorized", "Missing or invalid session token.", 401);
    }

    try {
      const deleted = await revokeSiteInvite(env.DB, authorization.user.id, siteId, segments[6]);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Invite ${segments[6]} not found`);
    } catch (error) {
      return errorResponse(context, "invite_revoke_failed", error instanceof Error ? error.message : "Unable to revoke invite.", 400);
    }
  }

  if (segments[3] === "settings" && segments[4] === "domains" && segments.length === 5) {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    if (method === "GET") {
      return json(context, await listSiteDomains(env.DB, siteId));
    }

    if (method === "POST") {
      try {
        const body = await readJson<{ domain: string; kind?: string; description?: string }>(request);
        return json(context, await addSiteDomain(env.DB, siteId, body), { status: 201 });
      } catch (error) {
        return errorResponse(context, "domain_create_failed", error instanceof Error ? error.message : "Unable to add domain.", 400);
      }
    }
  }

  if (segments[3] === "settings" && segments[4] === "domains" && segments[5] && method === "DELETE") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    try {
      const deleted = await deleteSiteDomain(env.DB, siteId, segments[5]);
      return deleted ? json(context, { deleted: true }) : notFound(context, `Domain ${segments[5]} not found`);
    } catch (error) {
      return errorResponse(context, "domain_delete_failed", error instanceof Error ? error.message : "Unable to delete domain.", 400);
    }
  }

  if (segments[3] === "settings" && segments[4] === "api-keys" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await listSiteKeys(env.DB, siteId));
  }

  if (segments[3] === "operations" && segments[4] === "health" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await getOperationsHealth(env.DB, siteId));
  }

  if (segments[3] === "operations" && segments[4] === "queues" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await getOperationsQueues(env.DB, siteId));
  }

  if (segments[3] === "operations" && segments[4] === "dlq" && segments.length === 5 && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await listOperationsDlq(env.DB, siteId));
  }

  if (segments[3] === "operations" && segments[4] === "dlq" && segments[5] === "replay" && method === "POST") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await replayDlqOperations(env.DB, siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "replay" && method === "POST") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    const body = await readJson<{ event_id: string }>(request);
    const result = await replayCollectedEvent(env.DB, siteId, body.event_id);
    return result ? json(context, result, { status: 202 }) : notFound(context, `Event ${body.event_id} not found`);
  }

  if (segments[3] === "operations" && segments[4] === "backfill-attribution" && method === "POST") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await backfillAttributionJob(env.DB, siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "export" && method === "POST") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await exportRawJob(env.DB, siteId), { status: 202 });
  }

  if (segments[3] === "operations" && segments[4] === "jobs" && segments[5] && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    const job = await getOperationJob(env.DB, siteId, segments[5]);
    return job ? json(context, job) : notFound(context, `Job ${segments[5]} not found`);
  }

  if (segments[3] === "operations" && segments[4] === "jobs" && method === "GET") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, await listOperationJobs(env.DB, siteId));
  }

  if (segments[3] === "operations" && segments[4] === "flush-forwarder" && method === "POST") {
    if (!env?.DB) {
      return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    }

    return json(context, { processed: (await flushPendingDeliveries(env.DB, siteId)).length }, { status: 202 });
  }

  const methodResponse = ensureMethod(context, []);
  if (methodResponse) return methodResponse;
  return notFound(context, `Unknown API route: ${context.url.pathname}`);
}

export default {
  async fetch(request: Request, env?: EnvironmentBindings) {
    return handleApiRequest(request, env);
  }
};
