const searchInput = document.querySelector("#compare-search");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
const compareEntries = Array.from(document.querySelectorAll(".compare-entry"));
const compareSections = Array.from(document.querySelectorAll(".compare-section"));

let activeFilter = "all";

const syncCompareView = () => {
  const query = (searchInput?.value ?? "").trim().toLowerCase();

  compareEntries.forEach((entry) => {
    const category = entry.getAttribute("data-category") ?? "";
    const haystack = [
      entry.getAttribute("data-title") ?? "",
      entry.getAttribute("data-text") ?? "",
      entry.getAttribute("data-badge") ?? "",
      category.toLowerCase()
    ].join(" ");

    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const matchesQuery = query.length === 0 || haystack.includes(query);
    entry.hidden = !(matchesFilter && matchesQuery);
  });

  compareSections.forEach((section) => {
    const visibleCards = section.querySelectorAll(".compare-entry:not([hidden])").length;
    section.hidden = visibleCards === 0;
  });
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.getAttribute("data-filter") ?? "all";
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    syncCompareView();
  });
});

searchInput?.addEventListener("input", syncCompareView);
syncCompareView();
