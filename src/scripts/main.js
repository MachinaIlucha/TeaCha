/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { initModal } from "./core/modal.js";
import { initTopbarHeightVar } from "./core/layout.js";

import { initMenu } from "./features/menu.js";
import { initReviews } from "./features/reviews.js";
import { initPrices } from "./features/price.js";
import { initMarquee } from "./features/marquee.js";

import { attachLeadValidation } from "./lead/validation.js";
import { bindLeadForm } from "./lead/bind.js";

import { initBadges } from "./ui/badges.js";
import { initFactsReveal } from "./ui/facts.js";
import { initProcessReveal } from "./ui/process.js";
import "./ui/reveal.js";
import { initHeroLoadReveal } from "./ui/hero-load-reveal.js";
import { initFaq } from "./features/faq.js";
import { initStartLead } from "./lead/startLead.js";
import { initFooterLead } from "./lead/footerLead.js";
import { initLeadDock } from "./features/leadDock.js";
import { initBackToTop } from "./features/backToTop.js";
import { initLevelTest } from "./features/levelTest.js";

const boot = () => {
  // features (safe to call on every page – they self-check DOM)
  initMenu();
  initReviews();
  initFaq();
  initPrices();
  initMarquee();
  initStartLead();
  initFooterLead();
  initLeadDock();
  initBackToTop();
  initFactsReveal();
  initProcessReveal();
  initLevelTest();

  // modal
  const modalEl = document.getElementById("consultModal");
  const modalApi = initModal({ modalId: "consultModal" });

  const resetConsultForm = () => {
    const f = document.getElementById("consultForm");
    if (!f) return;

    f.reset();

    if (f.elements.name) f.elements.name.value = "";
    if (f.elements.contact) {
      f.elements.contact.value = "";
      f.elements.contact.dataset.prev = "";
    }
    if (f.elements.consent) f.elements.consent.checked = false;
  };

  const closeModal = () => {
    modalApi?.close?.();
    resetConsultForm();
  };

  // close triggers inside modal (x button etc.)
  modalEl?.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  // гарантированный reset при любом закрытии (ESC / overlay / api.close / etc.)
  if (modalEl && !modalEl.dataset.resetObserver) {
    modalEl.dataset.resetObserver = "1";

    const observer = new MutationObserver(() => {
      if (!modalEl.classList.contains("is-open")) {
        resetConsultForm();
      }
    });

    observer.observe(modalEl, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // forms
  attachLeadValidation(document.getElementById("consultForm"));

  bindLeadForm("#consultForm", { source: "modal", onSuccess: closeModal });

  // layout helpers
  initTopbarHeightVar();

  // ui
  initBadges();
  initHeroLoadReveal(); // ✅ NEW (hero appears smoothly on load)
};

// 1) обычная загрузка
document.addEventListener("DOMContentLoaded", boot);

// 2) Astro client navigation / view transitions
document.addEventListener("astro:page-load", boot);
