document.querySelectorAll("[data-window-matrix]").forEach((root) => {
  if (!root || root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const stage = root.querySelector(".mockup__stage");
  const windows = Array.from(root.querySelectorAll(".widget-window"));
  const dockItems = new Map(
    Array.from(root.querySelectorAll("[data-dock-item]")).map((item) => [item.dataset.dockItem, item])
  );
  const storageKey = `window-matrix:${root.dataset.instance || "default"}`;
  let zIndex = windows.length + 1;

  const defaults = Object.fromEntries(
    windows.map((window) => [
      window.dataset.windowId,
      {
        x: Number(window.dataset.x),
        y: Number(window.dataset.y),
        w: Number(window.dataset.w),
        h: Number(window.dataset.h),
        z: Number(window.dataset.z),
        minimized: false,
        maximized: false,
        restoreRect: null
      }
    ])
  );

  let state = structuredClone(defaults);

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      state = { ...state, ...JSON.parse(saved) };
    }
  } catch {}

  const saveState = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  };

  const clampRect = (rect) => ({
    ...rect,
    w: Math.min(Math.max(rect.w, 24), 94),
    h: Math.min(Math.max(rect.h, 20), 76),
    x: Math.min(Math.max(rect.x, 2), 98 - Math.min(Math.max(rect.w, 24), 94)),
    y: Math.min(Math.max(rect.y, 3), 84 - Math.min(Math.max(rect.h, 20), 76))
  });

  const applyWindow = (window) => {
    const id = window.dataset.windowId;
    const current = clampRect(state[id]);
    state[id] = current;
    window.style.left = `${current.x}%`;
    window.style.top = `${current.y}%`;
    window.style.width = `${current.w}%`;
    window.style.height = `${current.h}%`;
    window.style.zIndex = String(current.z);
    window.classList.toggle("is-minimized", current.minimized);
    window.classList.toggle("is-maximized", current.maximized);
    dockItems.get(id)?.classList.toggle("is-visible", current.minimized);
  };

  const render = () => {
    windows.forEach(applyWindow);
    saveState();
  };

  const bringToFront = (id) => {
    state[id].z = zIndex++;
  };

  const minimizeWindow = (id) => {
    state[id].minimized = true;
    state[id].maximized = false;
    render();
  };

  const toggleMaximize = (id) => {
    const current = state[id];
    if (current.maximized && current.restoreRect) {
      Object.assign(current, current.restoreRect, { maximized: false, restoreRect: null, minimized: false });
    } else {
      current.restoreRect = { x: current.x, y: current.y, w: current.w, h: current.h };
      Object.assign(current, { x: 3, y: 6, w: 94, h: 72, maximized: true, minimized: false });
    }
    bringToFront(id);
    render();
  };

  const restoreWindow = (id) => {
    state[id].minimized = false;
    bringToFront(id);
    render();
  };

  windows.forEach((window) => {
    const id = window.dataset.windowId;
    const handle = window.querySelector("[data-drag-handle]");
    handle?.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      if (state[id].maximized || !stage) return;
      bringToFront(id);
      render();
      const stageRect = stage.getBoundingClientRect();
      const start = { x: event.clientX, y: event.clientY, rect: { ...state[id] } };

      const onMove = (moveEvent) => {
        const nextRect = {
          ...state[id],
          x: start.rect.x + ((moveEvent.clientX - start.x) / stageRect.width) * 100,
          y: start.rect.y + ((moveEvent.clientY - start.y) / stageRect.height) * 100
        };
        state[id] = clampRect(nextRect);
        applyWindow(window);
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.releasePointerCapture(event.pointerId);
        saveState();
      };

      window.setPointerCapture(event.pointerId);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    });

    window.querySelector('[data-action="minimize"]')?.addEventListener("click", () => minimizeWindow(id));
    window.querySelector('[data-action="toggle-maximize"]')?.addEventListener("click", () => toggleMaximize(id));
    window.addEventListener("pointerdown", () => {
      if (!state[id].minimized) {
        bringToFront(id);
        render();
      }
    });
  });

  dockItems.forEach((item, id) => item.addEventListener("click", () => restoreWindow(id)));
  render();
});
