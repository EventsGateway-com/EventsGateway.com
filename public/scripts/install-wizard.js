function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function capitalizeWord(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function getValue(id) {
  const element = document.getElementById(id);
  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement ? element.value.trim() : "";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function buildArtifacts() {
  const rootDomain = getValue("install-root-domain") || "example.com";
  const dashboardDomain = getValue("install-dashboard-domain") || `dash.${rootDomain}`;
  const apiDomain = getValue("install-api-domain") || `api.${rootDomain}`;
  const collectorDomain = getValue("install-collector-domain") || `events.${rootDomain}`;
  const accountId = getValue("install-account-id") || "replace-with-your-cloudflare-account-id";
  const zoneId = getValue("install-zone-id") || "replace-with-your-cloudflare-zone-id";
  const databaseId = getValue("install-database-id") || "replace-with-your-d1-database-id";
  const databaseName = getValue("install-database-name") || "eventsgateway-control-plane";
  const queueName = getValue("install-queue-name") || "eventsgateway-ingest";
  const captchaProvider = getValue("install-captcha-provider") || "turnstile";
  const captchaSiteKey = getValue("install-captcha-site-key") || `replace-with-your-${captchaProvider}-site-key`;
  const captchaSecretKey = getValue("install-captcha-secret-key") || `replace-with-your-${captchaProvider}-secret-key`;
  const stripePublishableKey = getValue("install-stripe-publishable-key") || "pk_test_replace_with_your_publishable_key";
  const stripeSecretKey = getValue("install-stripe-secret-key") || "sk_test_replace_with_your_secret_key";
  const stripeWebhookSecret = getValue("install-stripe-webhook-secret") || "whsec_replace_with_your_webhook_secret";
  const apiBaseUrl = `https://${apiDomain}`;
  const passwordResetBaseUrl = `https://${dashboardDomain}/reset-password`;
  const billingReturnUrl = `https://${dashboardDomain}`;

  setText(
    "install-output-dashboard-env",
    [
      `VITE_API_BASE_URL=${apiBaseUrl}`,
      `VITE_CAPTCHA_PROVIDER=${captchaProvider}`,
      `VITE_CAPTCHA_SITE_KEY=${captchaSiteKey}`,
      `VITE_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}`
    ].join("\n")
  );

  setText(
    "install-output-api-env",
    [
      "API_TOKEN=replace-with-a-long-random-token",
      "BREVO_API_KEY=replace-with-your-brevo-api-key",
      "BREVO_SENDER_EMAIL=no-reply@example.com",
      `PASSWORD_RESET_BASE_URL=${passwordResetBaseUrl}`,
      `CAPTCHA_PROVIDER=${captchaProvider}`,
      `CAPTCHA_SECRET_KEY=${captchaSecretKey}`,
      `STRIPE_SECRET_KEY=${stripeSecretKey}`,
      `STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}`,
      `STRIPE_BILLING_RETURN_URL=${billingReturnUrl}`
    ].join("\n")
  );

  setText(
    "install-output-placeholders",
    prettyJson({
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_ZONE_ID: zoneId,
      CONTROL_PLANE_DATABASE_ID: databaseId,
      CONTROL_PLANE_DATABASE_NAME: databaseName,
      EVENTS_QUEUE_NAME: queueName
    })
  );

  setText(
    "install-output-private-values",
    prettyJson({
      cloudflare: {
        account_id: accountId,
        zone_id: zoneId
      },
      runtime: {
        database_id: databaseId,
        database_name: databaseName,
        queue_name: queueName
      },
      domains: {
        root: rootDomain,
        root_www: `www.${rootDomain}`,
        dashboard: dashboardDomain,
        api: apiDomain,
        collector: collectorDomain
      },
      captcha: {
        provider: capitalizeWord(captchaProvider),
        site_key: captchaSiteKey,
        secret_env: "CAPTCHA_SECRET_KEY"
      },
      stripe: {
        publishable_key: stripePublishableKey,
        secret_env: "STRIPE_SECRET_KEY",
        webhook_secret_env: "STRIPE_WEBHOOK_SECRET",
        billing_return_url: billingReturnUrl
      }
    })
  );
}

function attachInstallWizard() {
  const root = document.querySelector("[data-install-wizard]");
  if (!root) return;
  const fields = root.querySelectorAll("input, select");
  fields.forEach((field) => {
    field.addEventListener("input", buildArtifacts);
    field.addEventListener("change", buildArtifacts);
  });
  buildArtifacts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachInstallWizard, { once: true });
} else {
  attachInstallWizard();
}
