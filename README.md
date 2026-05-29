# EventsGateway.com

Official repository for the EventsGateway public site and Cloudflare-hosted application surface.

EventsGateway is an open source tracking and event routing platform built for teams that want one controlled event flow for collection, normalization, routing, attribution, delivery, replay, and operational visibility.

## What This Repository Contains

This repository currently includes:

- the public marketing site for `eventsgateway.com`
- the public dashboard shell for `dash.eventsgateway.com`
- the unified Cloudflare Worker that serves `eventsgateway.com`, `dash.eventsgateway.com`, `api.eventsgateway.com`, and `e.eventsgateway.com`
- shared TypeScript packages used across the dashboard and Workers

## Product Scope

EventsGateway is designed for:

- Meta Conversions API
- GA4 Measurement Protocol
- Google Ads conversions
- TikTok Events API
- custom webhooks
- custom webhooks and event pipelines
- privacy-aware routing and normalization
- self-hosted, Cloudflare-native deployment

The public site explains the platform. The dashboard and Workers expose the operational product surface.

## Production Domains

The current Cloudflare production map is:

- `eventsgateway.com` -> public marketing site
- `www.eventsgateway.com` -> redirect to `eventsgateway.com` handled by the root Worker
- `dash.eventsgateway.com` -> dashboard served by the unified root Worker
- `api.eventsgateway.com` -> API surface served by the unified root Worker
- `e.eventsgateway.com` -> collector surface served by the unified root Worker

All public domains are now routed through one Cloudflare Worker script with shared queue, cron, Durable Object, D1, KV, and R2 bindings.

## Repository Layout

```text
/
├── apps/
│   ├── api-worker/
│   ├── collector-worker/
│   ├── dashboard/
│   └── forwarder-worker/
├── packages/
│   ├── platform-data/
│   ├── routing-engine/
│   ├── runtime/
│   ├── schemas/
│   ├── shared/
│   └── tracker-sdk/
├── public/
├── src/
├── astro.config.mjs
├── package.json
├── pnpm-workspace.yaml
└── wrangler.jsonc
```

## Canonical Deploy Targets

The canonical production target is the repository root:

- root app `./` -> unified marketing, dashboard, API, collector, queue consumer, cron, and Durable Object entrypoint

The `apps/*` folders remain as source modules reused by the single production Worker.

## Core Stack

### Root site

- Astro static SSG
- TypeScript
- Cloudflare Workers Static Assets
- Wrangler deployment

### Dashboard

- React
- Vite
- TypeScript
- Cloudflare Workers Static Assets

### Runtime services

- Cloudflare Workers
- Wrangler
- shared TypeScript packages for runtime contracts and mock data

## Local Development

### Root marketing site

```bash
npm install
npm run dev
```

### Dashboard source


npm --prefix apps/dashboard install
npm --prefix apps/dashboard run dev
npm --prefix apps/forwarder-worker run dev

## Build And Validation

### Root site

```bash
npm run check
npm run build
```

### Dashboard

```bash
npm --prefix apps/dashboard run check
npm --prefix apps/dashboard run build
```

## Deployment

Run from the repository root:

```bash
npm run deploy
npm run deploy:public
npm run deploy:hosted
```

Deploy the full hosted EventsGateway surface with the unified root Worker:

```bash
npm run deploy:public
npm run deploy:hosted
```

Both commands currently map to the same unified deploy sequence:

```bash
npm run deploy:all
```

When a deployment platform runs `npx wrangler deploy` from the repository root, the repository installs a local Wrangler wrapper during `postinstall`. The default deploy publishes the unified root Worker and all configured custom domains in `wrangler.jsonc`.

## Supported Destinations

EventsGateway currently supports these destination classes in the runtime:

- Meta Conversions API
- GA4 Measurement Protocol
- Google Ads
- TikTok Events API
- custom webhooks

The repository includes canonical event mapping, routing, and delivery controls for these destination types, and the dashboard exposes destination-aware routing on top of the same event stream.

## Environment And Secrets

### Dashboard

The dashboard uses public Vite variables because they are embedded into the browser bundle:

```env
VITE_API_BASE_URL=https://api.eventsgateway.com
```

Example files:

- `apps/dashboard/.env.example`
- `apps/dashboard/.env.production.example`

Do not place private secrets in `VITE_*` variables.

### API Worker

The API Worker supports:

```env
API_TOKEN=replace-with-a-long-random-token
CAPTCHA_PROVIDER=turnstile
CAPTCHA_SITE_KEY=replace-with-your-captcha-site-key
CAPTCHA_SECRET_KEY=replace-with-your-captcha-secret-key
```

Example file:

- `apps/api-worker/.dev.vars.example`

For production, use Wrangler secrets instead of committing values into the repository.

### Initial setup

The official repository keeps the active Cloudflare deployment identifiers required by the hosted EventsGateway instance.

Use the install flow at `/install` to prepare:

- Cloudflare account ID
- Cloudflare zone ID
- D1 database ID and name
- KV namespace ID
- Durable Object name
- R2 ledger bucket name
- Queue name
- captcha provider choice between Turnstile, reCAPTCHA, and hCaptcha
- public captcha site key and private API secret key

If you self-host, create Cloudflare `KV`, `Durable Objects`, `D1`, `R2`, and `Queue` resources manually first, then replace the default Wrangler values in your own copy and keep private secrets only in local configuration, secret managers, or private CI variables.

## Current Behavior Notes

- the public site is static-first, but the unified Worker also exposes same-origin APIs used by the site
- the public contact form delivers through Brevo
- the dashboard consumes the API base URL from build-time configuration
- the homepage mockup and pricing calculator load from external scripts to respect CSP

## Security Notes

The marketing site ships with restrictive security headers, including a Content Security Policy defined in `public/_headers`.

That policy:

- allows same-origin scripts
- blocks inline executable scripts
- allows inline styles
- restricts framing and form targets

Any interactive browser script must therefore be loaded as a same-origin external asset rather than inline JavaScript.

## Status

The Cloudflare production surface currently includes:

- working marketing site deployment
- working dashboard deployment
- working API deployment through the unified Worker
- working collector deployment through the unified Worker
- working queue consumer and cron through the unified Worker

## License And Visibility

EventsGateway is an open source product. The public site, dashboard surface, and event-facing components are intended to be publicly published through Cloudflare-hosted endpoints.
