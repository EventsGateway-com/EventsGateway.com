import { useEffect, useId, useRef } from "react";
import { readCaptchaProvider, readCaptchaSiteKey, type CaptchaProvider } from "./api-client";

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
  const existing = document.querySelector<HTMLScriptElement>(`script[data-captcha-provider="${provider}"]`);
  if (existing) {
    return;
  }

  const script = document.createElement("script");
  script.src = scriptUrlForProvider(provider);
  script.async = true;
  script.defer = true;
  script.dataset.captchaProvider = provider;
  document.head.appendChild(script);
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

  useEffect(() => {
    const provider = readCaptchaProvider();
    const siteKey = readCaptchaSiteKey();
    if (!siteKey) {
      onTokenChange("");
      return;
    }

    ensureCaptchaScript(provider);
    let active = true;
    const mountWidget = () => {
      if (!active || renderedRef.current) return;
      const api = getCaptchaApi(provider);
      const element = document.getElementById(containerId);
      if (!api || !element) return;
      renderedRef.current = true;
      widgetIdRef.current = api.render(element, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onTokenChange(token),
        "expired-callback": () => onTokenChange(""),
        "error-callback": () => onTokenChange("")
      });
    };

    mountWidget();
    const intervalId = window.setInterval(mountWidget, 200);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      const api = getCaptchaApi(provider);
      if (api && widgetIdRef.current) {
        api.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, [containerId, onTokenChange]);

  useEffect(() => {
    const api = getCaptchaApi(readCaptchaProvider());
    if (!api || !widgetIdRef.current) return;
    onTokenChange("");
    api.reset(widgetIdRef.current);
  }, [onTokenChange, resetNonce]);

  if (!isCaptchaConfigured()) {
    return <p className="eg-form-error">Captcha is not configured for this deployment yet. Finish the install setup first.</p>;
  }

  return (
    <div className="eg-captcha-widget">
      <div id={containerId} />
    </div>
  );
}
