import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app";
import { AuthProvider } from "./auth";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false
    }
  }
});

function FloatingFieldManager() {
  useEffect(() => {
    const cleanupCallbacks: Array<() => void> = [];

    const bindField = (field: Element) => {
      if (!(field instanceof HTMLElement) || field.dataset.floatingReady === "true") {
        return;
      }

      const label = field.querySelector(":scope > span");
      const control = field.querySelector("input, select, textarea");
      if (!(label instanceof HTMLSpanElement) || !(control instanceof HTMLElement)) {
        return;
      }

      if (
        control instanceof HTMLInputElement &&
        ["checkbox", "radio", "button", "submit", "reset", "hidden", "range"].includes(control.type)
      ) {
        return;
      }

      field.dataset.floatingReady = "true";
      field.classList.add("eg-field--floating");

      if (control instanceof HTMLSelectElement) {
        field.classList.add("eg-field--select", "is-filled");
      } else if (control instanceof HTMLTextAreaElement) {
        field.classList.add("eg-field--textarea");
        if (!control.hasAttribute("placeholder")) {
          control.setAttribute("placeholder", " ");
        }
      } else if (control instanceof HTMLInputElement && !control.hasAttribute("placeholder")) {
        control.setAttribute("placeholder", " ");
      }

      const syncState = () => {
        if (control instanceof HTMLSelectElement) {
          field.classList.add("is-filled");
          return;
        }
        field.classList.toggle("is-filled", String((control as HTMLInputElement | HTMLTextAreaElement).value ?? "").trim().length > 0);
      };

      const handleFocus = () => field.classList.add("is-active");
      const handleBlur = () => {
        field.classList.remove("is-active");
        syncState();
      };

      syncState();
      control.addEventListener("input", syncState);
      control.addEventListener("change", syncState);
      control.addEventListener("focus", handleFocus);
      control.addEventListener("blur", handleBlur);

      cleanupCallbacks.push(() => {
        control.removeEventListener("input", syncState);
        control.removeEventListener("change", syncState);
        control.removeEventListener("focus", handleFocus);
        control.removeEventListener("blur", handleBlur);
      });
    };

    const scanFields = () => {
      document.querySelectorAll(".eg-field").forEach((field) => bindField(field));
    };

    scanFields();

    const observer = new MutationObserver(() => {
      scanFields();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      cleanupCallbacks.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <FloatingFieldManager />
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
