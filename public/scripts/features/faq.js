/**
 * TeaCha website — FAQ
 * © 2026. All rights reserved.
 *
 * Accordion with smooth height animation.
 * Markup:
 *  [data-faq] -> [data-faq-item] -> button.faqItem__btn + .faqItem__panel[hidden]
 */

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function reduced() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

function setExpanded(btn, expanded) {
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function animateOpen(panel) {
  if (!panel) return;

  panel.hidden = false;

  if (reduced()) {
    panel.style.height = "auto";
    panel.style.overflow = "";
    return;
  }

  panel.style.overflow = "hidden";
  panel.style.height = "0px";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = panel.scrollHeight;
      panel.style.height = `${target}px`;

      const onEnd = (e) => {
        if (e.target !== panel) return;
        if (e.propertyName !== "height") return;
        panel.removeEventListener("transitionend", onEnd);

        panel.style.height = "auto";
        panel.style.overflow = "";
      };

      panel.addEventListener("transitionend", onEnd);
    });
  });
}

function animateClose(panel) {
  if (!panel) return;

  if (reduced()) {
    panel.hidden = true;
    panel.style.height = "0px";
    panel.style.overflow = "";
    return;
  }

  const start = panel.scrollHeight;
  panel.style.overflow = "hidden";
  panel.style.height = `${start}px`;

  // reflow
  panel.offsetHeight;

  requestAnimationFrame(() => {
    panel.style.height = "0px";

    const onEnd = (e) => {
      if (e.target !== panel) return;
      if (e.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onEnd);

      panel.hidden = true;
      panel.style.overflow = "";
      panel.style.height = "0px";
    };

    panel.addEventListener("transitionend", onEnd);
  });
}

export function initFaq() {
  const root = qs("[data-faq]");
  if (!root) return;

  // ✅ guard from double init
  if (root.dataset.faqInit === "1") return;
  root.dataset.faqInit = "1";

  const items = qsa("[data-faq-item]", root);
  if (!items.length) return;

  const listeners = [];

  const closeItem = (item) => {
    const btn = qs(".faqItem__btn", item);
    const panel = qs(".faqItem__panel", item);

    item.classList.remove("is-open");
    if (btn) setExpanded(btn, false);
    if (panel) animateClose(panel);
  };

  const openItem = (item) => {
    const btn = qs(".faqItem__btn", item);
    const panel = qs(".faqItem__panel", item);

    item.classList.add("is-open");
    if (btn) setExpanded(btn, true);
    if (panel) animateOpen(panel);
  };

  const stop = (e) => {
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function")
      e.stopImmediatePropagation();
  };

  // перехватываем раньше document click-closer’ов
  const onPointerDown = (e) => {
    if (e.target && btn.contains(e.target)) stop(e);
  };

  const toggleItem = (item) => {
    const isOpen = item.classList.contains("is-open");
    if (isOpen) closeItem(item);
    else openItem(item);
  };

  items.forEach((item) => {
    const btn = qs(".faqItem__btn", item);
    const panel = qs(".faqItem__panel", item);
    if (!btn || !panel) return;

    // normalize initial state
    const expanded = btn.getAttribute("aria-expanded") === "true";
    if (expanded) {
      item.classList.add("is-open");
      panel.hidden = false;
      panel.style.height = "auto";
    } else {
      item.classList.remove("is-open");
      panel.hidden = true;
      panel.style.height = "0px";
    }

    // ✅ prevent double binding per item
    if (item.dataset.faqBound === "1") return;
    item.dataset.faqBound = "1";

    // ✅ block "outside click closers" (very common on sites)
    const stop = (e) => {
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
      }
    };

    // capture pointerdown early (before any document click closers)
    const onPointerDown = (e) => {
      if (e.target && btn.contains(e.target)) stop(e);
    };

    // click toggler (also blocks bubbling)
    const onClick = (e) => {
      e.preventDefault();
      stop(e);
      toggleItem(item);
    };

    btn.addEventListener("pointerdown", onPointerDown, true);
    btn.addEventListener("click", onClick);

    listeners.push(() =>
      btn.removeEventListener("pointerdown", onPointerDown, true),
    );
    listeners.push(() => btn.removeEventListener("click", onClick));
  });

  // cleanup on astro navigation
  const cleanup = () => {
    listeners.forEach((off) => off());
    root.dataset.faqInit = "0";
  };

  window.addEventListener("astro:before-swap", cleanup, { once: true });
}
