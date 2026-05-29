const fs = require('fs');
const path = require('path');

const apiWorkerPath = path.join(__dirname, '../apps/api-worker/src/index.ts');
let content = fs.readFileSync(apiWorkerPath, 'utf8');

// We need to wrap the billing endpoints in try/catch to return proper CORS JSON responses.
// Wait, the error occurs because getSiteBillingSummary crashes. Why does it crash?
// Probably the tables don't exist because `seedSiteBilling` fails, or maybe `syncInvoiceStatuses` fails due to no Stripe token.
// Let's wrap them in try/catch.

const billingGetRegex = /if \(segments\[3\] === "billing" && method === "GET"\) \{\s*if \(\!env\?\.DB\) return errorResponse\(context, "missing_database", "D1 database binding is not configured\.", 500\);\s*return json\(context, await getSiteBillingSummary\(env\.DB, siteId\)\);\s*\}/;
const newBillingGet = `if (segments[3] === "billing" && method === "GET") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    try {
      return json(context, await getSiteBillingSummary(env.DB, siteId));
    } catch (error) {
      return errorResponse(context, "billing_summary_failed", error instanceof Error ? error.message : "Unable to fetch billing summary.", 500);
    }
  }`;
content = content.replace(billingGetRegex, newBillingGet);

const invoicesGetRegex = /if \(segments\[3\] === "billing" && segments\[4\] === "invoices" && method === "GET"\) \{\s*if \(\!env\?\.DB\) return errorResponse\(context, "missing_database", "D1 database binding is not configured\.", 500\);\s*return json\(context, await listSiteBillingInvoices\(env\.DB, siteId\)\);\s*\}/;
const newInvoicesGet = `if (segments[3] === "billing" && segments[4] === "invoices" && method === "GET") {
    if (!env?.DB) return errorResponse(context, "missing_database", "D1 database binding is not configured.", 500);
    try {
      return json(context, await listSiteBillingInvoices(env.DB, siteId));
    } catch (error) {
      return errorResponse(context, "billing_invoices_failed", error instanceof Error ? error.message : "Unable to fetch billing invoices.", 500);
    }
  }`;
content = content.replace(invoicesGetRegex, newInvoicesGet);

fs.writeFileSync(apiWorkerPath, content);
console.log("Wrapped API billing endpoints in try/catch");
