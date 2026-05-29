import type { DatabaseBinding, EnvironmentBindings } from "./index";

type DatabaseRecord = Record<string, unknown>;

export type BillingPlanCode = "free" | "growth" | "enterprise";
export type BillingSubscriptionStatus = "active" | "past_due" | "suspended" | "canceled";
export type BillingInvoiceStatus = "draft" | "open" | "paid" | "void" | "past_due";
export type BillingTransactionStatus = "pending" | "succeeded" | "failed";
export type BillingReminderStatus = "scheduled" | "sent" | "canceled";

export type BillingSubscription = {
  id: string;
  site_id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  plan_code: BillingPlanCode;
  status: BillingSubscriptionStatus;
  included_events: number;
  overage_block_events: number;
  overage_block_price_usd: number;
  monthly_events_used: number;
  current_period_start: string;
  current_period_end: string;
  grace_period_ends_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingCustomer = {
  id: string;
  site_id: string;
  stripe_customer_id: string | null;
  company_name: string;
  billing_name: string;
  billing_email: string;
  status: "active" | "blocked";
  payment_method_summary: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingInvoice = {
  id: string;
  site_id: string;
  customer_id: string;
  subscription_id: string;
  stripe_invoice_id: string | null;
  invoice_number: string;
  status: BillingInvoiceStatus;
  currency: string;
  subtotal_usd: number;
  overage_events: number;
  overage_blocks: number;
  total_usd: number;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
  period_start: string;
  period_end: string;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingTransaction = {
  id: string;
  site_id: string;
  invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount_usd: number;
  status: BillingTransactionStatus;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  created_at: string;
  paid_at: string | null;
};

export type BillingReminder = {
  id: string;
  site_id: string;
  invoice_id: string;
  days_before_due: number;
  scheduled_for: string;
  sent_at: string | null;
  status: BillingReminderStatus;
  channel: "email";
  created_at: string;
};

export type BillingAdminOverview = {
  totals: {
    subscriptions: number;
    active_subscriptions: number;
    past_due_subscriptions: number;
    suspended_subscriptions: number;
    monthly_revenue_usd: number;
    quarterly_revenue_usd: number;
    overdue_amount_usd: number;
    successful_transactions: number;
  };
  monthly_revenue: Array<{ month: string; total_usd: number }>;
  quarterly_revenue: Array<{ quarter: string; total_usd: number }>;
};

export type SiteBillingSummary = {
  customer: BillingCustomer;
  subscription: BillingSubscription;
  invoices: BillingInvoice[];
  transactions: BillingTransaction[];
  reminders: BillingReminder[];
  suspension: {
    is_suspended: boolean;
    reason: string | null;
    grace_period_ends_at: string | null;
  };
};

type StripeSessionResult = {
  provider: "stripe";
  mode: "setup" | "billing_portal";
  url: string;
  session_id?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function ensureDb(db?: DatabaseBinding) {
  if (!db) throw new Error("Missing D1 database binding.");
  return db;
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
  const row = await firstRecord(db, sql, ...params);
  return Number(row?.count ?? 0);
}

async function ensureBillingTables(dbInput?: DatabaseBinding) {
  const db = ensureDb(dbInput);

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_customers (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL UNIQUE,
        stripe_customer_id TEXT,
        company_name TEXT NOT NULL,
        billing_name TEXT NOT NULL,
        billing_email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        payment_method_summary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_subscriptions (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL UNIQUE,
        customer_id TEXT NOT NULL,
        stripe_subscription_id TEXT,
        plan_code TEXT NOT NULL,
        status TEXT NOT NULL,
        included_events INTEGER NOT NULL DEFAULT 1000000,
        overage_block_events INTEGER NOT NULL DEFAULT 1000000,
        overage_block_price_usd REAL NOT NULL DEFAULT 5,
        monthly_events_used INTEGER NOT NULL DEFAULT 0,
        current_period_start TEXT NOT NULL,
        current_period_end TEXT NOT NULL,
        grace_period_ends_at TEXT,
        suspended_at TEXT,
        suspension_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_invoices (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        customer_id TEXT NOT NULL,
        subscription_id TEXT NOT NULL,
        stripe_invoice_id TEXT,
        invoice_number TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        subtotal_usd REAL NOT NULL DEFAULT 0,
        overage_events INTEGER NOT NULL DEFAULT 0,
        overage_blocks INTEGER NOT NULL DEFAULT 0,
        total_usd REAL NOT NULL DEFAULT 0,
        hosted_invoice_url TEXT,
        pdf_url TEXT,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        due_at TEXT,
        paid_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_transactions (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        invoice_id TEXT,
        stripe_payment_intent_id TEXT,
        stripe_charge_id TEXT,
        amount_usd REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        payment_method_brand TEXT,
        payment_method_last4 TEXT,
        created_at TEXT NOT NULL,
        paid_at TEXT
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_reminders (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        invoice_id TEXT NOT NULL,
        days_before_due INTEGER NOT NULL,
        scheduled_for TEXT NOT NULL,
        sent_at TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        channel TEXT NOT NULL DEFAULT 'email',
        created_at TEXT NOT NULL
      )
    `
  ).run();

  await db.prepare(
    `
      CREATE TABLE IF NOT EXISTS billing_webhook_events (
        id TEXT PRIMARY KEY,
        stripe_event_id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        processed_at TEXT
      )
    `
  ).run();
}

async function seedSiteBilling(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);

  const site = await firstRecord(db, "SELECT id, name, org_name, project_name FROM sites WHERE id = ? LIMIT 1", siteId);
  if (!site) {
    throw new Error(`Site ${siteId} does not exist.`);
  }

  const existingCustomer = await firstRecord(db, "SELECT id FROM billing_customers WHERE site_id = ? LIMIT 1", siteId);
  if (!existingCustomer) {
    const operator = await firstRecord(
      db,
      "SELECT name, email FROM dashboard_users WHERE status = 'active' ORDER BY role DESC, created_at ASC LIMIT 1"
    );
    const createdAt = nowIso();
    await db.prepare(
      `
        INSERT INTO billing_customers (
          id, site_id, stripe_customer_id, company_name, billing_name, billing_email, status,
          payment_method_summary, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        siteId,
        null,
        asString(site.org_name) || asString(site.name),
        asString(operator?.name) || "Platform Operator",
        asString(operator?.email) || "billing@eventsgateway.com",
        "active",
        "No payment method on file yet.",
        createdAt,
        createdAt
      )
      .run();
  }

  const existingSubscription = await firstRecord(db, "SELECT id FROM billing_subscriptions WHERE site_id = ? LIMIT 1", siteId);
  if (!existingSubscription) {
    const customer = await firstRecord(db, "SELECT id FROM billing_customers WHERE site_id = ? LIMIT 1", siteId);
    const createdAt = nowIso();
    await db.prepare(
      `
        INSERT INTO billing_subscriptions (
          id, site_id, customer_id, stripe_subscription_id, plan_code, status,
          included_events, overage_block_events, overage_block_price_usd, monthly_events_used,
          current_period_start, current_period_end, grace_period_ends_at, suspended_at, suspension_reason,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        crypto.randomUUID(),
        siteId,
        asString(customer?.id),
        null,
        "free",
        "active",
        1000000,
        1000000,
        5,
        0,
        createdAt,
        daysFromNow(30),
        null,
        null,
        null,
        createdAt,
        createdAt
      )
      .run();
  }

  await syncBillingUsage(db, siteId);
}

async function syncBillingUsage(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);

  const subscription = await firstRecord(db, "SELECT id, current_period_start, current_period_end, included_events, overage_block_events FROM billing_subscriptions WHERE site_id = ? LIMIT 1", siteId);
  if (!subscription) return;

  const currentPeriodStart = asString(subscription.current_period_start) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const currentPeriodEnd = asString(subscription.current_period_end) || nowIso();
  const usedEvents = await countRecords(
    db,
    `
      SELECT COUNT(DISTINCT ce.event_id) AS count
      FROM collected_events ce
      INNER JOIN delivery_attempts da ON da.collected_event_id = ce.id
      WHERE ce.site_id = ?
        AND datetime(da.queued_at) >= datetime(?)
        AND datetime(da.queued_at) <= datetime(?)
    `,
    siteId,
    currentPeriodStart,
    currentPeriodEnd
  );

  const includedEvents = asNumber(subscription.included_events) || 1000000;
  const overageBlockEvents = asNumber(subscription.overage_block_events) || 1000000;
  const overageEvents = Math.max(0, usedEvents - includedEvents);
  const overageBlocks = overageEvents === 0 ? 0 : Math.ceil(overageEvents / overageBlockEvents);

  await db.prepare("UPDATE billing_subscriptions SET monthly_events_used = ?, updated_at = ? WHERE id = ?")
    .bind(usedEvents, nowIso(), asString(subscription.id))
    .run();

  const invoiceCount = await countRecords(
    db,
    "SELECT COUNT(*) AS count FROM billing_invoices WHERE site_id = ? AND period_start = ? AND period_end = ?",
    siteId,
    currentPeriodStart,
    currentPeriodEnd
  );

  if (invoiceCount === 0) {
    const customer = await firstRecord(db, "SELECT id FROM billing_customers WHERE site_id = ? LIMIT 1", siteId);
    const invoiceId = crypto.randomUUID();
    const now = nowIso();
    const totalUsd = overageBlocks * 5;
    const invoiceNumber = `EG-${new Date().getUTCFullYear()}-${String(Math.max(1, Date.now())).slice(-8)}`;

    await db.prepare(
      `
        INSERT INTO billing_invoices (
          id, site_id, customer_id, subscription_id, stripe_invoice_id, invoice_number, status, currency,
          subtotal_usd, overage_events, overage_blocks, total_usd, hosted_invoice_url, pdf_url,
          period_start, period_end, due_at, paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(
        invoiceId,
        siteId,
        asString(customer?.id),
        asString(subscription.id),
        null,
        invoiceNumber,
        totalUsd > 0 ? "open" : "paid",
        "USD",
        totalUsd,
        overageEvents,
        overageBlocks,
        totalUsd,
        null,
        null,
        currentPeriodStart,
        currentPeriodEnd,
        totalUsd > 0 ? daysFromNow(7) : now,
        totalUsd > 0 ? null : now,
        now,
        now
      )
      .run();

    if (totalUsd === 0) {
      await db.prepare(
        `
          INSERT INTO billing_transactions (
            id, site_id, invoice_id, stripe_payment_intent_id, stripe_charge_id, amount_usd, status,
            payment_method_brand, payment_method_last4, created_at, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(crypto.randomUUID(), siteId, invoiceId, null, null, 0, "succeeded", null, null, now, now)
        .run();
    }
  }

  await syncInvoiceStatuses(db, siteId);
}

async function ensureReminderSchedule(dbInput: DatabaseBinding | undefined, invoice: BillingInvoice) {
  const db = ensureDb(dbInput);
  if (!invoice.due_at || invoice.status === "paid" || invoice.status === "void") return;

  for (const daysBefore of [7, 3, 1, 0]) {
    const scheduledFor = new Date(Date.parse(invoice.due_at) - daysBefore * 24 * 60 * 60 * 1000).toISOString();
    const exists = await countRecords(
      db,
      "SELECT COUNT(*) AS count FROM billing_reminders WHERE invoice_id = ? AND days_before_due = ?",
      invoice.id,
      daysBefore
    );
    if (exists > 0) continue;

    await db.prepare(
      `
        INSERT INTO billing_reminders (
          id, site_id, invoice_id, days_before_due, scheduled_for, sent_at, status, channel, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
      .bind(crypto.randomUUID(), invoice.site_id, invoice.id, daysBefore, scheduledFor, null, "scheduled", "email", nowIso())
      .run();
  }
}

async function syncInvoiceStatuses(dbInput: DatabaseBinding | undefined, siteId: string) {
  const db = ensureDb(dbInput);
  const invoices = await listSiteBillingInvoices(db, siteId);
  const now = Date.now();

  for (const invoice of invoices) {
    if (invoice.status === "paid" || invoice.status === "void") continue;
    if (invoice.due_at && Date.parse(invoice.due_at) < now) {
      await db.prepare("UPDATE billing_invoices SET status = 'past_due', updated_at = ? WHERE id = ?")
        .bind(nowIso(), invoice.id)
        .run();
    }
    await ensureReminderSchedule(db, invoice);
  }

  const oldestPastDue = await firstRecord(
    db,
    `
      SELECT id, due_at
      FROM billing_invoices
      WHERE site_id = ? AND status = 'past_due'
      ORDER BY due_at ASC
      LIMIT 1
    `,
    siteId
  );

  if (!oldestPastDue) {
    await db.prepare(
      `
        UPDATE billing_subscriptions
        SET status = CASE WHEN status = 'suspended' THEN 'active' ELSE status END,
            suspended_at = NULL,
            suspension_reason = NULL,
            grace_period_ends_at = NULL,
            updated_at = ?
        WHERE site_id = ? AND status IN ('active', 'past_due', 'suspended')
      `
    )
      .bind(nowIso(), siteId)
      .run();
    return;
  }

  const dueAt = Date.parse(asString(oldestPastDue.due_at));
  const gracePeriodEndsAt = new Date(dueAt + 15 * 24 * 60 * 60 * 1000).toISOString();
  const isSuspended = dueAt + 15 * 24 * 60 * 60 * 1000 <= now;

  await db.prepare(
    `
      UPDATE billing_subscriptions
      SET status = ?,
          grace_period_ends_at = ?,
          suspended_at = ?,
          suspension_reason = ?,
          updated_at = ?
      WHERE site_id = ?
    `
  )
    .bind(
      isSuspended ? "suspended" : "past_due",
      gracePeriodEndsAt,
      isSuspended ? nowIso() : null,
      "Routing is suspended because payment remained overdue for more than 15 days.",
      nowIso(),
      siteId
    )
    .run();
}

function toBillingCustomer(record: DatabaseRecord): BillingCustomer {
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    stripe_customer_id: asNullableString(record.stripe_customer_id),
    company_name: asString(record.company_name),
    billing_name: asString(record.billing_name),
    billing_email: asString(record.billing_email),
    status: asString(record.status) === "blocked" ? "blocked" : "active",
    payment_method_summary: asNullableString(record.payment_method_summary),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at)
  };
}

function toBillingSubscription(record: DatabaseRecord): BillingSubscription {
  const status = asString(record.status);
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    customer_id: asString(record.customer_id),
    stripe_subscription_id: asNullableString(record.stripe_subscription_id),
    plan_code: (["free", "growth", "enterprise"].includes(asString(record.plan_code)) ? asString(record.plan_code) : "free") as BillingPlanCode,
    status: (["active", "past_due", "suspended", "canceled"].includes(status) ? status : "active") as BillingSubscriptionStatus,
    included_events: asNumber(record.included_events),
    overage_block_events: asNumber(record.overage_block_events),
    overage_block_price_usd: asNumber(record.overage_block_price_usd),
    monthly_events_used: asNumber(record.monthly_events_used),
    current_period_start: asString(record.current_period_start),
    current_period_end: asString(record.current_period_end),
    grace_period_ends_at: asNullableString(record.grace_period_ends_at),
    suspended_at: asNullableString(record.suspended_at),
    suspension_reason: asNullableString(record.suspension_reason),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at)
  };
}

function toBillingInvoice(record: DatabaseRecord): BillingInvoice {
  const status = asString(record.status);
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    customer_id: asString(record.customer_id),
    subscription_id: asString(record.subscription_id),
    stripe_invoice_id: asNullableString(record.stripe_invoice_id),
    invoice_number: asString(record.invoice_number),
    status: (["draft", "open", "paid", "void", "past_due"].includes(status) ? status : "draft") as BillingInvoiceStatus,
    currency: asString(record.currency) || "USD",
    subtotal_usd: asNumber(record.subtotal_usd),
    overage_events: asNumber(record.overage_events),
    overage_blocks: asNumber(record.overage_blocks),
    total_usd: asNumber(record.total_usd),
    hosted_invoice_url: asNullableString(record.hosted_invoice_url),
    pdf_url: asNullableString(record.pdf_url),
    period_start: asString(record.period_start),
    period_end: asString(record.period_end),
    due_at: asNullableString(record.due_at),
    paid_at: asNullableString(record.paid_at),
    created_at: asString(record.created_at),
    updated_at: asString(record.updated_at)
  };
}

function toBillingTransaction(record: DatabaseRecord): BillingTransaction {
  const status = asString(record.status);
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    invoice_id: asNullableString(record.invoice_id),
    stripe_payment_intent_id: asNullableString(record.stripe_payment_intent_id),
    stripe_charge_id: asNullableString(record.stripe_charge_id),
    amount_usd: asNumber(record.amount_usd),
    status: (["pending", "succeeded", "failed"].includes(status) ? status : "pending") as BillingTransactionStatus,
    payment_method_brand: asNullableString(record.payment_method_brand),
    payment_method_last4: asNullableString(record.payment_method_last4),
    created_at: asString(record.created_at),
    paid_at: asNullableString(record.paid_at)
  };
}

function toBillingReminder(record: DatabaseRecord): BillingReminder {
  const status = asString(record.status);
  return {
    id: asString(record.id),
    site_id: asString(record.site_id),
    invoice_id: asString(record.invoice_id),
    days_before_due: asNumber(record.days_before_due),
    scheduled_for: asString(record.scheduled_for),
    sent_at: asNullableString(record.sent_at),
    status: (["scheduled", "sent", "canceled"].includes(status) ? status : "scheduled") as BillingReminderStatus,
    channel: "email",
    created_at: asString(record.created_at)
  };
}

export async function listAdminBillingSubscriptions(dbInput?: DatabaseBinding) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);
  const rows = await allRecords(
    db,
    `
      SELECT
        s.*,
        c.company_name,
        c.billing_email
      FROM billing_subscriptions s
      INNER JOIN billing_customers c ON c.id = s.customer_id
      ORDER BY s.updated_at DESC
    `
  );

  return rows.map((row) => ({
    ...toBillingSubscription(row),
    company_name: asString(row.company_name),
    billing_email: asString(row.billing_email)
  }));
}

export async function listAdminBillingTransactions(dbInput?: DatabaseBinding) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);
  const rows = await allRecords(
    db,
    `
      SELECT
        t.*,
        i.invoice_number,
        c.company_name,
        c.billing_email
      FROM billing_transactions t
      LEFT JOIN billing_invoices i ON i.id = t.invoice_id
      LEFT JOIN billing_customers c ON c.site_id = t.site_id
      ORDER BY COALESCE(t.paid_at, t.created_at) DESC
    `
  );

  return rows.map((row) => ({
    ...toBillingTransaction(row),
    invoice_number: asNullableString(row.invoice_number),
    company_name: asString(row.company_name),
    billing_email: asString(row.billing_email)
  }));
}

export async function getAdminBillingOverview(dbInput?: DatabaseBinding): Promise<BillingAdminOverview> {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);

  const [subscriptions, transactions, invoiceRows] = await Promise.all([
    listAdminBillingSubscriptions(db),
    listAdminBillingTransactions(db),
    allRecords(db, "SELECT status, total_usd, paid_at, created_at FROM billing_invoices ORDER BY created_at DESC")
  ]);

  const invoices = invoiceRows.map((row) => ({
    status: asString(row.status),
    total_usd: asNumber(row.total_usd),
    paid_at: asNullableString(row.paid_at),
    created_at: asString(row.created_at)
  }));

  const monthlyRevenueMap = new Map<string, number>();
  const quarterlyRevenueMap = new Map<string, number>();

  for (const invoice of invoices) {
    const effectiveDate = invoice.paid_at || invoice.created_at;
    if (!effectiveDate) continue;
    const date = new Date(effectiveDate);
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const quarterKey = `${date.getUTCFullYear()}-Q${Math.floor(date.getUTCMonth() / 3) + 1}`;
    if (invoice.status === "paid") {
      monthlyRevenueMap.set(monthKey, roundToCents((monthlyRevenueMap.get(monthKey) ?? 0) + invoice.total_usd));
      quarterlyRevenueMap.set(quarterKey, roundToCents((quarterlyRevenueMap.get(quarterKey) ?? 0) + invoice.total_usd));
    }
  }

  const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, total_usd]) => ({ month, total_usd }));

  const quarterlyRevenue = Array.from(quarterlyRevenueMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-4)
    .map(([quarter, total_usd]) => ({ quarter, total_usd }));

  return {
    totals: {
      subscriptions: subscriptions.length,
      active_subscriptions: subscriptions.filter((item) => item.status === "active").length,
      past_due_subscriptions: subscriptions.filter((item) => item.status === "past_due").length,
      suspended_subscriptions: subscriptions.filter((item) => item.status === "suspended").length,
      monthly_revenue_usd: monthlyRevenue[monthlyRevenue.length - 1]?.total_usd ?? 0,
      quarterly_revenue_usd: quarterlyRevenue[quarterlyRevenue.length - 1]?.total_usd ?? 0,
      overdue_amount_usd: roundToCents(
        invoices.filter((item) => item.status === "past_due" || item.status === "open").reduce((sum, item) => sum + item.total_usd, 0)
      ),
      successful_transactions: transactions.filter((item) => item.status === "succeeded").length
    },
    monthly_revenue: monthlyRevenue,
    quarterly_revenue: quarterlyRevenue
  };
}

function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}

export async function updateAdminBillingSubscription(
  dbInput: DatabaseBinding | undefined,
  subscriptionId: string,
  input: {
    plan_code?: BillingPlanCode;
    status?: BillingSubscriptionStatus;
    included_events?: number;
    overage_block_price_usd?: number;
    suspension_reason?: string | null;
  }
) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);

  const current = await firstRecord(db, "SELECT * FROM billing_subscriptions WHERE id = ? LIMIT 1", subscriptionId);
  if (!current) {
    throw new Error("Billing subscription not found.");
  }

  const nextStatus = input.status ?? (asString(current.status) as BillingSubscriptionStatus);
  const suspensionReason = nextStatus === "suspended"
    ? input.suspension_reason ?? "Suspended manually by an administrator."
    : null;

  await db.prepare(
    `
      UPDATE billing_subscriptions
      SET plan_code = ?, status = ?, included_events = ?, overage_block_price_usd = ?,
          suspended_at = ?, suspension_reason = ?, updated_at = ?
      WHERE id = ?
    `
  )
    .bind(
      input.plan_code ?? asString(current.plan_code),
      nextStatus,
      input.included_events ?? asNumber(current.included_events),
      input.overage_block_price_usd ?? asNumber(current.overage_block_price_usd),
      nextStatus === "suspended" ? nowIso() : null,
      suspensionReason,
      nowIso(),
      subscriptionId
    )
    .run();

  const updated = await firstRecord(db, "SELECT * FROM billing_subscriptions WHERE id = ? LIMIT 1", subscriptionId);
  return toBillingSubscription(updated ?? current);
}

export async function issueAdminInvoice(
  dbInput: DatabaseBinding | undefined,
  siteId: string,
  input: { amount_usd: number; due_in_days?: number; note?: string }
) {
  const db = ensureDb(dbInput);
  await seedSiteBilling(db, siteId);

  const customer = await firstRecord(db, "SELECT * FROM billing_customers WHERE site_id = ? LIMIT 1", siteId);
  const subscription = await firstRecord(db, "SELECT * FROM billing_subscriptions WHERE site_id = ? LIMIT 1", siteId);
  if (!customer || !subscription) {
    throw new Error("Billing records are not ready for this site.");
  }

  const totalUsd = roundToCents(Math.max(0, input.amount_usd));
  const createdAt = nowIso();
  const invoiceId = crypto.randomUUID();
  const invoiceNumber = `EG-MANUAL-${String(Date.now()).slice(-9)}`;
  const dueAt = new Date(Date.now() + (input.due_in_days ?? 7) * 24 * 60 * 60 * 1000).toISOString();

  await db.prepare(
    `
      INSERT INTO billing_invoices (
        id, site_id, customer_id, subscription_id, stripe_invoice_id, invoice_number, status, currency,
        subtotal_usd, overage_events, overage_blocks, total_usd, hosted_invoice_url, pdf_url,
        period_start, period_end, due_at, paid_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      invoiceId,
      siteId,
      asString(customer.id),
      asString(subscription.id),
      null,
      invoiceNumber,
      totalUsd > 0 ? "open" : "paid",
      "USD",
      totalUsd,
      0,
      0,
      totalUsd,
      null,
      null,
      createdAt,
      dueAt,
      dueAt,
      totalUsd > 0 ? null : createdAt,
      createdAt,
      createdAt
    )
    .run();

  const invoice = await firstRecord(db, "SELECT * FROM billing_invoices WHERE id = ? LIMIT 1", invoiceId);
  if (invoice) {
    await ensureReminderSchedule(db, toBillingInvoice(invoice));
  }
  return toBillingInvoice(invoice ?? {});
}

export async function listSiteBillingInvoices(dbInput?: DatabaseBinding, siteId?: string) {
  const db = ensureDb(dbInput);
  if (!siteId) return [] as BillingInvoice[];
  await seedSiteBilling(db, siteId);
  const rows = await allRecords(
    db,
    "SELECT * FROM billing_invoices WHERE site_id = ? ORDER BY created_at DESC LIMIT 24",
    siteId
  );
  return rows.map(toBillingInvoice);
}

export async function getSiteBillingSummary(dbInput: DatabaseBinding | undefined, siteId: string): Promise<SiteBillingSummary> {
  const db = ensureDb(dbInput);
  await seedSiteBilling(db, siteId);
  await syncInvoiceStatuses(db, siteId);

  const [customerRow, subscriptionRow, invoices, transactionRows, reminderRows] = await Promise.all([
    firstRecord(db, "SELECT * FROM billing_customers WHERE site_id = ? LIMIT 1", siteId),
    firstRecord(db, "SELECT * FROM billing_subscriptions WHERE site_id = ? LIMIT 1", siteId),
    listSiteBillingInvoices(db, siteId),
    allRecords(db, "SELECT * FROM billing_transactions WHERE site_id = ? ORDER BY COALESCE(paid_at, created_at) DESC LIMIT 20", siteId),
    allRecords(db, "SELECT * FROM billing_reminders WHERE site_id = ? ORDER BY scheduled_for ASC LIMIT 20", siteId)
  ]);

  const customer = toBillingCustomer(customerRow ?? {});
  const subscription = toBillingSubscription(subscriptionRow ?? {});

  return {
    customer,
    subscription,
    invoices,
    transactions: transactionRows.map(toBillingTransaction),
    reminders: reminderRows.map(toBillingReminder),
    suspension: {
      is_suspended: subscription.status === "suspended",
      reason: subscription.suspension_reason,
      grace_period_ends_at: subscription.grace_period_ends_at
    }
  };
}

export async function getSiteRoutingAccessStatus(dbInput: DatabaseBinding | undefined, siteId: string) {
  const summary = await getSiteBillingSummary(dbInput, siteId);
  return {
    allowed: !summary.suspension.is_suspended,
    reason: summary.suspension.reason,
    grace_period_ends_at: summary.suspension.grace_period_ends_at
  };
}

async function createStripeCustomer(env: EnvironmentBindings, customer: BillingCustomer) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const response = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      email: customer.billing_email,
      name: customer.billing_name,
      description: `${customer.company_name} (${customer.site_id})`
    }).toString()
  });

  if (!response.ok) {
    throw new Error("Unable to create Stripe customer.");
  }

  const payload = await response.json() as { id?: string };
  if (!payload.id) {
    throw new Error("Stripe did not return a customer id.");
  }

  return payload.id;
}

async function ensureStripeCustomer(dbInput: DatabaseBinding | undefined, env: EnvironmentBindings, siteId: string) {
  const db = ensureDb(dbInput);
  const summary = await getSiteBillingSummary(db, siteId);
  if (summary.customer.stripe_customer_id) {
    return summary.customer.stripe_customer_id;
  }

  const stripeCustomerId = await createStripeCustomer(env, summary.customer);
  await db.prepare("UPDATE billing_customers SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
    .bind(stripeCustomerId, nowIso(), summary.customer.id)
    .run();
  return stripeCustomerId;
}

export async function createSiteBillingCheckoutSession(
  dbInput: DatabaseBinding | undefined,
  env: EnvironmentBindings,
  siteId: string
): Promise<StripeSessionResult> {
  const db = ensureDb(dbInput);
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const stripeCustomerId = await ensureStripeCustomer(db, env, siteId);
  const returnBaseUrl = env.STRIPE_BILLING_RETURN_URL || "https://dash.eventsgateway.com";
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      mode: "setup",
      customer: stripeCustomerId,
      success_url: `${returnBaseUrl}/app/orgs/org_open/projects/project_gateway/sites/${siteId}/settings/billing?checkout=success`,
      cancel_url: `${returnBaseUrl}/app/orgs/org_open/projects/project_gateway/sites/${siteId}/settings/billing?checkout=cancelled`
    }).toString()
  });

  if (!response.ok) {
    throw new Error("Unable to create a Stripe Checkout session.");
  }

  const payload = await response.json() as { id?: string; url?: string };
  if (!payload.url) {
    throw new Error("Stripe Checkout did not return a redirect url.");
  }

  return {
    provider: "stripe",
    mode: "setup",
    session_id: payload.id,
    url: payload.url
  };
}

export async function createSiteBillingPortalSession(
  dbInput: DatabaseBinding | undefined,
  env: EnvironmentBindings,
  siteId: string
): Promise<StripeSessionResult> {
  const db = ensureDb(dbInput);
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not configured.");
  }

  const stripeCustomerId = await ensureStripeCustomer(db, env, siteId);
  const returnBaseUrl = env.STRIPE_BILLING_RETURN_URL || "https://dash.eventsgateway.com";
  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      customer: stripeCustomerId,
      return_url: `${returnBaseUrl}/app/orgs/org_open/projects/project_gateway/sites/${siteId}/settings/billing`
    }).toString()
  });

  if (!response.ok) {
    throw new Error("Unable to create a Stripe Billing Portal session.");
  }

  const payload = await response.json() as { url?: string };
  if (!payload.url) {
    throw new Error("Stripe Billing Portal did not return a redirect url.");
  }

  return {
    provider: "stripe",
    mode: "billing_portal",
    url: payload.url
  };
}

async function verifyStripeWebhookSignature(env: EnvironmentBindings, payload: string, signatureHeader: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret is not configured.");
  }

  const parts = signatureHeader.split(",").map((item) => item.trim());
  const timestamp = parts.find((item) => item.startsWith("t="))?.slice(2);
  const signature = parts.find((item) => item.startsWith("v1="))?.slice(3);
  if (!timestamp || !signature) {
    throw new Error("Stripe signature header is invalid.");
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(signed)).map((item) => item.toString(16).padStart(2, "0")).join("");
  if (expected !== signature) {
    throw new Error("Stripe webhook signature verification failed.");
  }
}

export async function processStripeWebhook(
  dbInput: DatabaseBinding | undefined,
  env: EnvironmentBindings,
  signatureHeader: string,
  payload: string
) {
  const db = ensureDb(dbInput);
  await ensureBillingTables(db);
  await verifyStripeWebhookSignature(env, payload, signatureHeader);

  const event = JSON.parse(payload) as {
    id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };

  const eventId = asString(event.id);
  const eventType = asString(event.type);
  if (!eventId || !eventType) {
    throw new Error("Stripe webhook payload is missing id or type.");
  }

  const exists = await countRecords(db, "SELECT COUNT(*) AS count FROM billing_webhook_events WHERE stripe_event_id = ?", eventId);
  if (exists > 0) {
    return { received: true, duplicate: true };
  }

  await db.prepare(
    `
      INSERT INTO billing_webhook_events (
        id, stripe_event_id, type, payload_json, status, created_at, processed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(crypto.randomUUID(), eventId, eventType, payload, "received", nowIso(), null)
    .run();

  const object = (event.data?.object ?? {}) as Record<string, unknown>;
  const stripeCustomerId = asNullableString(object.customer);
  const stripeSubscriptionId = asNullableString(object.subscription);
  const stripeInvoiceId = asNullableString(object.id);

  if (eventType === "checkout.session.completed" && stripeCustomerId) {
    const customerId = await firstRecord(db, "SELECT id FROM billing_customers WHERE stripe_customer_id = ? LIMIT 1", stripeCustomerId);
    if (customerId) {
      const paymentMethodSummary = "Payment method saved in Stripe Checkout.";
      await db.prepare("UPDATE billing_customers SET payment_method_summary = ?, updated_at = ? WHERE id = ?")
        .bind(paymentMethodSummary, nowIso(), asString(customerId.id))
        .run();
    }
  }

  if ((eventType === "invoice.paid" || eventType === "invoice.payment_succeeded") && stripeInvoiceId) {
    const invoice = await firstRecord(db, "SELECT id, site_id, total_usd FROM billing_invoices WHERE stripe_invoice_id = ? OR invoice_number = ? LIMIT 1", stripeInvoiceId, asString(object.number));
    if (invoice) {
      await db.prepare("UPDATE billing_invoices SET status = 'paid', paid_at = ?, updated_at = ? WHERE id = ?")
        .bind(nowIso(), nowIso(), asString(invoice.id))
        .run();
      await db.prepare(
        `
          INSERT INTO billing_transactions (
            id, site_id, invoice_id, stripe_payment_intent_id, stripe_charge_id, amount_usd, status,
            payment_method_brand, payment_method_last4, created_at, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          crypto.randomUUID(),
          asString(invoice.site_id),
          asString(invoice.id),
          asNullableString(object.payment_intent),
          asNullableString(object.charge),
          asNumber(invoice.total_usd),
          "succeeded",
          asNullableString(object.payment_method_details?.card?.brand),
          asNullableString(object.payment_method_details?.card?.last4),
          nowIso(),
          nowIso()
        )
        .run();
      await syncInvoiceStatuses(db, asString(invoice.site_id));
    }
  }

  if (eventType === "invoice.payment_failed" && stripeInvoiceId) {
    const invoice = await firstRecord(db, "SELECT id, site_id, total_usd FROM billing_invoices WHERE stripe_invoice_id = ? OR invoice_number = ? LIMIT 1", stripeInvoiceId, asString(object.number));
    if (invoice) {
      await db.prepare("UPDATE billing_invoices SET status = 'past_due', updated_at = ? WHERE id = ?")
        .bind(nowIso(), asString(invoice.id))
        .run();
      await db.prepare(
        `
          INSERT INTO billing_transactions (
            id, site_id, invoice_id, stripe_payment_intent_id, stripe_charge_id, amount_usd, status,
            payment_method_brand, payment_method_last4, created_at, paid_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
        .bind(
          crypto.randomUUID(),
          asString(invoice.site_id),
          asString(invoice.id),
          asNullableString(object.payment_intent),
          asNullableString(object.charge),
          asNumber(invoice.total_usd),
          "failed",
          null,
          null,
          nowIso(),
          null
        )
        .run();
      await syncInvoiceStatuses(db, asString(invoice.site_id));
    }
  }

  if ((eventType === "customer.subscription.updated" || eventType === "customer.subscription.deleted") && stripeSubscriptionId) {
    const subscription = await firstRecord(db, "SELECT id, site_id FROM billing_subscriptions WHERE stripe_subscription_id = ? LIMIT 1", stripeSubscriptionId);
    if (subscription) {
      const stripeStatus = asString(object.status);
      const nextStatus: BillingSubscriptionStatus =
        stripeStatus === "past_due" ? "past_due"
        : stripeStatus === "canceled" || stripeStatus === "unpaid" ? "canceled"
        : "active";
      await db.prepare(
        "UPDATE billing_subscriptions SET status = ?, updated_at = ? WHERE id = ?"
      )
        .bind(nextStatus, nowIso(), asString(subscription.id))
        .run();
      await syncInvoiceStatuses(db, asString(subscription.site_id));
    }
  }

  await db.prepare("UPDATE billing_webhook_events SET status = 'processed', processed_at = ? WHERE stripe_event_id = ?")
    .bind(nowIso(), eventId)
    .run();

  return { received: true, duplicate: false };
}
