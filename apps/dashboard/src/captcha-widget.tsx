import { useEffect, useId, useRef } from "react";
import { readCaptchaSiteKey } from "./api-client";

type TurnstileRenderOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

function getTurnstileApi() {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
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
    const siteKey = readCaptchaSiteKey();
    if (!siteKey) {
      onTokenChange("");
      return;
    }

    let active = true;
    const mountWidget = () => {
      if (!active || renderedRef.current) return;
      const api = getTurnstileApi();
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
      const api = getTurnstileApi();
      if (api && widgetIdRef.current) {
        api.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
      renderedRef.current = false;
    };
  }, [containerId, onTokenChange]);

  useEffect(() => {
    const api = getTurnstileApi();
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
