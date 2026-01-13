/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { initModal } from "./core/modal.js";
import { initTopbarHeightVar } from "./core/layout.js";

import { initMenu } from "./features/menu.js";
import { initReviews } from "./features/reviews.js";
import { initPriceTeachers } from "./features/price.js";

import { attachLeadValidation } from "./lead/validation.js";
import { bindLeadForm } from "./lead/bind.js";

import { initBadges } from "./ui/badges.js";

const boot = () => {
  // features (safe to call on every page – they self-check DOM)
  initMenu();
  initReviews();
  initPriceTeachers();

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
  attachLeadValidation(document.querySelector(".price-lead__form"));
  attachLeadValidation(document.getElementById("consultForm"));

  bindLeadForm("#consultForm", { source: "modal", onSuccess: closeModal });
  bindLeadForm(".price-lead__form", { source: "price" });

  // layout helpers
  initTopbarHeightVar();

  // ui
  initBadges();
};

// 1) обычная загрузка
document.addEventListener("DOMContentLoaded", boot);

// 2) Astro client navigation / view transitions
document.addEventListener("astro:page-load", boot);
