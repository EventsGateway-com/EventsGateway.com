(() => {
  const TRACKER_CONSENT_KEY = "eg:consent";

  function readTrackerConsent() {
    try {
      const raw = localStorage.getItem(TRACKER_CONSENT_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    return {
      analytics: false,
      ads: false,
      functional: true
    };
  }

  async function fetchTrackingConfig() {
    const response = await fetch("/api/public-site-tracking", {
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  function loadTrackerScript() {
    return new Promise((resolve, reject) => {
      if (window.eventsgateway) {
        resolve(window.eventsgateway);
        return;
      }

      const existing = document.querySelector('script[data-site-tracker-loader="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.eventsgateway), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = window.__egPublicTrackingLoaderUrl || "https://e.eventsgateway.com/e/";
      script.defer = true;
      script.dataset.siteTrackerLoader = "true";
      script.addEventListener("load", () => resolve(window.eventsgateway), { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function trackPublicPageview() {
    if (!window.eventsgateway || window.__egPublicPageviewTracked) {
      return;
    }

    const consent = readTrackerConsent();
    if (!consent.analytics) {
      return;
    }

    window.__egPublicPageviewTracked = true;
    window.eventsgateway.pageview({
      page_group: "marketing-site"
    });
  }

  async function initPublicSiteTracking() {
    try {
      const config = await fetchTrackingConfig();
      if (!config?.enabled || !config.site_id || !config.api_key) {
        return;
      }

      await loadTrackerScript();
      if (!window.eventsgateway?.init) {
        return;
      }

      const consent = readTrackerConsent();
      window.__egPublicTrackingLoaderUrl = config.loader_url || "https://e.eventsgateway.com/e/";
      window.eventsgateway.init({
        siteId: config.site_id,
        apiKey: config.api_key,
        endpoint: config.endpoint || "https://e.eventsgateway.com/i/",
        environment: "production",
        autoPageview: false,
        consent
      });

      trackPublicPageview();

      window.addEventListener("eg:cookie-consent", () => {
        const nextConsent = readTrackerConsent();
        window.eventsgateway?.setConsent?.(nextConsent);
        trackPublicPageview();
      });
    } catch {}
  }

  void initPublicSiteTracking();
})();
