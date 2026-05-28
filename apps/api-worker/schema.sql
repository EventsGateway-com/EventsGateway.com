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
