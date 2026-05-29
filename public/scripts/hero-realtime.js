function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function renderBars(container, history, key) {
  if (!container) return;
  const values = history.map((item) => Number(item[key]) || 0);
  const max = Math.max(...values, 1);
  container.innerHTML = history
    .map((item) => {
      const value = Number(item[key]) || 0;
      const height = Math.max(8, Math.round((value / max) * 100));
      const title = `${item.label}: ${key.includes("value") ? formatUsd(value) : formatNumber(value)}`;
      return `<span style="height:${height}%" title="${title}"></span>`;
    })
    .join("");
}

async function updateLiveHero(root) {
  const endpoint = root.getAttribute("data-endpoint") || "/api/live-stats";
  const eventsValue = root.querySelector("[data-live-events]");
  const events24h = root.querySelector("[data-live-events-24h]");
  const valueNow = root.querySelector("[data-live-value]");
  const value24h = root.querySelector("[data-live-value-24h]");
  const eventsBars = root.querySelector("[data-live-events-bars]");
  const valueBars = root.querySelector("[data-live-value-bars]");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) return;
    const payload = await response.json();
    const history = Array.isArray(payload.history) ? payload.history : [];

    if (eventsValue) eventsValue.textContent = formatNumber(payload.current_routed_events);
    if (events24h) events24h.textContent = formatNumber(payload.last_24h_routed_events);
    if (valueNow) valueNow.textContent = formatUsd(payload.current_routed_value_usd);
    if (value24h) value24h.textContent = formatUsd(payload.last_24h_routed_value_usd);

    renderBars(eventsBars, history, "routed_events");
    renderBars(valueBars, history, "routed_value_usd");
  } catch {
    // Keep the last rendered values when the public telemetry endpoint is briefly unavailable.
  }
}

function attachLiveHero() {
  const root = document.querySelector("[data-live-hero]");
  if (!root) return;

  updateLiveHero(root);
  window.setInterval(() => {
    updateLiveHero(root);
  }, 2000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachLiveHero, { once: true });
} else {
  attachLiveHero();
}
