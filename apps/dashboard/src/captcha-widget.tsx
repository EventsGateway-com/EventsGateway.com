import { useEffect, useId, useRef, useState } from "react";
import { loadCaptchaConfig, readCaptchaProvider, readCaptchaSiteKey, type CaptchaProvider } from "./api-client";

type CaptchaRenderOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type CaptchaApi = {
  render: (container: HTMLElement | string, options: CaptchaRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

type CaptchaWindow = Window & {
  turnstile?: CaptchaApi;
  grecaptcha?: CaptchaApi;
  hcaptcha?: CaptchaApi;
};

const captchaScriptPromises = new Map<CaptchaProvider, Promise<void>>();

function scriptUrlForProvider(provider: CaptchaProvider) {
  if (provider === "recaptcha") {
    return "https://www.google.com/recaptcha/api.js?render=explicit";
  }
  if (provider === "hcaptcha") {
    return "https://js.hcaptcha.com/1/api.js?render=explicit";
  }
  return "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
}

function getCaptchaApi(provider: CaptchaProvider) {
  const scope = window as CaptchaWindow;
  if (provider === "recaptcha") {
    return scope.grecaptcha;
  }
  if (provider === "hcaptcha") {
    return scope.hcaptcha;
  }
  return scope.turnstile;
}

function ensureCaptchaScript(provider: CaptchaProvider) {
  if (getCaptchaApi(provider)) {
    return Promise.resolve();
  }

  const existingPromise = captchaScriptPromises.get(provider);
  if (existingPromise) {
    return existingPromise;
  }

  let script = document.querySelector<HTMLScriptElement>(`script[data-captcha-provider="${provider}"]`);
  if (!script) {
    script = document.createElement("script");
    script.src = scriptUrlForProvider(provider);
    script.async = true;
    script.defer = true;
    script.dataset.captchaProvider = provider;
    document.head.appendChild(script);
  }

  const promise = new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };

    const resolveWhenReady = () => {
      if (settled) {
        return;
      }
      if (getCaptchaApi(provider)) {
        settled = true;
        cleanup();
        resolve();
        return;
      }
      window.setTimeout(resolveWhenReady, 50);
    };

    const handleLoad = () => {
      resolveWhenReady();
    };

    const handleError = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      captchaScriptPromises.delete(provider);
      reject(new Error(`Failed to load captcha script for provider "${provider}".`));
    };

    if (getCaptchaApi(provider)) {
      settled = true;
      resolve();
      return;
    }

    script?.addEventListener("load", handleLoad);
    script?.addEventListener("error", handleError);
  });

  captchaScriptPromises.set(provider, promise);
  return promise;
}

export function isCaptchaConfigured() {
  return Boolean(readCaptchaSiteKey());
}

export function CaptchaWidget({
  onTokenChange,
  resetNonce
}: {
  onTokenChange: (token: string) => void;
  resetNonce: number;
}) {
  const containerId = useId().replace(/:/g, "_");
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);
  const onTokenChangeRef = useRef(onTokenChange);
  const [isLoading, setIsLoading] = useState(!isCaptchaConfigured());
  const [config, setConfig] = useState(() => ({
    provider: readCaptchaProvider(),
    siteKey: readCaptchaSiteKey()
  }));

  useEffect(() => {
    let active = true;
    void loadCaptchaConfig().then((nextConfig) => {
      if (!active) {
        return;
      }
      setConfig({
        provider: nextConfig.provider,
        siteKey: nextConfig.site_key
      });
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const provider = config.provider;
    const siteKey = config.siteKey;
    if (!siteKey) {
      onTokenChangeRef.current("");
      return;
    }

    let active = true;
    const mountWidget = () => {
      if (!active || renderedRef.current) {
        return;
      }
      const api = getCaptchaApi(provider);
      const element = document.getElementById(containerId);
      if (!api || !element) {
        return;
      }
      renderedRef.current = true;
      widgetIdRef.current = api.render(element, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onTokenChangeRef.current(token),
        "expired-callback": () => onTokenChangeRef.current(""),
        "error-callback": () => onTokenChangeRef.current("")
      });
    };

    void ensureCaptchaScript(provider).then(() => {
      mountWidget();
    }).catch(() => {
      onTokenChangeRef.current("");
    });

    return () => {
      active = false;
      const api = getCaptchaApi(provider);
      if (api && widgetIdRef.current) {
        api.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, [config.provider, config.siteKey, containerId]);

  useEffect(() => {
    const api = getCaptchaApi(config.provider);
    if (!api || !widgetIdRef.current) return;
    onTokenChangeRef.current("");
    api.reset(widgetIdRef.current);
  }, [config.provider, resetNonce]);

  if (isLoading) {
    return null;
  }

  if (!config.siteKey) {
    return <p className="eg-form-error">Captcha is not configured for this deployment yet. Finish the install setup first.</p>;
  }

  return (
    <div className="eg-captcha-widget">
      <div id={containerId} />
    </div>
  );
}
