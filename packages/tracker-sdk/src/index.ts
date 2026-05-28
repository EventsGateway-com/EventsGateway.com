export type TrackerConsent = {
  analytics: boolean;
  ads: boolean;
  functional: boolean;
};

export type TrackerInitOptions = {
  siteId: string;
  endpoint: string;
  flushIntervalMs?: number;
  maxQueueSize?: number;
  consent?: Partial<TrackerConsent>;
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
      environment: "production",
      ...options
    };
    this.restoreConsent();
    this.restoreQueue();
    this.consent = { ...this.consent, ...options.consent };
    this.persistConsent();
    this.installLifecycleFlush();
    this.scheduleFlush();
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
    return this.track({
      type: "Identify",
      properties: {
        canonical_user_id: canonicalUserId
      }
    });
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
    const endpoint = payload.length === 1 ? this.options.endpoint : this.options.endpoint.replace(/\/collect$/, "/batch");

    const response = await this.send(endpoint, body);
    if (!response.ok) return response;

    this.queue = this.queue.slice(payload.length);
    this.persistQueue();
    return response;
  }

  private async send(endpoint: string, body: unknown) {
    const content = JSON.stringify(body);

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator && content.length < 64 * 1024) {
      const sent = navigator.sendBeacon(endpoint, new Blob([content], { type: "application/json" }));
      if (sent) {
        return new Response(null, { status: 202 });
      }
    }

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: content,
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
