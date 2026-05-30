# Debug Session: loader-blocked [OPEN]

## Symptom
- The page contains a request to `/e/`, but the browser reports it as blocked.

## Expected
- The browser should load the JavaScript from the collector endpoint without being blocked.

## Hypotheses
- The loader endpoint returns a redirect or non-JavaScript response that the browser refuses as a script.
- The site CSP or another response header blocks external script loading from `e.eventsgateway.com`.
- The request is blocked due to Cloudflare/WAF/browser policy before the Worker JS is returned.
- The page markup uses an attribute combination that causes the browser to reject or ignore the script resource.
- The collector domain still serves the wrong worker/domain behavior in production.

## Evidence Log
- `GET https://e.eventsgateway.com/e/` returns `200 OK` with `Content-Type: application/javascript; charset=utf-8`.
- `HEAD https://e.eventsgateway.com/e/` returns `405 Method Not Allowed`, but that does not block normal script loading because browsers use `GET`.
- `GET https://eventsgateway.com/` returns a CSP header with `script-src 'self' https://challenges.cloudflare.com`.
- The page HTML includes `<script is:inline src="https://e.eventsgateway.com/e/" defer></script>`.
- Because `e.eventsgateway.com` is not present in `script-src`, the browser blocks the external loader script.

## Conclusion
- The current blocker is the site's CSP, not the loader endpoint.

## Next Steps
- Update the public site CSP to allow `https://e.eventsgateway.com` in `script-src`.
- Verify the page loads the external collector script after the CSP change.
