# EVENTS Gateway.com

Official repository for the EVENTS Gateway public site and Cloudflare-hosted application surface.

EVENTS Gateway is an open source tracking and event routing platform built for teams that want one controlled event flow for collection, normalization, routing, attribution, delivery, replay, and operational visibility.

## What This Repository Contains

This repository currently includes:

- the public marketing site for `eventsgateway.com`
- the `www` Worker for `eventsgateway.com` and `www.eventsgateway.com`
- the dashboard Worker for `dash.eventsgateway.com`
- the API Worker for `api.eventsgateway.com`
- the collector Worker for `e.eventsgateway.com` and `sources.eventsgateway.com`
- the forwarder Worker for queue delivery processing
- shared TypeScript packages used across the dashboard and Workers

## Product Scope

EVENTS Gateway is designed for:

- Bing
- Branch
- Facebook Pixel
- Floodlight
- Google Analytics
- Google Analytics 4
- Google Ads
- Google Maps RWG
- HubSpot
- iHire
- Impact Radius
- Indeed
- LinkedIn Insights
- Mixpanel
- Outbrain
- Pinterest
- Podsights
- Quora
- Reddit
- Segment
- Snapchat
- Taboola
- Tatari
- TikTok
- Twitter
- Upward
- ZipRecruiter
- PostHog
- Counterscale
- custom webhooks and event pipelines
- privacy-aware routing and normalization
- self-hosted, Cloudflare-native deployment

The public site explains the platform. The dashboard and Workers expose the operational product surface.

## Integration Pages

- [Bing](https://eventsgateway.com/integrations/bing/)
- [Branch](https://eventsgateway.com/integrations/branch/)
- [Facebook Pixel](https://eventsgateway.com/integrations/facebook-pixel/)
- [Floodlight](https://eventsgateway.com/integrations/floodlight/)
- [Google Analytics](https://eventsgateway.com/integrations/google-analytics/)
- [Google Analytics 4](https://eventsgateway.com/integrations/google-analytics-4/)
- [Google Ads](https://eventsgateway.com/integrations/google-ads/)
- [Google Maps RWG](https://eventsgateway.com/integrations/google-maps-rwg/)
- [HubSpot](https://eventsgateway.com/integrations/hubspot/)
- [iHire](https://eventsgateway.com/integrations/ihire/)
- [Impact Radius](https://eventsgateway.com/integrations/impact-radius/)
- [Indeed](https://eventsgateway.com/integrations/indeed/)
- [LinkedIn Insights](https://eventsgateway.com/integrations/linkedin-insights/)
- [Mixpanel](https://eventsgateway.com/integrations/mixpanel/)
- [Outbrain](https://eventsgateway.com/integrations/outbrain/)
- [Pinterest](https://eventsgateway.com/integrations/pinterest/)
- [Podsights](https://eventsgateway.com/integrations/podsights/)
- [Quora](https://eventsgateway.com/integrations/quora/)
- [Reddit](https://eventsgateway.com/integrations/reddit/)
- [Segment](https://eventsgateway.com/integrations/segment/)
- [Snapchat](https://eventsgateway.com/integrations/snapchat/)
- [Taboola](https://eventsgateway.com/integrations/taboola/)
- [Tatari](https://eventsgateway.com/integrations/tatari/)
- [TikTok](https://eventsgateway.com/integrations/tiktok/)
- [Twitter](https://eventsgateway.com/integrations/twitter/)
- [Upward](https://eventsgateway.com/integrations/upward/)
- [ZipRecruiter](https://eventsgateway.com/integrations/ziprecruiter/)
- [PostHog](https://eventsgateway.com/integrations/posthog/)
- [Counterscale](https://eventsgateway.com/integrations/counterscale/)

## Production Domains

The current Cloudflare production map is:

- `eventsgateway.com` -> public marketing site served by the `www` Worker
- `www.eventsgateway.com` -> redirect to `eventsgateway.com` handled by the `www` Worker
- `dash.eventsgateway.com` -> dashboard Worker
- `api.eventsgateway.com` -> API Worker
- `e.eventsgateway.com` -> collector Worker
- `sources.eventsgateway.com` -> collector Worker dummy surface that always returns `200`

The production surfaces are intentionally split so Cloudflare Git integration can publish the affected worker independently when only one area changes.

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

- root app `./` -> `www` Worker and public marketing site
- `apps/dashboard` -> dashboard Worker
- `apps/api-worker` -> API Worker
- `apps/collector-worker` -> collector Worker
- `apps/forwarder-worker` -> forwarder Worker

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
npm run build:www
npm run build:dashboard
npm run build:api
npm run build:collector
npm run build:forwarder
```

Build the workers directly from each app when needed:

```bash
npm --prefix apps/dashboard run build
npm --prefix apps/api-worker run build
npm --prefix apps/collector-worker run build
npm --prefix apps/forwarder-worker run build
```

Cloudflare Git integration should point each Worker project at its own directory and build command so a normal `git push` can publish only the surface that changed, or all surfaces when shared code changes.

## Supported Destinations

EVENTS Gateway currently supports these destination classes in the runtime:

- Bing
- Branch
- Facebook Pixel
- Floodlight
- Google Analytics
- Google Analytics 4
- Google Ads
- Google Maps RWG
- HubSpot
- iHire
- Impact Radius
- Indeed
- LinkedIn Insights
- Mixpanel
- Outbrain
- Pinterest
- Podsights
- Quora
- Reddit
- Segment
- Snapchat
- Taboola
- Tatari
- TikTok
- Twitter
- Upward
- ZipRecruiter
- PostHog
- Counterscale
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

The official repository keeps the active Cloudflare deployment identifiers required by the hosted EVENTS Gateway instance.

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

EVENTS Gateway is an open source product. The public site, dashboard surface, and event-facing components are intended to be publicly published through Cloudflare-hosted endpoints.
