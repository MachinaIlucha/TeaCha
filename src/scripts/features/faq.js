/**
 * TeaCha website — FAQ
 * © 2026. All rights reserved.
 *
 * Accordion with smooth height animation.
 * Markup:
 *  [data-faq] -> [data-faq-item] -> button.faqItem__btn + .faqItem__panel[hidden]
 */

import { qsa } from "../core/dom.js";
import { prefersReducedMotion } from "../core/motion.js";

function setExpanded(btn, expanded) {
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
}

function clearPanelRuntime(panel) {
  if (panel.__faqRaf) {
    cancelAnimationFrame(panel.__faqRaf);
    panel.__faqRaf = 0;
  }
  if (panel.__faqOnEnd) {
    panel.removeEventListener("transitionend", panel.__faqOnEnd);
    panel.__faqOnEnd = null;
  }
}

function animatePanel(panel, shouldOpen) {
  if (!panel) return;

  clearPanelRuntime(panel);
  panel.hidden = false;

  if (prefersReducedMotion()) {
    panel.hidden = !shouldOpen;
    panel.style.height = shouldOpen ? "auto" : "0px";
    panel.style.overflow = "";
    return;
  }

  const start = panel.getBoundingClientRect().height;
  panel.style.overflow = "hidden";
  panel.style.height = `${start}px`;

  panel.offsetHeight;

  const target = shouldOpen ? panel.scrollHeight : 0;
  if (Math.round(start) === Math.round(target)) {
    panel.hidden = !shouldOpen;
    panel.style.height = shouldOpen ? "auto" : "0px";
    panel.style.overflow = "";
    return;
  }

  panel.__faqRaf = requestAnimationFrame(() => {
    panel.style.height = `${target}px`;

    const onEnd = (e) => {
      if (e.target !== panel || e.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onEnd);
      panel.__faqOnEnd = null;

      panel.hidden = !shouldOpen;
      panel.style.height = shouldOpen ? "auto" : "0px";
      panel.style.overflow = "";
    };

    panel.__faqOnEnd = onEnd;
    panel.addEventListener("transitionend", onEnd);
  });
}

export function initFaq() {
  const roots = qsa("[data-faq]");
  if (!roots.length) return;

  roots.forEach((root) => {
    if (root.dataset.faqInit === "1") return;
    root.dataset.faqInit = "1";

    const items = qsa("[data-faq-item]", root);
    if (!items.length) return;

    const closeItem = (item) => {
      const btn = item.querySelector(".faqItem__btn");
      const panel = item.querySelector(".faqItem__panel");
      if (!btn || !panel) return;

      item.classList.remove("is-open");
      setExpanded(btn, false);
      animatePanel(panel, false);
    };

    const openItem = (item) => {
      const btn = item.querySelector(".faqItem__btn");
      const panel = item.querySelector(".faqItem__panel");
      if (!btn || !panel) return;

      item.classList.add("is-open");
      setExpanded(btn, true);
      animatePanel(panel, true);
    };

    items.forEach((item) => {
      const btn = item.querySelector(".faqItem__btn");
      const panel = item.querySelector(".faqItem__panel");
      if (!btn || !panel) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      item.classList.toggle("is-open", expanded);
      panel.hidden = !expanded;
      panel.style.height = expanded ? "auto" : "0px";
      panel.style.overflow = "";
    });

    const onClick = (e) => {
      if (!(e.target instanceof Element)) return;
      const btn = e.target.closest(".faqItem__btn");
      if (!btn || !root.contains(btn)) return;

      e.preventDefault();
      const item = btn.closest("[data-faq-item]");
      if (!item) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) closeItem(item);
      else openItem(item);
    };

    root.addEventListener("click", onClick);

    const cleanup = () => {
      root.removeEventListener("click", onClick);
      root.dataset.faqInit = "0";

      items.forEach((item) => {
        const panel = item.querySelector(".faqItem__panel");
        if (panel) clearPanelRuntime(panel);
      });
    };

    window.addEventListener("astro:before-swap", cleanup, { once: true });
  });
}
