# Cloudflare Deployment Guide

This repository is now wired for Cloudflare deployment with these production targets:

- `eventsgateway.com` and `www.eventsgateway.com` -> root Astro marketing site
- `dash.eventsgateway.com` -> `apps/dashboard`
- `api.eventsgateway.com` -> `apps/api-worker`
- `e.eventsgateway.com` -> `apps/collector-worker`
- `apps/forwarder-worker` -> deployed as a Worker without a custom public domain yet

## Canonical App Map

Use these folders for production deployment:

- `./` -> public marketing site
- `apps/dashboard` -> dashboard static shell
- `apps/api-worker` -> management API
- `apps/collector-worker` -> tracking and collection entrypoint
- `apps/forwarder-worker` -> async delivery worker

Do not use `apps/marketing-site` for production deployment unless you intentionally want to revive that duplicate app. The root Astro app is the canonical marketing site in this repository.

## Where Keys Go

### Dashboard build-time variables

Dashboard variables are Vite `VITE_*` values. They are embedded into the browser bundle, so they are public.

Local development:

- copy `apps/dashboard/.env.example` to `apps/dashboard/.env`

Production build:

- copy `apps/dashboard/.env.production.example` to `apps/dashboard/.env.production`

Required values:

```env
VITE_API_BASE_URL=https://api.eventsgateway.com
```

Important:

- do not put private secrets in `VITE_*` variables
- do not mirror `API_TOKEN` into `VITE_API_TOKEN` for production

### API worker secrets

Local development:

- copy `apps/api-worker/.dev.vars.example` to `apps/api-worker/.dev.vars`

Example:

```env
API_TOKEN=replace-with-a-long-random-token
```

Production:

- set real Worker secrets in Cloudflare with Wrangler

```bash
cd apps/api-worker
wrangler secret put API_TOKEN --env production
```

Important:

- `API_TOKEN` is optional in the current codebase
- if you set `API_TOKEN` in production, the browser dashboard cannot safely know it
- only use `API_TOKEN` for server-to-server access, local development, or after you add a proper auth/proxy layer in front of the API

### Other apps

Current repository state:

- root marketing site: no runtime secrets required
- `apps/collector-worker`: no secrets required in the current implementation
- `apps/forwarder-worker`: no secrets required in the current implementation

## Deployment Commands

Run from the repository root:

```bash
npm install
npm run deploy
npm run deploy:dashboard
npm run deploy:api
npm run deploy:collector
npm run deploy:forwarder
```

Or deploy everything in sequence:

```bash
npm run deploy:all
```

What each command does:

- `npm run deploy` -> deploys the root marketing site to the production Wrangler environment
- `npm run deploy:dashboard` -> builds and deploys `apps/dashboard`
- `npm run deploy:api` -> deploys `apps/api-worker`
- `npm run deploy:collector` -> deploys `apps/collector-worker`
- `npm run deploy:forwarder` -> deploys `apps/forwarder-worker`

## Cloudflare Setup Checklist

Before first deploy, make sure these custom domains exist in Cloudflare:

- `eventsgateway.com`
- `www.eventsgateway.com`
- `dash.eventsgateway.com`
- `api.eventsgateway.com`
- `e.eventsgateway.com`

Then deploy the apps. The Wrangler configs already contain the production route bindings.

## Manual Cloudflare Step

The repository binds both `eventsgateway.com` and `www.eventsgateway.com` to the marketing deployment, but the redirect from `www` to apex is still a Cloudflare dashboard rule.

Create a Redirect Rule in Cloudflare:

- if hostname equals `www.eventsgateway.com`
- redirect to `https://eventsgateway.com/$1`
- use a `301` permanent redirect

## Notes

- The dashboard uses SPA fallback in `apps/dashboard/wrangler.jsonc`, so deep links work on Cloudflare.
- The API worker allows `https://dash.eventsgateway.com` as the production CORS origin.
- The collector worker is bound to `e.eventsgateway.com`.
