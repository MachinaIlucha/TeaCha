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
import { initTeacherTabs } from "./features/teachers.js";

import { attachLeadValidation } from "./lead/validation.js";
import { bindLeadForm } from "./lead/bind.js";

import { initBadges } from "./ui/badges.js";

document.addEventListener("DOMContentLoaded", () => {
  // features (safe to call on every page – they self-check DOM)
  initMenu();
  initReviews();
  initPriceTeachers();
  initTeacherTabs();

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
      // validation.js uses dataset.prev to detect deleting
      f.elements.contact.dataset.prev = "";
    }
    if (f.elements.consent) f.elements.consent.checked = false;
  };

  const closeModal = () => {
    modalApi?.close?.();
    // reset here is fine, но ESC может закрывать модалку внутри initModal
    // поэтому ниже есть observer, который гарантирует reset при любом закрытии
    resetConsultForm();
  };

  // close triggers inside modal (x button etc.)
  modalEl?.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  // ✅ гарантированный reset при любом закрытии (ESC / overlay / api.close / etc.)
  if (modalEl) {
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
});
