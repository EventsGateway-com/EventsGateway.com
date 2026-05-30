import {
  acceptDashboardInvite,
  backfillAttributionAction,
  createAdminSiteKeyRecord,
  createAdminSiteRecord,
  createDestinationRecord,
  createSiteInviteRecord,
  createTransformationRecord,
  createDomain,
  deleteSiteMembershipRecord,
  deleteDestinationRecord,
  deleteTransformationRecord,
  deleteAdminUserRecord,
  deleteAdminSiteRecord,
  deleteDomain,
  fetchAdminOverview,
  fetchAdminBillingOverview,
  fetchAdminBillingSubscriptions,
  fetchAdminBillingTransactions,
  fetchAdminSites,
  fetchAdminUsers,
  fetchApiKeys,
  fetchBilling,
  fetchBillingInvoices,
  exportRawAction,
  fetchConsent,
  fetchDomains,
  fetchDestinationDetail,
  fetchDeliveries,
  fetchDestinations,
  fetchDlq,
  fetchEvent,
  fetchEvents,
  fetchHealth,
  fetchInstall,
  createBillingCheckoutSession,
  createBillingPortalSession,
  issueAdminInvoice,
  fetchTagManager,
  fetchJobs,
  fetchJourneys,
  fetchSiteMembers,
  fetchOverview,
  fetchQueues,
  fetchRealtime,
  fetchRouteDetail,
  revokeSiteInviteRecord,
  updateRouteRecord,
  fetchRoutes,
  publishRoutesRecord,
  fetchSchemas,
  fetchTransformationDetail,
  fetchTransformations,
  fetchUsers,
  flushForwarderAction,
  replayDlqAction,
  replayEventAction,
  publishTagManager,
  rotateDestinationSecretRecord,
  saveTagManager,
  testDestinationRecord,
  updateAdminBillingSubscription,
  updateSiteMembershipRecord,
  updateTransformationRecord,
  updateDestinationRecord,
  revokeAdminSiteKeyRecord,
  updateAdminUserPassword,
  updateAdminUserRecord
} from "./api-client";

type CurrentContext = {
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  siteId: string;
  siteName: string;
  environment: string;
  dateRange: string;
};

const DEFAULT_CONTEXT: CurrentContext = {
  orgId: "org_open",
  orgName: "Open Commerce Lab",
  projectId: "project_gateway",
  projectName: "Events Core",
  siteId: "site_alpha",
  siteName: "goldring.ro",
  environment: "production",
  dateRange: "24h"
};

function readCurrentContext(): CurrentContext {
  if (typeof window === "undefined") {
    return DEFAULT_CONTEXT;
  }

  const match = window.location.pathname.match(/\/app\/orgs\/([^/]+)\/projects\/([^/]+)\/sites\/([^/]+)/);
  if (!match) {
    return DEFAULT_CONTEXT;
  }

  const [, orgId, projectId, siteId] = match;

  return {
    ...DEFAULT_CONTEXT,
    orgId: decodeURIComponent(orgId),
    orgName: decodeURIComponent(orgId),
    projectId: decodeURIComponent(projectId),
    projectName: decodeURIComponent(projectId),
    siteId: decodeURIComponent(siteId),
    siteName: decodeURIComponent(siteId)
  };
}

export const currentContext: Readonly<CurrentContext> = {
  get orgId() {
    return readCurrentContext().orgId;
  },
  get orgName() {
    return readCurrentContext().orgName;
  },
  get projectId() {
    return readCurrentContext().projectId;
  },
  get projectName() {
    return readCurrentContext().projectName;
  },
  get siteId() {
    return readCurrentContext().siteId;
  },
  get siteName() {
    return readCurrentContext().siteName;
  },
  get environment() {
    return readCurrentContext().environment;
  },
  get dateRange() {
    return readCurrentContext().dateRange;
  }
};

export const qk = {
  overview: (siteId: string, range: string) => ["sites", siteId, "overview", range],
  realtime: (siteId: string) => ["sites", siteId, "realtime"],
  events: (siteId: string) => ["sites", siteId, "events", "recent"],
  schemas: (siteId: string) => ["sites", siteId, "events", "schemas"],
  routes: (siteId: string) => ["sites", siteId, "routes"],
  destinations: (siteId: string) => ["sites", siteId, "destinations"],
  transformations: (siteId: string) => ["sites", siteId, "transformations"],
  deliveries: (siteId: string) => ["sites", siteId, "deliveries"],
  event: (siteId: string, eventId: string) => ["sites", siteId, "events", eventId],
  health: (siteId: string) => ["sites", siteId, "operations", "health"],
  queues: (siteId: string) => ["sites", siteId, "operations", "queues"],
  dlq: (siteId: string) => ["sites", siteId, "operations", "dlq"],
  jobs: (siteId: string) => ["sites", siteId, "operations", "jobs"],
  users: (siteId: string) => ["sites", siteId, "identity", "users"],
  journeys: (siteId: string, canonicalUserId: string) => ["sites", siteId, "identity", "journeys", canonicalUserId],
  consent: (siteId: string) => ["sites", siteId, "identity", "consent"],
  install: (siteId: string) => ["sites", siteId, "settings", "install"],
  billing: (siteId: string) => ["sites", siteId, "settings", "billing"],
  billingInvoices: (siteId: string) => ["sites", siteId, "settings", "billing", "invoices"],
  tagManager: (siteId: string) => ["sites", siteId, "settings", "tag-manager"],
  domains: (siteId: string) => ["sites", siteId, "settings", "domains"],
  apiKeys: (siteId: string) => ["sites", siteId, "settings", "api-keys"],
  members: (siteId: string) => ["sites", siteId, "settings", "members"],
  adminOverview: () => ["admin", "overview"],
  adminBillingOverview: () => ["admin", "billing", "overview"],
  adminBillingSubscriptions: () => ["admin", "billing", "subscriptions"],
  adminBillingTransactions: () => ["admin", "billing", "transactions"],
  adminUsers: () => ["admin", "users"],
  adminSites: () => ["admin", "sites"],
  route: (siteId: string, routeId: string) => ["sites", siteId, "routes", routeId],
  transformation: (siteId: string, transformationId: string) => ["sites", siteId, "transformations", transformationId],
  destination: (siteId: string, destinationId: string) => ["sites", siteId, "destinations", destinationId]
} as const;

export const dashboardApi = {
  fetchOverview: () => fetchOverview(currentContext.siteId, currentContext.dateRange),
  fetchRealtime: () => fetchRealtime(currentContext.siteId),
  fetchEvents: () => fetchEvents(currentContext.siteId),
  fetchSchemas: () => fetchSchemas(currentContext.siteId),
  fetchRoutes: () => fetchRoutes(currentContext.siteId),
  fetchRouteDetail: (routeId: string) => fetchRouteDetail(currentContext.siteId, routeId),
  updateRoute: (routeId: string, input: Parameters<typeof updateRouteRecord>[2]) => updateRouteRecord(currentContext.siteId, routeId, input),
  publishRoutes: () => publishRoutesRecord(currentContext.siteId),
  fetchDeliveries: () => fetchDeliveries(currentContext.siteId),
  fetchEvent: (eventId: string) => fetchEvent(currentContext.siteId, eventId),
  fetchHealth: () => fetchHealth(currentContext.siteId),
  fetchDestinations: () => fetchDestinations(currentContext.siteId),
  fetchDestinationDetail: (destinationId: string) => fetchDestinationDetail(currentContext.siteId, destinationId),
  createDestination: (input: Parameters<typeof createDestinationRecord>[1]) => createDestinationRecord(currentContext.siteId, input),
  updateDestination: (destinationId: string, input: Parameters<typeof updateDestinationRecord>[2]) =>
    updateDestinationRecord(currentContext.siteId, destinationId, input),
  deleteDestination: (destinationId: string) => deleteDestinationRecord(currentContext.siteId, destinationId),
  testDestination: (destinationId: string) => testDestinationRecord(currentContext.siteId, destinationId),
  rotateDestinationSecret: (destinationId: string) => rotateDestinationSecretRecord(currentContext.siteId, destinationId),
  fetchTransformations: () => fetchTransformations(currentContext.siteId),
  fetchTransformationDetail: (transformationId: string) => fetchTransformationDetail(currentContext.siteId, transformationId),
  createTransformation: (input: Parameters<typeof createTransformationRecord>[1]) => createTransformationRecord(currentContext.siteId, input),
  updateTransformation: (transformationId: string, input: Parameters<typeof updateTransformationRecord>[2]) =>
    updateTransformationRecord(currentContext.siteId, transformationId, input),
  deleteTransformation: (transformationId: string) => deleteTransformationRecord(currentContext.siteId, transformationId),
  fetchUsers: () => fetchUsers(currentContext.siteId),
  fetchJourneys: (canonicalUserId: string) => fetchJourneys(currentContext.siteId, canonicalUserId),
  fetchConsent: () => fetchConsent(currentContext.siteId),
  fetchInstall: () => fetchInstall(currentContext.siteId),
  fetchBilling: () => fetchBilling(currentContext.siteId),
  fetchBillingInvoices: () => fetchBillingInvoices(currentContext.siteId),
  createBillingCheckoutSession: () => createBillingCheckoutSession(currentContext.siteId),
  createBillingPortalSession: () => createBillingPortalSession(currentContext.siteId),
  fetchTagManager: () => fetchTagManager(currentContext.siteId),
  saveTagManager: (input: Parameters<typeof saveTagManager>[1]) => saveTagManager(currentContext.siteId, input),
  publishTagManager: (input: Parameters<typeof publishTagManager>[1]) => publishTagManager(currentContext.siteId, input),
  fetchDomains: () => fetchDomains(currentContext.siteId),
  createDomain: (input: { domain: string; kind?: string; description?: string }) => createDomain(currentContext.siteId, input),
  deleteDomain: (domainId: string) => deleteDomain(currentContext.siteId, domainId),
  createDomainForSite: (siteId: string, input: { domain: string; kind?: string; description?: string }) => createDomain(siteId, input),
  deleteDomainForSite: (siteId: string, domainId: string) => deleteDomain(siteId, domainId),
  fetchApiKeys: () => fetchApiKeys(currentContext.siteId),
  fetchMembers: () => fetchSiteMembers(currentContext.siteId),
  createInvite: (input: { email: string; invited_name?: string; role?: "admin" | "user" }) => createSiteInviteRecord(currentContext.siteId, input),
  updateMemberRole: (membershipId: string, input: { role: "admin" | "user" }) => updateSiteMembershipRecord(currentContext.siteId, membershipId, input),
  deleteMember: (membershipId: string) => deleteSiteMembershipRecord(currentContext.siteId, membershipId),
  revokeInvite: (inviteId: string) => revokeSiteInviteRecord(currentContext.siteId, inviteId),
  fetchAdminOverview: () => fetchAdminOverview(),
  fetchAdminBillingOverview: () => fetchAdminBillingOverview(),
  fetchAdminBillingSubscriptions: () => fetchAdminBillingSubscriptions(),
  fetchAdminBillingTransactions: () => fetchAdminBillingTransactions(),
  updateAdminBillingSubscription: (
    subscriptionId: string,
    input: {
      plan_code?: "free" | "growth" | "enterprise";
      status?: "active" | "past_due" | "suspended" | "canceled";
      included_events?: number;
      overage_block_price_usd?: number;
      suspension_reason?: string | null;
    }
  ) => updateAdminBillingSubscription(subscriptionId, input),
  issueAdminInvoice: (input: { site_id: string; amount_usd: number; due_in_days?: number; note?: string }) => issueAdminInvoice(input),
  fetchAdminUsers: () => fetchAdminUsers(),
  updateAdminUser: (userId: string, input: { role?: "member" | "global_admin"; status?: "active" | "blocked" }) =>
    updateAdminUserRecord(userId, input),
  updateAdminUserPassword: (userId: string, password: string) => updateAdminUserPassword(userId, password),
  deleteAdminUser: (userId: string) => deleteAdminUserRecord(userId),
  fetchAdminSites: () => fetchAdminSites(),
  createAdminSite: (input: { name: string; domain?: string; org_name?: string; project_name?: string; environment?: string }) =>
    createAdminSiteRecord(input),
  deleteAdminSite: (siteId: string) => deleteAdminSiteRecord(siteId),
  createAdminSiteKey: (siteId: string, input: { label: string }) => createAdminSiteKeyRecord(siteId, input),
  revokeAdminSiteKey: (siteId: string, keyId: string) => revokeAdminSiteKeyRecord(siteId, keyId),
  fetchQueues: () => fetchQueues(currentContext.siteId),
  fetchDlq: () => fetchDlq(currentContext.siteId),
  fetchJobs: () => fetchJobs(currentContext.siteId),
  replayDlq: () => replayDlqAction(currentContext.siteId),
  replayEvent: (eventId: string) => replayEventAction(currentContext.siteId, eventId),
  flushForwarder: () => flushForwarderAction(currentContext.siteId),
  backfillAttribution: () => backfillAttributionAction(currentContext.siteId),
  exportRaw: () => exportRawAction(currentContext.siteId),
  acceptInvite: (input: { token: string; name?: string; password: string }) => acceptDashboardInvite(input)
};
