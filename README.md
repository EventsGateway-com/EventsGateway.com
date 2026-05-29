# EventsGateway.com

Official repository for the EventsGateway public site and Cloudflare-hosted application surface.

EventsGateway is an open source tracking and event routing platform built for teams that want one controlled event flow for collection, normalization, routing, attribution, delivery, replay, and operational visibility.

## What This Repository Contains

This repository currently includes:

- the public marketing site for `eventsgateway.com`
- the public dashboard shell for `dash.eventsgateway.com`
- the management API Worker for `api.eventsgateway.com`
- the collector Worker for `e.eventsgateway.com`
- the forwarder Worker used for asynchronous destination delivery
- shared TypeScript packages used across the dashboard and Workers

## Product Scope

EventsGateway is designed for:

- Meta Conversions API
- GA4 Measurement Protocol
- Google Ads conversions
- custom webhooks and event pipelines
- privacy-aware routing and normalization
- self-hosted, Cloudflare-native deployment

The public site explains the platform. The dashboard and Workers expose the operational product surface.

## Production Domains

The current Cloudflare production map is:

- `eventsgateway.com` -> public marketing site
- `www.eventsgateway.com` -> redirect to `eventsgateway.com` handled by the root Worker
- `dash.eventsgateway.com` -> dashboard
- `api.eventsgateway.com` -> API Worker
- `e.eventsgateway.com` -> collector Worker

The forwarder Worker is currently deployed without a dedicated public custom domain.

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

The canonical production targets are:

- root app `./` -> canonical marketing site
- `apps/dashboard` -> canonical dashboard deploy target
- `apps/api-worker` -> canonical API deploy target
- `apps/collector-worker` -> canonical collector deploy target
- `apps/forwarder-worker` -> canonical forwarder deploy target

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

### Dashboard

```bash
npm --prefix apps/dashboard install
npm --prefix apps/dashboard run dev
```

### API Worker

```bash
npm --prefix apps/api-worker install
npm --prefix apps/api-worker run dev
```

### Collector Worker

```bash
npm --prefix apps/collector-worker install
npm --prefix apps/collector-worker run dev
```

### Forwarder Worker

```bash
npm --prefix apps/forwarder-worker install
npm --prefix apps/forwarder-worker run dev
```

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

### Workers

```bash
npm --prefix apps/api-worker run check
npm --prefix apps/collector-worker run check
npm --prefix apps/forwarder-worker run check
```

## Deployment

Run from the repository root:

```bash
npm run deploy
npm run deploy:dashboard
npm run deploy:api
npm run deploy:collector
npm run deploy:forwarder
```

Or deploy the full public surface in sequence:

```bash
npm run deploy:all
```

## Environment And Secrets

### Dashboard

The dashboard uses public Vite variables because they are embedded into the browser bundle:

```env
VITE_API_BASE_URL=https://api.eventsgateway.com
VITE_TURNSTILE_SITE_KEY=replace-with-your-turnstile-site-key
```

Example files:

- `apps/dashboard/.env.example`
- `apps/dashboard/.env.production.example`

Do not place private secrets in `VITE_*` variables.

### API Worker

The API Worker supports:

```env
API_TOKEN=replace-with-a-long-random-token
TURNSTILE_SECRET_KEY=replace-with-your-captcha-secret-key
```

Example file:

- `apps/api-worker/.dev.vars.example`

For production, use Wrangler secrets instead of committing values into the repository.

### Initial setup

The open source repository keeps Cloudflare identifiers out of tracked source files.

Use the install flow at `/setup` to prepare:

- Cloudflare account ID
- Cloudflare zone ID
- D1 database ID and name
- Queue name
- captcha provider choice between Turnstile, reCAPTCHA, and hCaptcha
- public captcha site key and private API secret key

Keep those values only in private local configuration, secret managers, or private CI variables.

## Current Behavior Notes

- the public site is intentionally static
- contact flows currently use email links instead of a backend form
- the dashboard currently consumes the API base URL from build-time configuration
- the homepage mockup is interactive, but it now loads from an external script to respect CSP

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
- working API Worker deployment
- working collector Worker deployment
- working forwarder Worker deployment

## License And Visibility

EventsGateway is an open source product. The public site, dashboard surface, and event-facing components are intended to be publicly published through Cloudflare-hosted endpoints.
