(() => {
  const COOKIE_CHOICE_KEY = "eg:site-cookie-choice";
  const TRACKER_CONSENT_KEY = "eg:consent";
  const cookieBar = document.querySelector("[data-cookie-bar]");

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

  function persistChoice(choice) {
    const consent = buildConsent(choice);
    localStorage.setItem(COOKIE_CHOICE_KEY, choice);
    localStorage.setItem(TRACKER_CONSENT_KEY, JSON.stringify(consent));
    if (window.eventsgateway?.setConsent) {
      window.eventsgateway.setConsent(consent);
    }
    window.dispatchEvent(new CustomEvent("eg:cookie-consent", { detail: { choice, consent } }));
    if (cookieBar) {
      cookieBar.hidden = true;
    }
  }

  const savedChoice = localStorage.getItem(COOKIE_CHOICE_KEY);

  if (cookieBar) {
    cookieBar.hidden = Boolean(savedChoice);
    cookieBar.querySelectorAll("[data-cookie-action]").forEach((button) => {
      button.addEventListener("click", () => {
        persistChoice(button.dataset.cookieAction === "accept" ? "accept" : "essential");
      });
    });
  }

  if (!savedChoice) {
    localStorage.setItem(TRACKER_CONSENT_KEY, JSON.stringify(buildConsent("essential")));
  }
})();
