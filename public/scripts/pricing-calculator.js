const calculatorRoot = document.querySelector("[data-pricing-calculator]");

if (calculatorRoot) {
  const rangeInput = document.querySelector("#pricing-events");
  const exactInput = document.querySelector("#pricing-events-input");
  const selectedNode = document.querySelector("#pricing-selected");
  const totalNode = document.querySelector("#pricing-total");
  const includedNode = document.querySelector("#pricing-included");
  const formatter = new Intl.NumberFormat("en-US");
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  const syncPricing = (rawValue) => {
    const events = Math.max(0, Number(rawValue) || 0);
    const included = 1000000;
    const overage = Math.max(0, events - included);
    const blocks = overage === 0 ? 0 : Math.ceil(overage / 1000000);
    const total = blocks * 5;
    const maxValue = Number(rangeInput?.max || 0) || 0;
    const progress = maxValue > 0 ? Math.min(100, Math.max(0, (events / maxValue) * 100)) : 0;

    if (rangeInput && String(rangeInput.value) !== String(events)) {
      rangeInput.value = String(events);
    }
    if (rangeInput) {
      rangeInput.style.setProperty("--range-progress", `${progress}%`);
    }
    if (exactInput && String(exactInput.value) !== String(events)) {
      exactInput.value = String(events);
    }
    if (selectedNode) {
      selectedNode.textContent = formatter.format(events);
    }
    if (totalNode) {
      totalNode.textContent = currencyFormatter.format(total);
    }
    if (includedNode) {
      includedNode.textContent = formatter.format(included);
    }
  };

  rangeInput?.addEventListener("input", (event) => {
    syncPricing(event.currentTarget?.value);
  });

  exactInput?.addEventListener("input", (event) => {
    syncPricing(event.currentTarget?.value);
  });

  syncPricing(exactInput?.value || rangeInput?.value || 1000000);
}
