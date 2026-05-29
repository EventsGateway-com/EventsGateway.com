(() => {
  const COOKIE_CHOICE_KEY = "eg:site-cookie-choice";
  const TRACKER_CONSENT_KEY = "eg:consent";

  function buildConsent(choice) {
    if (choice === "accept") {
      return {
        analytics: true,
        ads: true,
        functional: true
      };
    }

    return {
      analytics: false,
      ads: false,
      functional: true
    };
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function persistChoice(choice, cookieBar) {
    const consent = buildConsent(choice);
    writeStorage(COOKIE_CHOICE_KEY, choice);
    writeStorage(TRACKER_CONSENT_KEY, JSON.stringify(consent));
    if (window.eventsgateway?.setConsent) {
      window.eventsgateway.setConsent(consent);
    }
    document.documentElement.dataset.cookieChoice = choice;
    window.dispatchEvent(new CustomEvent("eg:cookie-consent", { detail: { choice, consent } }));
    if (cookieBar) {
      cookieBar.hidden = true;
      cookieBar.setAttribute("hidden", "");
      cookieBar.style.display = "none";
    }
  }

  function initCookieBar() {
    const cookieBar = document.querySelector("[data-cookie-bar]");
    if (!cookieBar) {
      return;
    }

    const savedChoice = readStorage(COOKIE_CHOICE_KEY);
    document.documentElement.dataset.cookieChoice = savedChoice || "";
    cookieBar.hidden = Boolean(savedChoice);
    cookieBar.style.display = savedChoice ? "none" : "";

    const actionButtons = Array.from(cookieBar.querySelectorAll("[data-cookie-action]"));
    actionButtons.forEach((button) => {
      const applyChoice = (event) => {
        event.preventDefault();
        event.stopPropagation();
        persistChoice(button.getAttribute("data-cookie-action") === "accept" ? "accept" : "essential", cookieBar);
      };

      button.addEventListener("click", applyChoice);
      button.addEventListener("pointerup", applyChoice);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          applyChoice(event);
        }
      });
    });

    cookieBar.addEventListener("click", (event) => {
      const actionTarget = event.target instanceof Element ? event.target.closest("[data-cookie-action]") : null;
      if (!actionTarget) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      persistChoice(actionTarget.getAttribute("data-cookie-action") === "accept" ? "accept" : "essential", cookieBar);
    });

    if (!savedChoice) {
      writeStorage(TRACKER_CONSENT_KEY, JSON.stringify(buildConsent("essential")));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCookieBar, { once: true });
  } else {
    initCookieBar();
  }
})();
