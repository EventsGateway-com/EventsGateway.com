export type TrackerConsent = {
  analytics: boolean;
  ads: boolean;
  functional: boolean;
};

export type TrackerInitOptions = {
  siteId: string;
  apiKey: string;
  endpoint: string;
  flushIntervalMs?: number;
  maxQueueSize?: number;
  consent?: Partial<TrackerConsent>;
  autoPageview?: boolean;
  environment?: "production" | "staging" | "development";
};

export type TrackerEventInput = {
  type: string;
  properties?: Record<string, unknown>;
  page?: {
    url?: string;
    path?: string;
    title?: string;
    referrer?: string;
  };
  ecommerce?: {
    order_id?: string;
    value?: number;
    currency?: string;
  };
};

type QueuedEvent = {
  version: "1.0";
  event_id: string;
  site_id: string;
  api_key: string;
  type: string;
  source: "browser";
  environment: "production" | "staging" | "development";
  timestamp: number;
  received_at: number;
  anonymous_id: string;
  session_id: string;
  canonical_user_id?: string;
  page?: TrackerEventInput["page"];
  ecommerce?: TrackerEventInput["ecommerce"];
  consent: TrackerConsent & {
    source: "default" | "cmp" | "api";
    updated_at: number;
  };
  properties?: Record<string, unknown>;
  debug: {
    request_id: string;
    sdk_version: string;
  };
};

const STORAGE_KEYS = {
  anonymousId: "eg:anonymous_id",
  sessionId: "eg:session_id",
  consent: "eg:consent",
  queue: "eg:queue",
  lastSeen: "eg:last_seen"
} as const;

function buildIdentifyEndpoint(endpoint: string) {
  if (endpoint.endsWith("/i/")) {
    return `${endpoint}identify`;
  }
  return endpoint.replace(/\/collect$/, "/identify");
}

class EventsGatewayTracker {
  private options?: TrackerInitOptions;
  private queue: QueuedEvent[] = [];
  private consent: TrackerConsent = { analytics: true, ads: false, functional: true };
  private canonicalUserId?: string;
  private flushTimer?: number;

  init(options: TrackerInitOptions) {
    this.options = {
      flushIntervalMs: 5000,
      maxQueueSize: 50,
      autoPageview: false,
      environment: "production",
      ...options
    };
    this.restoreConsent();
    this.restoreQueue();
    this.consent = { ...this.consent, ...options.consent };
    this.persistConsent();
    this.installLifecycleFlush();
    this.scheduleFlush();
    if (this.options.autoPageview) {
      this.pageview();
    }
    return this;
  }

  pageview(properties?: Record<string, unknown>) {
    return this.track({
      type: "PageView",
      properties,
      page: this.capturePage()
    });
  }

  track(input: TrackerEventInput) {
    if (!this.options) throw new Error("Tracker not initialized");
    if (!this.consent.analytics) return false;

    const event: QueuedEvent = {
      version: "1.0",
      event_id: this.createId("evt"),
      site_id: this.options.siteId,
      api_key: this.options.apiKey,
      type: input.type,
      source: "browser",
      environment: this.options.environment ?? "production",
      timestamp: Date.now(),
      received_at: Date.now(),
      anonymous_id: this.ensureAnonymousId(),
      session_id: this.ensureSessionId(),
      canonical_user_id: this.canonicalUserId,
      page: input.page ?? this.capturePage(),
      ecommerce: input.ecommerce,
      consent: {
        ...this.consent,
        source: "default",
        updated_at: Date.now()
      },
      properties: input.properties ?? {},
      debug: {
        request_id: this.createId("req"),
        sdk_version: "0.1.0"
      }
    };

    this.queue.push(event);
    this.persistQueue();

    if (this.queue.length >= (this.options.maxQueueSize ?? 50)) {
      void this.flush();
    }

    return event;
  }

  identify(canonicalUserId: string) {
    this.canonicalUserId = canonicalUserId;
    if (!this.options) throw new Error("Tracker not initialized");
    return this.sendIdentify(canonicalUserId);
  }

  purchase(input: { orderId: string; value: number; currency: string; properties?: Record<string, unknown> }) {
    return this.track({
      type: "Purchase",
      ecommerce: {
        order_id: input.orderId,
        value: input.value,
        currency: input.currency
      },
      properties: input.properties
    });
  }

  setConsent(consent: Partial<TrackerConsent>) {
    this.consent = { ...this.consent, ...consent };
    this.persistConsent();
  }

  async flush() {
    if (!this.options || this.queue.length === 0) return;

    const payload = this.queue.slice(0, 20);
    const body = payload.length === 1 ? payload[0] : { events: payload };
    const endpoint = this.options.endpoint;

    const response = await this.send(endpoint, body);
    if (!response.ok) return response;

    this.queue = this.queue.slice(payload.length);
    this.persistQueue();
    return response;
  }

  private async send(endpoint: string, body: unknown) {
    const content = JSON.stringify(body);

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator && content.length < 64 * 1024) {
      const sent = navigator.sendBeacon(endpoint, new Blob([content], { type: "text/plain;charset=UTF-8" }));
      if (sent) {
        return new Response(null, { status: 202 });
      }
    }

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8"
      },
      body: content,
      keepalive: true
    });
  }

  private sendIdentify(canonicalUserId: string) {
    if (!this.options) throw new Error("Tracker not initialized");
    const endpoint = buildIdentifyEndpoint(this.options.endpoint);
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        "x-site-key": this.options.apiKey
      },
      body: JSON.stringify({
        site_id: this.options.siteId,
        canonical_user_id: canonicalUserId,
        anonymous_id: this.ensureAnonymousId(),
        session_id: this.ensureSessionId(),
        consent: {
          ...this.consent,
          source: "api",
          updated_at: Date.now()
        }
      }),
      keepalive: true
    });
  }

  private capturePage() {
    if (typeof window === "undefined") return undefined;
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    };
  }

  private ensureAnonymousId() {
    if (typeof localStorage === "undefined") return this.createId("anon");
    const existing = localStorage.getItem(STORAGE_KEYS.anonymousId);
    if (existing) return existing;
    const created = this.createId("anon");
    localStorage.setItem(STORAGE_KEYS.anonymousId, created);
    return created;
  }

  private ensureSessionId() {
    if (typeof sessionStorage === "undefined") return this.createId("sess");
    const timeoutMs = 30 * 60 * 1000;
    const lastSeen = Number(localStorage.getItem(STORAGE_KEYS.lastSeen) ?? "0");
    const isExpired = Date.now() - lastSeen > timeoutMs;
    const existing = sessionStorage.getItem(STORAGE_KEYS.sessionId);
    if (existing && !isExpired) {
      localStorage.setItem(STORAGE_KEYS.lastSeen, String(Date.now()));
      return existing;
    }

    const created = this.createId("sess");
    sessionStorage.setItem(STORAGE_KEYS.sessionId, created);
    localStorage.setItem(STORAGE_KEYS.lastSeen, String(Date.now()));
    return created;
  }

  private restoreConsent() {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEYS.consent);
    if (!raw) return;
    try {
      this.consent = JSON.parse(raw) as TrackerConsent;
    } catch {
      this.consent = { analytics: true, ads: false, functional: true };
    }
  }

  private persistConsent() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(this.consent));
  }

  private restoreQueue() {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEYS.queue);
    if (!raw) return;
    try {
      const restored = JSON.parse(raw) as QueuedEvent[];
      this.queue = restored.slice(0, 20);
    } catch {
      this.queue = [];
    }
  }

  private persistQueue() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(this.queue.slice(0, 20)));
  }

  private installLifecycleFlush() {
    if (typeof window === "undefined") return;

    const triggerFlush = () => {
      void this.flush();
    };

    window.addEventListener("pagehide", triggerFlush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") triggerFlush();
    });
  }

  private scheduleFlush() {
    if (typeof window === "undefined") return;
    window.clearInterval(this.flushTimer);
    this.flushTimer = window.setInterval(() => {
      void this.flush();
    }, this.options?.flushIntervalMs ?? 5000);
  }

  private createId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const tracker = new EventsGatewayTracker();

export default tracker;

export function createBrowserLoaderSource(defaultEndpoint = "https://e.eventsgateway.com/i/") {
  return `(() => {
  if (window.eventsgateway) return;
  const STORAGE_KEYS = {
    anonymousId: "eg:anonymous_id",
    sessionId: "eg:session_id",
    consent: "eg:consent",
    queue: "eg:queue",
    lastSeen: "eg:last_seen"
  };
  const currentScript = document.currentScript;
  const defaultConsent = { analytics: true, ads: false, functional: true };
  const state = {
    siteId: currentScript?.dataset.siteId || window.eventsGatewaySiteId || "",
    apiKey: currentScript?.dataset.apiKey || window.eventsGatewayApiKey || "",
    endpoint: currentScript?.dataset.endpoint || window.eventsGatewayEndpoint || "${defaultEndpoint}",
    environment: currentScript?.dataset.environment || "production",
    flushIntervalMs: Number(currentScript?.dataset.flushIntervalMs || 5000),
    maxQueueSize: Number(currentScript?.dataset.maxQueueSize || 50),
    autoPageview: currentScript?.dataset.autoPageview !== "false",
    queue: [],
    consent: defaultConsent,
    canonicalUserId: window.eventsGatewayCanonicalUserId || ""
  };
  function createId(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 10);
  }
  function restoreConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.consent);
      if (raw) state.consent = { ...defaultConsent, ...JSON.parse(raw) };
    } catch {}
  }
  function persistConsent() {
    try {
      localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(state.consent));
    } catch {}
  }
  function restoreQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.queue);
      if (raw) state.queue = JSON.parse(raw).slice(0, 20);
    } catch {}
  }
  function persistQueue() {
    try {
      localStorage.setItem(STORAGE_KEYS.queue, JSON.stringify(state.queue.slice(0, 20)));
    } catch {}
  }
  function ensureAnonymousId() {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.anonymousId);
      if (existing) return existing;
      const created = createId("anon");
      localStorage.setItem(STORAGE_KEYS.anonymousId, created);
      return created;
    } catch {
      return createId("anon");
    }
  }
  function ensureSessionId() {
    try {
      const timeoutMs = 30 * 60 * 1000;
      const lastSeen = Number(localStorage.getItem(STORAGE_KEYS.lastSeen) || "0");
      const existing = sessionStorage.getItem(STORAGE_KEYS.sessionId);
      const expired = Date.now() - lastSeen > timeoutMs;
      if (existing && !expired) {
        localStorage.setItem(STORAGE_KEYS.lastSeen, String(Date.now()));
        return existing;
      }
      const created = createId("sess");
      sessionStorage.setItem(STORAGE_KEYS.sessionId, created);
      localStorage.setItem(STORAGE_KEYS.lastSeen, String(Date.now()));
      return created;
    } catch {
      return createId("sess");
    }
  }
  function capturePage() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    };
  }
  function send(endpoint, body, headers) {
    const content = JSON.stringify(body);
    if ((!headers || !Object.keys(headers).length) && navigator.sendBeacon && content.length < 64 * 1024) {
      const sent = navigator.sendBeacon(endpoint, new Blob([content], { type: "text/plain;charset=UTF-8" }));
      if (sent) return Promise.resolve(new Response(null, { status: 202 }));
    }
    return fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8", ...(headers || {}) },
      body: content,
      keepalive: true
    });
  }
  function enqueue(input) {
    if (!state.siteId || !state.apiKey || !input?.type || state.consent.analytics === false) return false;
    const event = {
      version: "1.0",
      event_id: createId("evt"),
      site_id: state.siteId,
      api_key: state.apiKey,
      type: input.type,
      source: "browser",
      environment: state.environment,
      timestamp: Date.now(),
      received_at: Date.now(),
      anonymous_id: ensureAnonymousId(),
      session_id: ensureSessionId(),
      canonical_user_id: state.canonicalUserId || undefined,
      page: input.page || capturePage(),
      ecommerce: input.ecommerce,
      consent: {
        ...state.consent,
        source: "default",
        updated_at: Date.now()
      },
      properties: input.properties || {},
      debug: {
        request_id: createId("req"),
        sdk_version: "0.1.0"
      }
    };
    state.queue.push(event);
    persistQueue();
    if (state.queue.length >= state.maxQueueSize) void flush();
    return event;
  }
  function flush() {
    if (!state.queue.length) return Promise.resolve();
    const payload = state.queue.slice(0, 20);
    const body = payload.length === 1 ? payload[0] : { events: payload };
    return send(state.endpoint, body).then((response) => {
      if (response && response.ok) {
        state.queue = state.queue.slice(payload.length);
        persistQueue();
      }
      return response;
    });
  }
  function identify(canonicalUserId) {
    state.canonicalUserId = canonicalUserId;
    if (!state.siteId || !state.apiKey || !canonicalUserId) return Promise.resolve(false);
    const identifyEndpoint = state.endpoint.endsWith("/i/")
      ? state.endpoint + "identify"
      : state.endpoint.replace(/\\/collect$/, "/identify");
    return send(
      identifyEndpoint,
      {
        site_id: state.siteId,
        canonical_user_id: canonicalUserId,
        anonymous_id: ensureAnonymousId(),
        session_id: ensureSessionId(),
        consent: {
          ...state.consent,
          source: "api",
          updated_at: Date.now()
        }
      },
      { "x-site-key": state.apiKey }
    );
  }
  restoreConsent();
  restoreQueue();
  const api = {
    init(options) {
      if (options && typeof options === "object") {
        state.siteId = options.siteId || state.siteId;
        state.apiKey = options.apiKey || state.apiKey;
        state.endpoint = options.endpoint || state.endpoint;
        state.environment = options.environment || state.environment;
        state.flushIntervalMs = Number(options.flushIntervalMs || state.flushIntervalMs);
        state.maxQueueSize = Number(options.maxQueueSize || state.maxQueueSize);
        state.autoPageview = options.autoPageview ?? state.autoPageview;
        if (options.consent) state.consent = { ...state.consent, ...options.consent };
        persistConsent();
      }
      return api;
    },
    pageview(properties) {
      return enqueue({ type: "PageView", properties, page: capturePage() });
    },
    track(input) {
      return enqueue(typeof input === "string" ? { type: input, properties: {} } : input);
    },
    identify,
    purchase(input) {
      return enqueue({
        type: "Purchase",
        ecommerce: {
          order_id: input?.orderId,
          value: input?.value,
          currency: input?.currency
        },
        properties: input?.properties || {}
      });
    },
    setConsent(consent) {
      state.consent = { ...state.consent, ...(consent || {}) };
      persistConsent();
      return state.consent;
    },
    flush
  };
  window.eventsgateway = api;
  window.e_g = function(type, properties) {
    return api.track({ type, properties: properties || {} });
  };
  window.addEventListener("pagehide", () => { void flush(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void flush();
  });
  window.setInterval(() => { void flush(); }, state.flushIntervalMs);
  if (state.autoPageview && state.siteId && state.apiKey) {
    api.pageview();
  }
})();`;
}
