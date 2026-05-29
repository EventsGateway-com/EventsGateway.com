(() => {
  function supportsFloating(control) {
    if (!control) {
      return false;
    }

    if (!control.matches("input, select, textarea")) {
      return false;
    }

    if (!control.matches("input")) {
      return true;
    }

    return !control.matches('[type="range"], [type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="hidden"]');
  }

  function prepareField(field) {
    const existingLabel = field.querySelector(":scope > .floating-label");
    const control = field.querySelector("input, select, textarea");
    if (!supportsFloating(control)) {
      return null;
    }

    if (!field.hasAttribute("data-floating-field")) {
      field.setAttribute("data-floating-field", "");
    }
    field.classList.add("floating-field");

    if (control.matches("select")) {
      field.classList.add("floating-field--select");
      control.style.paddingTop = "1.35rem";
      control.style.paddingBottom = "0.62rem";
    } else if (control.matches("textarea")) {
      field.classList.add("floating-field--textarea");
      control.style.paddingTop = "1.35rem";
      control.style.paddingBottom = "0.75rem";
      if (!control.hasAttribute("placeholder")) {
        control.setAttribute("placeholder", " ");
      }
    } else {
      control.style.paddingTop = "1.35rem";
      control.style.paddingBottom = "0.62rem";
      if (!control.hasAttribute("placeholder")) {
        control.setAttribute("placeholder", " ");
      }
    }

    if (existingLabel) {
      return control;
    }

    const plainLabel = Array.from(field.children).find((node) => node.tagName === "SPAN");
    if (plainLabel) {
      plainLabel.classList.add("floating-label");
    }

    return control;
  }

  function syncFieldState(field) {
    const control = field.querySelector("input, select, textarea");
    if (!control) {
      return;
    }

    const value = "value" in control ? String(control.value || "").trim() : "";
    field.classList.toggle("is-filled", value.length > 0);
  }

  function activateField(field, active) {
    field.classList.toggle("is-active", active);
  }

  function bindField(field) {
    const control = prepareField(field);
    if (!control) {
      return;
    }

    syncFieldState(field);

    control.addEventListener("focus", () => activateField(field, true));
    control.addEventListener("blur", () => {
      activateField(field, false);
      syncFieldState(field);
    });
    control.addEventListener("input", () => syncFieldState(field));
    control.addEventListener("change", () => syncFieldState(field));
  }

  function initFloatingLabels() {
    const explicitFields = Array.from(document.querySelectorAll("[data-floating-field]"));
    const inferredFields = Array.from(document.querySelectorAll("label")).filter((field) => {
      if (field.hasAttribute("data-floating-field")) {
        return false;
      }
      const control = field.querySelector("input, select, textarea");
      const textNode = field.querySelector(":scope > span");
      return Boolean(supportsFloating(control) && textNode);
    });

    [...explicitFields, ...inferredFields].forEach((field) => bindField(field));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFloatingLabels, { once: true });
  } else {
    initFloatingLabels();
  }
})();
