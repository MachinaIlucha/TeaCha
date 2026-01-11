/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { initMenu } from "./menu.js";
import { initReviews } from "./reviews.js";
import { initPriceTeachers } from "./price.js";
import { initTeacherTabs } from "./teachers.js";

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initReviews();
  initPriceTeachers();
  initTeacherTabs();

  // Modal
  const modal = document.getElementById("consultModal");
  const form = document.getElementById("consultForm");

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (modal) {
    const openBtns = document.querySelectorAll("[data-open-modal]");
    const closeBtns = document.querySelectorAll("[data-close-modal]");

    openBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // Form -> /api/lead
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        name: form.elements.name?.value?.trim() || "",
        contact: form.elements.contact?.value?.trim() || "",
        email: form.elements.email?.value?.trim() || "",
      };

      if (!payload.name || !payload.contact) {
        alert("Заповніть ім'я та контакт");
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const prevText = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Відправляємо…";
      }

      try {
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) {
          throw new Error(json.error || `HTTP ${res.status}`);
        }

        form.reset();
        closeModal();
        alert("Заявку надіслано!");
      } catch (err) {
        console.error(err);
        alert("Помилка відправки. Спробуйте ще раз.");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = prevText || "ЗАЛИШИТИ ЗАЯВКУ";
        }
      }
    });
  }

  // Topbar height css var
  const topbar = document.querySelector(".topbar");
  const setTopbarH = () => {
    if (!topbar) return;
    document.documentElement.style.setProperty(
      "--topbar-h",
      `${topbar.offsetHeight}px`
    );
  };

  setTopbarH();
  window.addEventListener("resize", setTopbarH);
});
