# Debug Session: collector-loader-js [OPEN]

## Symptom
- `https://e.eventsgateway.com/e/` does not respond with the expected JavaScript loader for browser use.

## Expected
- `https://e.eventsgateway.com/e/` returns JavaScript that initializes the client loader and sends events to `/i/`.

## Hypotheses
- The collector route `/e/` is matched, but `handleTrackerJs()` returns the wrong content type or body.
- The deployed hostname `e.eventsgateway.com` is not reaching the collector worker path that serves `/e/`.
- The loader implementation exists, but it does not target `/i/` as the default ingest endpoint.
- The production deployment on `e.eventsgateway.com` is behind the current repository state or a different worker binding.
- The loader response is being rewritten or blocked by another layer before reaching the browser.

## Evidence Log
- Live check with `curl -A "Mozilla/5.0" -i https://e.eventsgateway.com/e/` returned `301 Moved Permanently`.
- Live check with `curl -A "Mozilla/5.0" -IL --max-redirs 5 https://e.eventsgateway.com/e/` looped on the same `Location: https://e.eventsgateway.com/e/`.
- In `apps/collector-worker/src/index.ts`, the code rebuilt the path from split segments, so `/e/` became `/e`.
- Because `/e/` was normalized to `/e`, the handler always entered the redirect branch and never reached `handleTrackerJs()`.

## Fix
- Changed the collector route matching to use `new URL(request.url).pathname` directly.
- This preserves `/e/` and `/i/` exactly, so `/e/` can return JavaScript and `/i/` can keep ingest behavior.

## Next Steps
- Push the collector fix.
- Verify that `https://e.eventsgateway.com/e/` returns `application/javascript`.
- Verify that the loader source still defaults to `/i/`.
