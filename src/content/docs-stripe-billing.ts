export const stripeBillingDocsContent = {
  title: "Stripe Billing Setup For EventsGateway",
  eyebrow: "Billing Documentation",
  intro:
    "Use Stripe as the payment processor for EventsGateway subscriptions, payment-method updates, invoices, webhook-driven status sync, reminder scheduling, and routing suspension after overdue billing.",
  overview: [
    "Stripe Checkout is used to save or update a payment method without storing card data on EventsGateway infrastructure.",
    "Stripe Billing Portal is used for customer-managed billing updates and payment method maintenance.",
    "Stripe webhooks keep invoices, transactions, customer billing details, and subscription status in sync with the platform control plane.",
    "If an invoice stays overdue for 15 days after due date, EventsGateway can suspend routing automatically until payment is resolved."
  ],
  environmentVariables: [
    { name: "STRIPE_SECRET_KEY", description: "Private Stripe secret key used by the API worker for Checkout, Billing Portal, and Stripe API requests." },
    { name: "STRIPE_WEBHOOK_SECRET", description: "Private webhook signing secret used to verify the Stripe signature header on incoming events." },
    { name: "STRIPE_BILLING_RETURN_URL", description: "Dashboard base URL used as the return target after Checkout or Billing Portal flows complete." },
    { name: "VITE_STRIPE_PUBLISHABLE_KEY", description: "Public Stripe key exposed in dashboard builds when client-side Stripe references are needed." }
  ],
  commandBlocks: [
    {
      title: "Set Stripe secrets in Cloudflare",
      code: `cd apps/api-worker
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET`
    },
    {
      title: "Set dashboard public Stripe key",
      code: `cd apps/dashboard
set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_replace_with_your_publishable_key`
    },
    {
      title: "Set Stripe billing return URL",
      code: `apps/api-worker/wrangler.jsonc
STRIPE_BILLING_RETURN_URL=https://dash.eventsgateway.com`
    },
    {
      title: "Create the Stripe webhook endpoint",
      code: `Endpoint URL:
https://api.eventsgateway.com/v1/billing/stripe-webhook`
    }
  ],
  webhookEvents: [
    { name: "checkout.session.completed", purpose: "Marks payment-method setup as completed and updates billing profile notes." },
    { name: "customer.updated", purpose: "Refreshes billing name and billing email in the control plane." },
    { name: "invoice.created / updated / finalized", purpose: "Creates or updates hosted invoices, PDFs, invoice numbers, due dates, and invoice status." },
    { name: "invoice.paid / invoice.payment_succeeded", purpose: "Marks invoices as paid and creates successful billing transactions." },
    { name: "invoice.payment_failed", purpose: "Marks invoices as past due and creates failed billing transactions." },
    { name: "customer.subscription.created / updated / deleted", purpose: "Keeps Stripe subscription identifiers, billing periods, and subscription status aligned." },
    { name: "charge.succeeded / charge.failed", purpose: "Adds payment-method detail and charge-level transaction visibility when Stripe sends charge events." }
  ],
  recoveryFlow: [
    "Invoices receive reminder records at 7, 3, 1, and 0 days before due date when they remain unpaid.",
    "When the due date passes, the invoice becomes past due and the dashboard starts showing a billing risk state.",
    "After 15 overdue days, the subscription becomes suspended and the collector rejects new event routing for that site until billing is resolved.",
    "Once payment clears, webhook events can move the invoice and subscription back to a healthy state and routing resumes."
  ],
  checklist: [
    "Stripe secret key stored as a Cloudflare secret in the API worker",
    "Stripe webhook secret stored as a Cloudflare secret in the API worker",
    "Dashboard public Stripe key added to dashboard environment configuration",
    "Stripe webhook endpoint created in the Stripe dashboard",
    "Successful webhook delivery confirmed for checkout, invoice, and subscription events",
    "Billing page tested for checkout return, invoice visibility, and overdue recovery messaging"
  ]
} as const;
