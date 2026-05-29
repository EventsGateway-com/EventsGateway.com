const draggableContainerSelectors = [
  ".card-grid",
  ".stats-grid",
  ".capability-grid",
  ".triple-grid",
  ".timeline",
  ".contact-grid",
  ".command-grid",
  ".pricing-summary-grid",
  ".pricing-breakdown"
];

const interactiveSelector = "a, button, input, select, textarea, summary, label";
let dragZIndex = 10;
const dragGridSize = 24;

function normalizeKeyPart(value) {
  return (value || "card")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function resolveCardLabel(element) {
  const titleCandidate = element.querySelector("h1, h2, h3, strong, .kicker, .eyebrow, .premium-card__title");
  return normalizeKeyPart(titleCandidate?.textContent || element.textContent || "card");
}

function readState(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    return null;
  }
}

function writeState(storageKey, state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
}

function snapToGrid(value, size = dragGridSize) {
  return Math.round(value / size) * size;
}

function applyState(element, state) {
  element.style.position = "relative";
  element.style.zIndex = String(state.z || 1);
  element.style.transform = `translate3d(${state.x || 0}px, ${state.y || 0}px, 0)`;
  element.style.touchAction = "none";
  element.style.cursor = "grab";
}

function makeCardDraggable(element, storageKey) {
  const savedState = readState(storageKey) || { x: 0, y: 0, z: 1 };
  applyState(element, savedState);

  let dragState = savedState;
  let start = null;

  element.addEventListener("pointerdown", (event) => {
    if (event.target.closest(interactiveSelector)) {
      return;
    }

    start = {
      x: event.clientX,
      y: event.clientY,
      cardX: dragState.x || 0,
      cardY: dragState.y || 0
    };

    dragState = {
      ...dragState,
      z: ++dragZIndex
    };
    applyState(element, dragState);

    const onMove = (moveEvent) => {
      if (!start) {
        return;
      }

      dragState = {
        ...dragState,
        x: snapToGrid(start.cardX + (moveEvent.clientX - start.x)),
        y: snapToGrid(start.cardY + (moveEvent.clientY - start.y))
      };
      applyState(element, dragState);
    };

    const onUp = () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.releasePointerCapture(event.pointerId);
      writeState(storageKey, dragState);
      start = null;
    };

    element.setPointerCapture(event.pointerId);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp, { once: true });
    element.addEventListener("pointercancel", onUp, { once: true });
  });
}

draggableContainerSelectors.forEach((selector, containerIndex) => {
  document.querySelectorAll(selector).forEach((container, elementIndex) => {
    Array.from(container.children).forEach((child, childIndex) => {
      if (!(child instanceof HTMLElement)) {
        return;
      }

      const storageKey = [
        "eg:card-drag",
        window.location.pathname,
        normalizeKeyPart(selector),
        containerIndex,
        elementIndex,
        childIndex,
        resolveCardLabel(child)
      ].join(":");

      makeCardDraggable(child, storageKey);
    });
  });
});
