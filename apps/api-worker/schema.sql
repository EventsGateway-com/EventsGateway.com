CREATE TABLE IF NOT EXISTS dashboard_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  last_login_at TEXT,
  password_changed_at TEXT
);

CREATE TABLE IF NOT EXISTS dashboard_sessions (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  org_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  name TEXT NOT NULL,
  environment TEXT NOT NULL,
  collector_url TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_keys (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  label TEXT NOT NULL,
  public_key TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS collected_events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  environment TEXT NOT NULL,
  canonical_user_id TEXT,
  anonymous_id TEXT,
  session_id TEXT,
  page_path TEXT,
  page_url TEXT,
  origin_domain TEXT,
  destination TEXT,
  status TEXT NOT NULL,
  consent_analytics INTEGER NOT NULL DEFAULT 0,
  consent_ads INTEGER NOT NULL DEFAULT 0,
  consent_functional INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS identity_profiles (
  site_id TEXT NOT NULL,
  canonical_user_id TEXT NOT NULL,
  anonymous_ids_json TEXT NOT NULL,
  session_ids_json TEXT NOT NULL,
  consent_analytics INTEGER NOT NULL DEFAULT 0,
  consent_ads INTEGER NOT NULL DEFAULT 0,
  consent_functional INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (site_id, canonical_user_id)
);

CREATE TABLE IF NOT EXISTS delivery_attempts (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  collected_event_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  queued_at TEXT NOT NULL,
  sent_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS operation_jobs (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL,
  finished_at TEXT
);

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
);

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
);

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
);

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
);

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
);

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  processed_at TEXT
);
