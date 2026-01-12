/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { initMenu } from "./menu.js";
import { initReviews } from "./reviews.js";
import { initPriceTeachers } from "./price.js";
import { initTeacherTabs } from "./teachers.js";

/* =========================
   Toasts
========================= */
const toast = (() => {
  const root = () => document.querySelector(".toasts");

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const show = ({ type = "success", title, text, timeout = 3500 }) => {
    const host = root();
    if (!host) return;

    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast__dot" aria-hidden="true"></span>
      <div>
        <p class="toast__title">${escapeHtml(title)}</p>
        ${text ? `<p class="toast__text">${escapeHtml(text)}</p>` : ""}
      </div>
      <button class="toast__close" type="button" aria-label="Закрити">✕</button>
    `;

    const close = () => {
      el.style.animation = "toast-out 160ms ease forwards";
      window.setTimeout(() => el.remove(), 170);
    };

    el.querySelector(".toast__close")?.addEventListener("click", close);
    host.appendChild(el);
    window.setTimeout(close, timeout);
  };

  return {
    success: (title, text) => show({ type: "success", title, text }),
    error: (title, text) => show({ type: "error", title, text }),
  };
})();

/* =========================
   Lead submit helpers
========================= */
const userMessageByCode = (code) => {
  switch (code) {
    case "VALIDATION":
      return "Перевірте ім'я та контакт";
    case "BAD_REQUEST":
      return "Не вдалося обробити дані форми";
    case "UPSTREAM":
      return "Сервіс тимчасово недоступний. Спробуйте пізніше";
    case "SERVER_CONFIG":
      return "Технічні роботи. Спробуйте трохи пізніше";
    default:
      return "Не вдалося надіслати заявку. Спробуйте ще раз";
  }
};

const postLead = async ({ name, contact, source }) => {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, contact, source }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json.ok) {
    toast.error("Не надіслано", userMessageByCode(json?.code));
    console.error("Lead submit failed", { status: res.status, json });
    return { ok: false, json, status: res.status };
  }

  toast.success("Надіслано", "Ми скоро напишемо вам 🙂");
  return { ok: true, json, status: res.status };
};

/**
 * Bind any form with name/contact fields to /api/lead
 * @param {string} selector - form selector
 * @param {object} opts
 * @param {string} [opts.source] - tag for telegram (optional)
 * @param {() => void} [opts.onSuccess] - callback after success (optional)
 */
const bindLeadForm = (selector, opts = {}) => {
  const form = document.querySelector(selector);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.elements.name?.value?.trim() || "";
    const contact = form.elements.contact?.value?.trim() || "";

    if (!name || !contact) {
      toast.error("Перевірте форму", "Заповніть ім'я та контакт");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const prevText = btn?.textContent;

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Відправляємо…";
    }

    try {
      const result = await postLead({ name, contact, source: opts.source });
      if (result.ok) {
        form.reset();
        opts.onSuccess?.();
      }
    } catch (err) {
      console.error("Lead submit error", err);
      toast.error("Помилка", "Не вдалося надіслати заявку. Спробуйте ще раз");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prevText || "ЗАЛИШИТИ ЗАЯВКУ";
      }
    }
  });
};

/* =========================
   App init
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initReviews();
  initPriceTeachers();
  initTeacherTabs();
  attachLeadValidation(document.querySelector(".price-lead__form"));
  attachLeadValidation(document.getElementById("consultForm"));

  // Modal
  const modal = document.getElementById("consultModal");
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
  };

  if (modal) {
    document.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        document.body.classList.add("modal-open");
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // ✅ Bind BOTH forms with one function
  bindLeadForm("#consultForm", { source: "modal", onSuccess: closeModal });
  bindLeadForm(".price-lead__form", { source: "price" });

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

  document.querySelectorAll(".badge--round").forEach((el, i) => {
    console.log("[badge-pulse] init", i, el);

    const delay = -(Math.random() * 2.8).toFixed(2) + "s";
    el.style.setProperty("--halo-delay", delay);

    const dur = (2.6 + Math.random() * 0.8).toFixed(2) + "s";
    el.style.setProperty("--halo-dur", dur);

    el.classList.add("is-intro");
    setTimeout(() => el.classList.remove("is-intro"), 480);
  });

  window.addEventListener("resize", setTopbarH);
});

const isLetter = (ch) => /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(ch);

const normalizeName = (raw) => raw.trim().replace(/\s+/g, " ");

const isValidName = (value) => {
  const v = normalizeName(value);
  if (v.length < 2) return false;

  // только буквы + пробел + ' + ,
  if (!/^[A-Za-zА-Яа-яІіЇїЄєҐґ\s',]+$/.test(v)) return false;

  // минимум 2 буквы (не просто " ,")
  const letters = v.match(/[A-Za-zА-Яа-яІіЇїЄєҐґ]/g)?.length || 0;
  return letters >= 2;
};

const detectContactMode = (value) => {
  const v = value.trim();
  if (!v) return null;

  const first = v[0];
  if (first === "+" || /[0-9]/.test(first)) return "phone";
  if (first === "@") return "tg";
  if (isLetter(first)) return "tg";

  // если первый символ странный — оставляем как есть
  return null;
};

const formatUA = (input) => {
  // оставляем только цифры
  let digits = input.replace(/\D/g, "");

  // если человек начал с 0XXXXXXXXX → превращаем в 380XXXXXXXXX
  if (digits.startsWith("0")) digits = "38" + digits;

  // если человек ввёл уже 380... — ок
  if (!digits.startsWith("380")) {
    // если ввёл 80..., 3..., 380... — аккуратно приводим
    if (digits.startsWith("80")) digits = "3" + digits;
    if (digits.startsWith("3") && !digits.startsWith("380"))
      digits = "380" + digits.slice(1);
  }

  // максимум 12 цифр (380 + 9)
  digits = digits.slice(0, 12);

  // всегда показываем + в начале
  return digits ? `+${digits}` : "";
};

const isValidUA = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("380");
};

const formatTG = (input) => {
  let v = input.trim();

  // авто-добавляем @ если человек начал буквами/цифрами/underscore
  if (v && v[0] !== "@") v = "@" + v;

  // удаляем пробелы
  v = v.replace(/\s+/g, "");

  // оставляем только допустимые символы
  v = "@" + v.slice(1).replace(/[^A-Za-z0-9_]/g, "");

  // максимум 32 после @
  if (v.length > 33) v = v.slice(0, 33);

  return v;
};

const isValidTG = (value) => /^@[A-Za-z0-9_]{5,32}$/.test(value);

const attachLeadValidation = (form) => {
  if (!form) return;

  const nameInput = form.elements.name;
  const contactInput = form.elements.contact;
  if (!nameInput || !contactInput) return;

  // Имя: чистим двойные пробелы
  nameInput.addEventListener("input", () => {
    const pos = nameInput.selectionStart;
    const cleaned = nameInput.value.replace(/\s{2,}/g, " ");
    if (cleaned !== nameInput.value) {
      nameInput.value = cleaned;
      if (typeof pos === "number") nameInput.setSelectionRange(pos, pos);
    }
  });

  // Контакт: авто-режим phone/tg
  contactInput.addEventListener("input", () => {
    const mode = detectContactMode(contactInput.value);
    if (!mode) return;

    if (mode === "phone") {
      contactInput.value = formatUA(contactInput.value);
      return;
    }

    if (mode === "tg") {
      contactInput.value = formatTG(contactInput.value);
    }
  });

  // submit: валидация + toast
  form.addEventListener("submit", (e) => {
    const name = nameInput.value;
    const contact = contactInput.value.trim();
    const consent = form.elements.consent?.checked;

    if (!isValidName(name)) {
      e.preventDefault();
      toast.error(
        "Перевірте ім'я",
        "Мінімум 2 символи. Лише букви, пробіл, ' та ,"
      );
      nameInput.focus();
      return;
    }

    const mode = detectContactMode(contact);
    if (mode === "phone") {
      if (!isValidUA(contact)) {
        e.preventDefault();
        toast.error(
          "Перевірте телефон",
          "Формат: +380XXXXXXXXX (9 цифр після 380)"
        );
        contactInput.focus();
        return;
      }
    } else if (mode === "tg") {
      if (!isValidTG(contact)) {
        e.preventDefault();
        toast.error(
          "Перевірте Telegram",
          "Формат: @username (5–32 символи: букви/цифри/_)"
        );
        contactInput.focus();
        return;
      }
    } else {
      e.preventDefault();
      toast.error(
        "Перевірте контакт",
        "Вкажіть телефон (+380…) або Telegram (@username)"
      );
      contactInput.focus();
      return;
    }

    if (!consent) {
      e.preventDefault();
      toast.error(
        "Потрібна згода",
        "Підтвердіть згоду з політикою конфіденційності"
      );
      return;
    }
  });
};
