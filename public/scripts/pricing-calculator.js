const calculatorRoot = document.querySelector("[data-pricing-calculator]");

if (calculatorRoot) {
  const rangeInput = document.querySelector("#pricing-events");
  const exactInput = document.querySelector("#pricing-events-input");
  const totalNode = document.querySelector("#pricing-total");
  const blocksNode = document.querySelector("#pricing-blocks");
  const includedNode = document.querySelector("#pricing-included");
  const overageNode = document.querySelector("#pricing-overage");
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

    if (rangeInput && String(rangeInput.value) !== String(events)) {
      rangeInput.value = String(events);
    }
    if (exactInput && String(exactInput.value) !== String(events)) {
      exactInput.value = String(events);
    }
    if (totalNode) {
      totalNode.textContent = currencyFormatter.format(total);
    }
    if (blocksNode) {
      blocksNode.textContent = formatter.format(blocks);
    }
    if (includedNode) {
      includedNode.textContent = formatter.format(included);
    }
    if (overageNode) {
      overageNode.textContent = formatter.format(overage);
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
