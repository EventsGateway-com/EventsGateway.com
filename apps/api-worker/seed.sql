INSERT OR IGNORE INTO sites (
  id,
  org_id,
  org_name,
  project_id,
  project_name,
  name,
  environment,
  collector_url,
  created_at
) VALUES (
  'site_alpha',
  'org_open',
  'Open Commerce Lab',
  'project_gateway',
  'Events Core',
  'goldring.ro',
  'production',
  'https://e.eventsgateway.com/v1/collect',
  '2026-05-28T00:00:00.000Z'
);

UPDATE sites
SET
  name = 'goldring.ro',
  environment = 'production',
  collector_url = 'https://e.eventsgateway.com/v1/collect',
  org_name = 'Open Commerce Lab',
  project_name = 'Events Core'
WHERE id = 'site_alpha';

INSERT OR IGNORE INTO site_domains (
  id,
  site_id,
  domain,
  kind,
  status,
  description,
  created_at
) VALUES
  ('domain_goldring_ro', 'site_alpha', 'goldring.ro', 'production', 'verified', 'Primary production storefront', '2026-05-28T00:00:00.000Z'),
  ('domain_www_goldring_ro', 'site_alpha', 'www.goldring.ro', 'production', 'verified', 'Production alias', '2026-05-28T00:00:00.000Z'),
  ('domain_dash_eventsgateway_com', 'site_alpha', 'dash.eventsgateway.com', 'internal', 'internal', 'Dashboard control plane', '2026-05-28T00:00:00.000Z');

INSERT OR IGNORE INTO site_keys (
  id,
  site_id,
  label,
  public_key,
  key_hash,
  status,
  created_at
) VALUES (
  'key_goldring_browser_collect',
  'site_alpha',
  'Browser collect key',
  'egp_goldring_ro_live_2026',
  'ac819ceb429c93bc9ac2d3ef561ebd487e199ebf1a52b28b3caffb9e6388bd57',
  'active',
  '2026-05-28T00:00:00.000Z'
);
