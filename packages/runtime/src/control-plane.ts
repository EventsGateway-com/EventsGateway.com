import type { DatabaseBinding } from "./index";

type DatabaseRecord = Record<string, unknown>;

export type DashboardUserRole = "member" | "global_admin";
export type DashboardUserStatus = "active" | "blocked";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: DashboardUserRole;
  status: DashboardUserStatus;
  created_at: string;
  last_login_at: string | null;
  password_changed_at: string | null;
};

export type DashboardSession = {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

export type DashboardSite = {
  id: string;
  org_id: string;
  org_name: string;
  project_id: string;
  project_name: string;
  name: string;
  environment: string;
  collector_url: string;
  created_at: string;
};

export type SiteDomain = {
  id: string;
  site_id: string;
  domain: string;
  kind: string;
  status: string;
  description: string | null;
  created_at: string;
};

export type SiteKey = {
  id: string;
  site_id: string;
  label: string;
  public_key: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
};

export type BootstrapPayload = {
  user: DashboardUser;
  site: DashboardSite;
  domains: SiteDomain[];
};

export type AdminOverview = {
  totals: {
    users: number;
    admins: number;
    blocked_users: number;
    active_sessions: number;
    sites: number;
    domains: number;
    api_keys: number;
    collected_events: number;
  };
  recent_users: DashboardUser[];
  recent_sites: DashboardSite[];
};

export type AdminUserRecord = DashboardUser & {
  session_count: number;
};

export type AdminSiteRecord = DashboardSite & {
  domain_count: number;
  api_key_count: number;
  collected_event_count: number;
  last_event_at: string | null;
  domains: SiteDomain[];
  api_keys: SiteKey[];
};

const DEFAULT_SITE_ID = "site_alpha";
const DEFAULT_SITE_NAME = "goldring.ro";
const DEFAULT_ORG_ID = "org_open";
const DEFAULT_ORG_NAME = "Open Commerce Lab";
const DEFAULT_PROJECT_ID = "project_gateway";
const DEFAULT_PROJECT_NAME = "Events Core";
const DEFAULT_ENVIRONMENT = "production";

let ensurePromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function ensureDb(db?: DatabaseBinding): DatabaseBinding {
  if (!db) {
    throw new Error("Missing D1 database binding.");
  }

  return db;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function toDashboardUserRole(value: unknown): DashboardUserRole {
  return value === "global_admin" ? "global_admin" : "member";
}

function toDashboardUserStatus(value: unknown): DashboardUserStatus {
  return value === "blocked" ? "blocked" : "active";
}

function toDashboardUser(record: DatabaseRecord): DashboardUser {
  return {
    id: asString(record.id),
    name: asString(record.name),
    email: asString(record.email),
    role: toDashboardUserRole(record.role),
    status: toDashboardUserStatus(record.status),
    created_at: asString(record.created_at),
    last_login_at: asNullableString(record.last_login_at),
    password_changed_at: asNullableString(record.password_changed_at)
  };
}

function toDashboardSite(record: DatabaseRecord): DashboardSite {
  return {
    id: asString(record.id),
    org_id: asString(record.org_id),
    org_name: asString(record.org_name),
    project_id: asString(record.project_id),
    project_name: asString(record.project_name),
    name: asString(record.name),
    environment: asString(record.environment),
    collector_url: asString(record.collector_url),
    created_at: asString(record.created_at)
  };
}

function toSiteDomain(record: DatabaseRecord): SiteDomain {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    domain: asString(record.domain),
    kind: asString(record.kind),
    status: asString(record.status),
    description: typeof record.description === "string" ? record.description : null,
    created_at: asString(record.created_at)
  };
}

function toSiteKey(record: DatabaseRecord): SiteKey {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    label: asString(record.label),
    public_key: asString(record.public_key),
    status: asString(record.status),
    created_at: asString(record.created_at),
    last_used_at: typeof record.last_used_at === "string" ? record.last_used_at : null
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

function toIdSegment(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

export async function sha256Hex(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

function createSessionToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID().replace(/-/g, "")}`;
}

function createPublicKey() {
  return `egp_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function firstRecord(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const record = await db.prepare(sql).bind(...params).first<DatabaseRecord>();
  return record ?? null;
}

async function allRecords(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const result = await db.prepare(sql).bind(...params).all<DatabaseRecord>();
  return result.results ?? [];
}

async function countRecords(db: DatabaseBinding, sql: string, ...params: unknown[]) {
  const record = await firstRecord(db, sql, ...params);
  return Number(record?.count ?? 0);
}

async function ensureDashboardUsersTableColumns(db: DatabaseBinding) {
  const columns = await allRecords(db, "PRAGMA table_info(dashboard_users)");
  const columnNames = new Set(columns.map((column) => asString(column.name)));
  const migrations: string[] = [];

  if (!columnNames.has("role")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN role TEXT NOT NULL DEFAULT 'member'");
  }
  if (!columnNames.has("status")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
  }
  if (!columnNames.has("last_login_at")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN last_login_at TEXT");
  }
  if (!columnNames.has("password_changed_at")) {
    migrations.push("ALTER TABLE dashboard_users ADD COLUMN password_changed_at TEXT");
  }

  for (const sql of migrations) {
    await db.prepare(sql).run();
  }

  await db.prepare(
    `
      UPDATE dashboard_users
      SET
        role = COALESCE(role, 'member'),
        status = COALESCE(status, 'active'),
        password_changed_at = COALESCE(password_changed_at, created_at)
    `
  ).run();

  const adminCount = await countRecords(
    db,
    "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'"
  );

  if (adminCount === 0) {
    const firstUser = await firstRecord(
      db,
      "SELECT id FROM dashboard_users ORDER BY created_at ASC, email ASC LIMIT 1"
    );
    if (firstUser) {
      await db.prepare("UPDATE dashboard_users SET role = 'global_admin' WHERE id = ?")
        .bind(asString(firstUser.id))
        .run();
    }
  }
}

export async function ensureControlPlane(dbInput?: DatabaseBinding) {
  const db = ensureDb(dbInput);
  if (!ensurePromise) {
    ensurePromise = ensureDashboardUsersTableColumns(db);
  }

  await ensurePromise;
}

export async function createUserSession(
  dbInput: DatabaseBinding | undefined,
  input: { name: string; email: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) throw new Error("Name must contain at least 2 characters.");
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must contain at least 8 characters.");

  const existingUser = await firstRecord(db, "SELECT id FROM dashboard_users WHERE email = ? LIMIT 1", email);
  if (existingUser) {
    throw new Error("An account already exists for this email.");
  }

  const userId = crypto.randomUUID();
  const createdAt = nowIso();
  const existingUsersCount = await countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users");
  const role: DashboardUserRole = existingUsersCount === 0 ? "global_admin" : "member";

  await db.prepare(
    `
      INSERT INTO dashboard_users (
        id,
        name,
        email,
        password_hash,
        role,
        status,
        created_at,
        password_changed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(userId, name, email, await sha256Hex(password), role, "active", createdAt, createdAt)
    .run();

  return createSession(db, userId);
}

export async function loginUserSession(
  dbInput: DatabaseBinding | undefined,
  input: { email: string; password: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const email = normalizeEmail(input.email);
  const record = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, password_hash, created_at, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE email = ?
      LIMIT 1
    `,
    email
  );

  if (!record) {
    throw new Error("No account exists for this email yet.");
  }

  const passwordHash = await sha256Hex(input.password);
  if (passwordHash !== asString(record.password_hash)) {
    throw new Error("The email or password is incorrect.");
  }

  if (toDashboardUserStatus(record.status) === "blocked") {
    throw new Error("This account is blocked.");
  }

  return createSession(db, asString(record.id), record);
}

async function createSession(db: DatabaseBinding, userId: string, existingUser?: DatabaseRecord | null) {
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const token = createSessionToken();
  const sessionId = crypto.randomUUID();

  await db.prepare(
    "INSERT INTO dashboard_sessions (id, token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(sessionId, token, userId, expiresAt, createdAt)
    .run();

  await db.prepare("UPDATE dashboard_users SET last_login_at = ? WHERE id = ?").bind(createdAt, userId).run();

  const userRecord =
    existingUser ??
    (await firstRecord(
      db,
      `
        SELECT id, name, email, role, status, created_at, last_login_at, password_changed_at
        FROM dashboard_users
        WHERE id = ?
        LIMIT 1
      `,
      userId
    ));

  if (!userRecord) {
    throw new Error("User not found.");
  }

  return {
    session: {
      id: sessionId,
      token,
      user_id: userId,
      expires_at: expiresAt,
      created_at: createdAt
    } satisfies DashboardSession,
    user: toDashboardUser(userRecord)
  };
}

export async function getSessionByToken(dbInput: DatabaseBinding | undefined, token: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const session = await firstRecord(
    db,
    `
      SELECT s.id, s.token, s.user_id, s.expires_at, s.created_at, u.name, u.email, u.created_at AS user_created_at
      , u.role, u.status, u.last_login_at, u.password_changed_at
      FROM dashboard_sessions s
      JOIN dashboard_users u ON u.id = s.user_id
      WHERE s.token = ?
      LIMIT 1
    `,
    token
  );

  if (!session) return null;
  if (Date.parse(asString(session.expires_at)) <= Date.now()) {
    await revokeSession(db, token);
    return null;
  }
  if (toDashboardUserStatus(session.status) === "blocked") {
    await revokeSession(db, token);
    return null;
  }

  return {
    session: {
      id: asString(session.id),
      token: asString(session.token),
      user_id: asString(session.user_id),
      expires_at: asString(session.expires_at),
      created_at: asString(session.created_at)
    } satisfies DashboardSession,
    user: {
      id: asString(session.user_id),
      name: asString(session.name),
      email: asString(session.email),
      role: toDashboardUserRole(session.role),
      status: toDashboardUserStatus(session.status),
      created_at: asString(session.user_created_at),
      last_login_at: asNullableString(session.last_login_at),
      password_changed_at: asNullableString(session.password_changed_at)
    } satisfies DashboardUser
  };
}

export async function revokeSession(dbInput: DatabaseBinding | undefined, token: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  await db.prepare("DELETE FROM dashboard_sessions WHERE token = ?").bind(token).run();
}

export async function getDefaultSite(dbInput: DatabaseBinding | undefined) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const site = await firstRecord(
    db,
    `
      SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
      FROM sites
      WHERE id = ?
      LIMIT 1
    `,
    DEFAULT_SITE_ID
  );

  if (!site) {
    throw new Error("Default site is missing.");
  }

  return toDashboardSite(site);
}

export async function getBootstrap(dbInput: DatabaseBinding | undefined, userId: string): Promise<BootstrapPayload> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const user = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, created_at, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
    `,
    userId
  );
  if (!user) {
    throw new Error("User not found.");
  }

  const site = await getDefaultSite(db);
  const domains = await listSiteDomains(db, site.id);
  return {
    user: toDashboardUser(user),
    site,
    domains
  };
}

async function countGlobalAdmins(db: DatabaseBinding) {
  return countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'");
}

export async function getAdminOverview(dbInput: DatabaseBinding | undefined): Promise<AdminOverview> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const [
    users,
    admins,
    blockedUsers,
    activeSessions,
    sites,
    domains,
    apiKeys,
    collectedEvents,
    recentUsersRecords,
    recentSiteRecords
  ] = await Promise.all([
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE role = 'global_admin'"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_users WHERE status = 'blocked'"),
    countRecords(db, "SELECT COUNT(*) AS count FROM dashboard_sessions"),
    countRecords(db, "SELECT COUNT(*) AS count FROM sites"),
    countRecords(db, "SELECT COUNT(*) AS count FROM site_domains"),
    countRecords(db, "SELECT COUNT(*) AS count FROM site_keys"),
    countRecords(db, "SELECT COUNT(*) AS count FROM collected_events"),
    allRecords(
      db,
      `
        SELECT id, name, email, role, status, created_at, last_login_at, password_changed_at
        FROM dashboard_users
        ORDER BY created_at DESC, email DESC
        LIMIT 6
      `
    ),
    allRecords(
      db,
      `
        SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
        FROM sites
        ORDER BY created_at DESC, name ASC
        LIMIT 6
      `
    )
  ]);

  return {
    totals: {
      users,
      admins,
      blocked_users: blockedUsers,
      active_sessions: activeSessions,
      sites,
      domains,
      api_keys: apiKeys,
      collected_events: collectedEvents
    },
    recent_users: recentUsersRecords.map(toDashboardUser),
    recent_sites: recentSiteRecords.map(toDashboardSite)
  };
}

export async function listAdminUsers(dbInput: DatabaseBinding | undefined): Promise<AdminUserRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const records = await allRecords(
    db,
    `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.last_login_at,
        u.password_changed_at,
        COUNT(s.id) AS session_count
      FROM dashboard_users u
      LEFT JOIN dashboard_sessions s ON s.user_id = u.id
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at, u.last_login_at, u.password_changed_at
      ORDER BY
        CASE WHEN u.role = 'global_admin' THEN 0 ELSE 1 END,
        u.created_at ASC,
        u.email ASC
    `
  );

  return records.map((record) => ({
    ...toDashboardUser(record),
    session_count: Number(record.session_count ?? 0)
  }));
}

export async function updateAdminUser(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  targetUserId: string,
  input: { role?: DashboardUserRole; status?: DashboardUserStatus }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const target = await firstRecord(
    db,
    "SELECT id, role, status FROM dashboard_users WHERE id = ? LIMIT 1",
    targetUserId
  );
  if (!target) {
    throw new Error("User not found.");
  }

  const nextRole = input.role ?? toDashboardUserRole(target.role);
  const nextStatus = input.status ?? toDashboardUserStatus(target.status);

  if (actorUserId === targetUserId && nextRole !== "global_admin") {
    throw new Error("You cannot remove your own admin role.");
  }

  if (actorUserId === targetUserId && nextStatus === "blocked") {
    throw new Error("You cannot block your own account.");
  }

  if (toDashboardUserRole(target.role) === "global_admin" && nextRole !== "global_admin") {
    const adminCount = await countGlobalAdmins(db);
    if (adminCount <= 1) {
      throw new Error("At least one global admin must remain.");
    }
  }

  await db.prepare("UPDATE dashboard_users SET role = ?, status = ? WHERE id = ?")
    .bind(nextRole, nextStatus, targetUserId)
    .run();

  if (nextStatus === "blocked") {
    await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();
  }

  const updated = await firstRecord(
    db,
    `
      SELECT id, name, email, role, status, created_at, last_login_at, password_changed_at
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
    `,
    targetUserId
  );

  if (!updated) {
    throw new Error("User not found after update.");
  }

  return toDashboardUser(updated);
}

export async function adminSetUserPassword(
  dbInput: DatabaseBinding | undefined,
  targetUserId: string,
  nextPassword: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  if (nextPassword.trim().length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const target = await firstRecord(db, "SELECT id FROM dashboard_users WHERE id = ? LIMIT 1", targetUserId);
  if (!target) {
    throw new Error("User not found.");
  }

  const passwordChangedAt = nowIso();
  await db.prepare(
    "UPDATE dashboard_users SET password_hash = ?, password_changed_at = ? WHERE id = ?"
  )
    .bind(await sha256Hex(nextPassword), passwordChangedAt, targetUserId)
    .run();

  await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();

  return { password_changed_at: passwordChangedAt };
}

export async function deleteAdminUser(
  dbInput: DatabaseBinding | undefined,
  actorUserId: string,
  targetUserId: string
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  if (actorUserId === targetUserId) {
    throw new Error("You cannot delete your own account.");
  }

  const target = await firstRecord(db, "SELECT id, role FROM dashboard_users WHERE id = ? LIMIT 1", targetUserId);
  if (!target) {
    return false;
  }

  if (toDashboardUserRole(target.role) === "global_admin") {
    const adminCount = await countGlobalAdmins(db);
    if (adminCount <= 1) {
      throw new Error("At least one global admin must remain.");
    }
  }

  await db.prepare("DELETE FROM dashboard_sessions WHERE user_id = ?").bind(targetUserId).run();
  await db.prepare("DELETE FROM dashboard_users WHERE id = ?").bind(targetUserId).run();
  return true;
}

export async function listAdminSites(dbInput: DatabaseBinding | undefined): Promise<AdminSiteRecord[]> {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const siteRecords = await allRecords(
    db,
    `
      SELECT id, org_id, org_name, project_id, project_name, name, environment, collector_url, created_at
      FROM sites
      ORDER BY created_at ASC, name ASC
    `
  );

  return Promise.all(
    siteRecords.map(async (siteRecord) => {
      const site = toDashboardSite(siteRecord);
      const [domains, apiKeys, metrics] = await Promise.all([
        listSiteDomains(db, site.id),
        listSiteKeys(db, site.id),
        firstRecord(
          db,
          `
            SELECT COUNT(*) AS collected_event_count, MAX(received_at) AS last_event_at
            FROM collected_events
            WHERE site_id = ?
          `,
          site.id
        )
      ]);

      return {
        ...site,
        domain_count: domains.length,
        api_key_count: apiKeys.length,
        collected_event_count: Number(metrics?.collected_event_count ?? 0),
        last_event_at: asNullableString(metrics?.last_event_at),
        domains,
        api_keys: apiKeys
      } satisfies AdminSiteRecord;
    })
  );
}

export async function createAdminSite(
  dbInput: DatabaseBinding | undefined,
  input: {
    name: string;
    domain?: string;
    org_name?: string;
    project_name?: string;
    environment?: string;
  }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const name = input.name.trim();
  const domain = input.domain ? normalizeDomain(input.domain) : "";
  const orgName = input.org_name?.trim() || DEFAULT_ORG_NAME;
  const projectName = input.project_name?.trim() || DEFAULT_PROJECT_NAME;
  const environment = (input.environment?.trim().toLowerCase() || DEFAULT_ENVIRONMENT) as string;

  if (name.length < 2) {
    throw new Error("Site name must contain at least 2 characters.");
  }

  if (domain) {
    const existingDomain = await firstRecord(db, "SELECT id FROM site_domains WHERE domain = ? LIMIT 1", domain);
    if (existingDomain) {
      throw new Error("This domain already exists.");
    }
  }

  const createdAt = nowIso();
  const siteId = `site_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const site = {
    id: siteId,
    org_id: `org_${toIdSegment(orgName, "open")}`,
    org_name: orgName,
    project_id: `project_${toIdSegment(projectName, "gateway")}`,
    project_name: projectName,
    name,
    environment,
    collector_url: "https://e.eventsgateway.com/v1/collect",
    created_at: createdAt
  } satisfies DashboardSite;

  await db.prepare(
    `
      INSERT INTO sites (
        id,
        org_id,
        org_name,
        project_id,
        project_name,
        name,
        environment,
        collector_url,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      site.id,
      site.org_id,
      site.org_name,
      site.project_id,
      site.project_name,
      site.name,
      site.environment,
      site.collector_url,
      site.created_at
    )
    .run();

  if (domain) {
    await db.prepare(
      `
        INSERT INTO site_domains (id, site_id, domain, kind, status, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        site.id,
        domain,
        "production",
        "verified",
        "Primary production domain",
        createdAt
      )
      .run();
  }

  const publicKey = createPublicKey();
  await db.prepare(
    `
      INSERT INTO site_keys (id, site_id, label, public_key, key_hash, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      crypto.randomUUID(),
      site.id,
      "Primary collect key",
      publicKey,
      await sha256Hex(publicKey),
      "active",
      createdAt
    )
    .run();

  return site;
}

export async function deleteAdminSite(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const site = await firstRecord(db, "SELECT id FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    return false;
  }

  if (siteId === DEFAULT_SITE_ID) {
    throw new Error("The primary production site cannot be deleted.");
  }

  await db.prepare("DELETE FROM site_domains WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM site_keys WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM collected_events WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM identity_profiles WHERE site_id = ?").bind(siteId).run();
  await db.prepare("DELETE FROM sites WHERE id = ?").bind(siteId).run();
  return true;
}

export async function listSiteDomains(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, domain, kind, status, description, created_at
      FROM site_domains
      WHERE site_id = ?
      ORDER BY kind ASC, domain ASC
    `,
    siteId
  );
  return records.map(toSiteDomain);
}

export async function addSiteDomain(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { domain: string; kind?: string; description?: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const domain = normalizeDomain(input.domain);
  if (!domain) {
    throw new Error("Enter a valid domain.");
  }

  const existing = await firstRecord(db, "SELECT id FROM site_domains WHERE domain = ? LIMIT 1", domain);
  if (existing) {
    throw new Error("This domain already exists.");
  }

  const createdAt = nowIso();
  const record = {
    id: crypto.randomUUID(),
    site_id: siteId,
    domain,
    kind: (input.kind ?? "production").trim() || "production",
    status: "verified",
    description: input.description?.trim() || null,
    created_at: createdAt
  };

  await db.prepare(
    `
      INSERT INTO site_domains (id, site_id, domain, kind, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(record.id, record.site_id, record.domain, record.kind, record.status, record.description, record.created_at)
    .run();

  return record;
}

export async function deleteSiteDomain(dbInput: DatabaseBinding | undefined, siteId: string, domainId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const domain = await firstRecord(db, "SELECT id, domain FROM site_domains WHERE id = ? AND site_id = ? LIMIT 1", domainId, siteId);
  if (!domain) return false;

  const normalized = asString(domain.domain);
  if (normalized === "goldring.ro" || normalized === "www.goldring.ro") {
    throw new Error("The seeded production domains cannot be removed.");
  }

  await db.prepare("DELETE FROM site_domains WHERE id = ?").bind(domainId).run();
  return true;
}

export async function listSiteKeys(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const records = await allRecords(
    db,
    `
      SELECT id, site_id, label, public_key, status, created_at, last_used_at
      FROM site_keys
      WHERE site_id = ?
      ORDER BY created_at ASC
    `,
    siteId
  );
  return records.map(toSiteKey);
}

export async function createAdminSiteKey(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { label: string }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const site = await firstRecord(db, "SELECT id FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    throw new Error("Site not found.");
  }

  const label = input.label.trim();
  if (label.length < 2) {
    throw new Error("Key label must contain at least 2 characters.");
  }

  const createdAt = nowIso();
  const publicKey = createPublicKey();
  const record = {
    id: crypto.randomUUID(),
    site_id: siteId,
    label,
    public_key: publicKey,
    status: "active",
    created_at: createdAt,
    last_used_at: null
  } satisfies SiteKey;

  await db.prepare(
    `
      INSERT INTO site_keys (id, site_id, label, public_key, key_hash, status, created_at, last_used_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      record.id,
      record.site_id,
      record.label,
      record.public_key,
      await sha256Hex(record.public_key),
      record.status,
      record.created_at,
      record.last_used_at
    )
    .run();

  return record;
}

export async function revokeAdminSiteKey(dbInput: DatabaseBinding | undefined, siteId: string, keyId: string) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const key = await firstRecord(
    db,
    `
      SELECT id, site_id, label, public_key, status, created_at, last_used_at
      FROM site_keys
      WHERE site_id = ? AND id = ?
      LIMIT 1
    `,
    siteId,
    keyId
  );
  if (!key) {
    return null;
  }

  if (asString(key.status) === "active") {
    const activeKeyCount = await countRecords(
      db,
      "SELECT COUNT(*) AS count FROM site_keys WHERE site_id = ? AND status = 'active'",
      siteId
    );
    if (activeKeyCount <= 1) {
      throw new Error("At least one active collector key must remain.");
    }

    await db.prepare("UPDATE site_keys SET status = 'revoked' WHERE id = ?").bind(keyId).run();
  }

  return {
    ...toSiteKey(key),
    status: asString(key.status) === "active" ? "revoked" : asString(key.status)
  } satisfies SiteKey;
}

export async function getPrimarySiteKey(dbInput: DatabaseBinding | undefined, siteId: string) {
  const keys = await listSiteKeys(dbInput, siteId);
  const key = keys.find((item) => item.status === "active");
  if (!key) {
    throw new Error("No active site key exists.");
  }

  return key;
}

export async function getInstallConfigFromDb(dbInput: DatabaseBinding | undefined, siteId: string) {
  const site = await getDefaultSite(dbInput);
  if (site.id !== siteId) {
    throw new Error("Site not found.");
  }

  const key = await getPrimarySiteKey(dbInput, siteId);
  const snippet = [
    "<script>",
    "  (function () {",
    "    const collector = 'https://e.eventsgateway.com/v1/collect';",
    `    const siteId = '${site.id}';`,
    `    const apiKey = '${key.public_key}';`,
    "    window.e_g = window.e_g || function (type, properties) {",
    "      const payload = {",
    "        site_id: siteId,",
    "        api_key: apiKey,",
    "        type: type,",
    "        source: 'browser',",
    "        environment: 'production',",
    "        page: { path: location.pathname, url: location.href, title: document.title },",
    "        properties: properties || {}",
    "      };",
    "      navigator.sendBeacon(",
    "        collector,",
    "        new Blob([JSON.stringify(payload)], { type: 'application/json' })",
    "      );",
    "    };",
    "    window.e_g('PageView');",
    "  })();",
    "</script>"
  ].join("\n");

  return {
    collector_url: site.collector_url,
    npm_package: "@eventsgateway/tracker-sdk",
    site_id: site.id,
    site_name: site.name,
    public_key: key.public_key,
    sdk_loader: snippet,
    sample_init: [
      "window.e_g('Purchase', {",
      "  order_id: 'ORDER-1001',",
      "  value: 249.99,",
      "  currency: 'RON'",
      "});"
    ].join("\n")
  };
}

export async function validateCollectAccess(
  dbInput: DatabaseBinding | undefined,
  input: { siteId: string; apiKey: string; origin?: string | null }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);

  const site = await firstRecord(db, "SELECT id, name FROM sites WHERE id = ? LIMIT 1", input.siteId);
  if (!site) return null;

  const keyHash = await sha256Hex(input.apiKey);
  const key = await firstRecord(
    db,
    "SELECT id FROM site_keys WHERE site_id = ? AND key_hash = ? AND status = 'active' LIMIT 1",
    input.siteId,
    keyHash
  );
  if (!key) return null;

  const normalizedOrigin = input.origin ? normalizeDomain(input.origin) : "";
  if (normalizedOrigin) {
    const allowed = await firstRecord(
      db,
      "SELECT id FROM site_domains WHERE site_id = ? AND domain = ? LIMIT 1",
      input.siteId,
      normalizedOrigin
    );
    if (!allowed) return null;
  }

  await db.prepare("UPDATE site_keys SET last_used_at = ? WHERE id = ?").bind(nowIso(), asString(key.id)).run();
  return {
    site_id: asString(site.id),
    site_name: asString(site.name),
    origin_domain: normalizedOrigin || null
  };
}

export async function storeCollectedEvent(
  dbInput: DatabaseBinding | undefined,
  input: {
    siteId: string;
    originDomain?: string | null;
    event: {
      event_id?: string;
      type: string;
      source: string;
      environment: string;
      canonical_user_id?: string;
      anonymous_id?: string;
      session_id?: string;
      page?: { path?: string; url?: string };
      destination?: string;
      consent?: { analytics?: boolean; ads?: boolean; functional?: boolean };
      payload: unknown;
    };
  }
) {
  const db = ensureDb(dbInput);
  await ensureControlPlane(db);
  const receivedAt = nowIso();
  const eventId = input.event.event_id?.trim() || crypto.randomUUID();

  await db.prepare(
    `
      INSERT INTO collected_events (
        id,
        site_id,
        event_id,
        event_type,
        source,
        environment,
        canonical_user_id,
        anonymous_id,
        session_id,
        page_path,
        page_url,
        origin_domain,
        destination,
        status,
        consent_analytics,
        consent_ads,
        consent_functional,
        payload_json,
        received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      crypto.randomUUID(),
      input.siteId,
      eventId,
      input.event.type,
      input.event.source,
      input.event.environment,
      input.event.canonical_user_id ?? null,
      input.event.anonymous_id ?? null,
      input.event.session_id ?? null,
      input.event.page?.path ?? null,
      input.event.page?.url ?? null,
      input.originDomain ?? null,
      input.event.destination ?? null,
      "accepted",
      input.event.consent?.analytics ? 1 : 0,
      input.event.consent?.ads ? 1 : 0,
      input.event.consent?.functional ? 1 : 0,
      JSON.stringify(input.event.payload),
      receivedAt
    )
    .run();

  if (input.event.canonical_user_id) {
    const existing = await firstRecord(
      db,
      `
        SELECT anonymous_ids_json, session_ids_json
        FROM identity_profiles
        WHERE site_id = ? AND canonical_user_id = ?
        LIMIT 1
      `,
      input.siteId,
      input.event.canonical_user_id
    );

    const anonymousIds = new Set<string>(
      existing?.anonymous_ids_json ? (JSON.parse(asString(existing.anonymous_ids_json)) as string[]) : []
    );
    const sessionIds = new Set<string>(
      existing?.session_ids_json ? (JSON.parse(asString(existing.session_ids_json)) as string[]) : []
    );

    if (input.event.anonymous_id) anonymousIds.add(input.event.anonymous_id);
    if (input.event.session_id) sessionIds.add(input.event.session_id);

    await db.prepare(
      `
        INSERT INTO identity_profiles (
          site_id,
          canonical_user_id,
          anonymous_ids_json,
          session_ids_json,
          consent_analytics,
          consent_ads,
          consent_functional,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(site_id, canonical_user_id) DO UPDATE SET
          anonymous_ids_json = excluded.anonymous_ids_json,
          session_ids_json = excluded.session_ids_json,
          consent_analytics = excluded.consent_analytics,
          consent_ads = excluded.consent_ads,
          consent_functional = excluded.consent_functional,
          updated_at = excluded.updated_at
      `
    )
      .bind(
        input.siteId,
        input.event.canonical_user_id,
        JSON.stringify(Array.from(anonymousIds)),
        JSON.stringify(Array.from(sessionIds)),
        input.event.consent?.analytics ? 1 : 0,
        input.event.consent?.ads ? 1 : 0,
        input.event.consent?.functional ? 1 : 0,
        receivedAt
      )
      .run();
  }

  return {
    accepted: true,
    event_id: eventId,
    received_at: receivedAt
  };
}
