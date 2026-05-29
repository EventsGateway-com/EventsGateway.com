function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value) || 0);
}

function formatAbsoluteNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatTimestamp(value) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return "Waiting for first edge snapshot...";
  }

  return `Updated ${new Date(parsed).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })}`;
}

function renderSparkline(container, values) {
  if (!container) return;
  const list = Array.isArray(values) ? values : [];
  const max = Math.max(...list, 1);
  container.innerHTML = list
    .map((value) => {
      const height = Math.max(10, Math.round((Number(value) / max) * 100));
      return `<span style="height:${height}%"></span>`;
    })
    .join("");
}

function animateCount(element, value) {
  if (!element) return;
  const next = Number(value) || 0;
  const start = Number(element.dataset.value || "0");
  const startedAt = performance.now();
  const duration = 520;

  function frame(now) {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (next - start) * eased;
    element.textContent = formatCompactNumber(current);
    if (progress < 1) {
      window.requestAnimationFrame(frame);
      return;
    }

    element.dataset.value = String(next);
    element.textContent = formatCompactNumber(next);
  }

  window.requestAnimationFrame(frame);
}

async function updateInfrastructureBoard(root) {
  const endpoint = root.getAttribute("data-endpoint") || "/api/infrastructure-status";
  const updated = root.querySelector("[data-infra-updated]");
  const summary = root.querySelector("[data-infra-summary]");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });
    if (!response.ok) return;

    const payload = await response.json();
    const cards = Array.isArray(payload.cards) ? payload.cards : [];
    const totals = payload.totals || {};

    if (updated) {
      updated.textContent = formatTimestamp(payload.updated_at);
    }

    if (summary) {
      summary.textContent =
        `KV ${formatAbsoluteNumber(totals.kv_items)} | DO ${formatAbsoluteNumber(totals.do_items)} | ` +
        `D1 ${formatAbsoluteNumber(totals.d1_rows)} | R2 ${formatAbsoluteNumber(totals.r2_items)}`;
    }

    cards.forEach((card) => {
      const node = root.querySelector(`[data-card-key="${card.key}"]`);
      if (!node) return;

      node.setAttribute("data-card-status", card.status || "ready");

      const value = node.querySelector("[data-card-value]");
      const state = node.querySelector("[data-card-state]");
      const description = node.querySelector("[data-card-description]");
      const spark = node.querySelector("[data-card-spark]");

      animateCount(value, card.value);
      if (state) state.textContent = card.status || "ready";
      if (description) description.textContent = card.description || "";
      renderSparkline(spark, card.sparkline);
    });
  } catch {
    return;
  }
}

function attachInfrastructureBoard() {
  const root = document.querySelector("[data-infra-status]");
  if (!root) return;

  updateInfrastructureBoard(root);
  window.setInterval(() => {
    updateInfrastructureBoard(root);
  }, 3000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachInfrastructureBoard, { once: true });
} else {
  attachInfrastructureBoard();
}
