import { attachLeadValidation } from "../lead/validation.js";
import { bindLeadForm } from "../lead/bind.js";

/**
 * LeadDock:
 * - binds form submit/validation
 * - hides when #start-lead is visible
 * - sets CSS var --leadDock-pad to dock height while visible
 * Astro-safe (guards + cleanup)
 */
export const initLeadDock = () => {
  const dock = document.getElementById("lead-dock");
  const form = document.getElementById("lead-dock-form");
  const target = document.getElementById("start-lead");

  if (!dock || !form || !target) return;

  // prevent double bind on astro navigation
  if (dock.dataset.bound === "1") return;
  dock.dataset.bound = "1";

  attachLeadValidation(form);
  bindLeadForm("#lead-dock-form", { source: "lead-dock" });

  const setPad = (px) => {
    document.documentElement.style.setProperty("--leadDock-pad", `${px}px`);
  };

  const getDockPad = () => {
    const hidden = dock.classList.contains("is-hidden");
    if (hidden) return 0;
    const h = Math.ceil(dock.getBoundingClientRect().height);
    return h > 0 ? h + 12 : 0; // немного воздуха
  };

  const applyPad = () => setPad(getDockPad());

  const setHidden = (hidden) => {
    dock.classList.toggle("is-hidden", !!hidden);
    applyPad();
  };

  // initial
  applyPad();

  // keep pad synced with height changes (fonts, sticker load, viewport changes)
  const ro = new ResizeObserver(() => applyPad());
  ro.observe(dock);

  // hide/show when reaching start-lead
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      setHidden(entry.isIntersecting);
    },
    {
      root: null,
      rootMargin: "0px 0px -25% 0px",
      threshold: 0.01,
    }
  );

  io.observe(target);

  // extra safety for viewport changes
  const onResize = () => applyPad();
  window.addEventListener("resize", onResize, { passive: true });

  // Astro cleanup
  const onBeforeSwap = () => {
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("resize", onResize);
    dock.dataset.bound = "0";
    setPad(0);
    window.removeEventListener("astro:before-swap", onBeforeSwap);
  };

  window.addEventListener("astro:before-swap", onBeforeSwap);
};
