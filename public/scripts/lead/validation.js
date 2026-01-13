/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { toast } from "../core/toast.js";

const isLetter = (ch) => /[A-Za-zА-Яа-яІіЇїЄєҐґ]/.test(ch);

const normalizeName = (raw) => raw.trim().replace(/\s+/g, " ");

const isValidName = (value) => {
  const v = normalizeName(value);
  if (v.length < 2) return false;
  if (!/^[A-Za-zА-Яа-яІіЇїЄєҐґ\s',]+$/.test(v)) return false;
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
  return null;
};

const onlyDigits = (s) => s.replace(/\D/g, "");

/**
 * UA phone formatter:
 * - auto-normalizes into +380XXXXXXXXX as user types
 * - allows clean deletion: when deleting down to +3 / +38 / +380 => clears field
 */
const formatUA = (raw, { isDeleting }) => {
  let digits = onlyDigits(raw);

  if (!digits) return "";

  // when deleting, allow full clear instead of sticking to +380
  if (isDeleting && (digits === "3" || digits === "38" || digits === "380"))
    return "";

  // normalize typical UA inputs
  if (digits.startsWith("0")) digits = "38" + digits;
  if (digits.startsWith("80")) digits = "3" + digits;

  if (digits.startsWith("3") && !digits.startsWith("380")) {
    digits = "380" + digits.slice(1);
  }

  digits = digits.slice(0, 12);
  return `+${digits}`;
};

const isValidUA = (value) => {
  const digits = onlyDigits(value);
  return digits.length === 12 && digits.startsWith("380");
};

/**
 * Telegram sanitize:
 * - auto-adds @ when user starts typing telegram-like value
 * - removes spaces and invalid chars
 * - allows clean deletion: if only "@" left while deleting => clears field
 */
const sanitizeTG = (raw, { isDeleting }) => {
  let v = raw.replace(/\s+/g, "");

  if (!v) return "";

  if (isDeleting && v === "@") return "";

  if (v[0] !== "@") v = "@" + v;

  const cleaned = v
    .slice(1)
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 32);

  if (isDeleting && cleaned.length === 0) return "";

  return "@" + cleaned;
};

const isValidTG = (value) => /^@[A-Za-z0-9_]{5,32}$/.test(value);

/**
 * New feature:
 * Force UA native HTML5 "required" bubbles (instead of browser language)
 * via setCustomValidity on invalid/input/change events.
 */
const attachUaNativeMessages = ({ nameInput, contactInput, consentInput }) => {
  nameInput?.addEventListener("invalid", () => {
    nameInput.setCustomValidity("Будь ласка, заповніть імʼя");
  });
  nameInput?.addEventListener("input", () => {
    nameInput.setCustomValidity("");
  });

  contactInput?.addEventListener("invalid", () => {
    contactInput.setCustomValidity("Будь ласка, вкажіть телефон або Telegram");
  });
  contactInput?.addEventListener("input", () => {
    contactInput.setCustomValidity("");
  });

  if (consentInput) {
    consentInput.addEventListener("invalid", () => {
      consentInput.setCustomValidity(
        "Потрібно підтвердити згоду з політикою конфіденційності"
      );
    });
    consentInput.addEventListener("change", () => {
      consentInput.setCustomValidity("");
    });
  }
};

export const attachLeadValidation = (form) => {
  if (!form) return;

  const nameInput = form.elements.name;
  const contactInput = form.elements.contact;
  const consentInput = form.elements.consent;

  if (!nameInput || !contactInput) return;

  // ✅ New feature: UA native "required" bubbles
  attachUaNativeMessages({ nameInput, contactInput, consentInput });

  // Name: collapse multiple spaces
  nameInput.addEventListener("input", () => {
    const pos = nameInput.selectionStart;
    const cleaned = nameInput.value.replace(/\s{2,}/g, " ");
    if (cleaned !== nameInput.value) {
      nameInput.value = cleaned;
      if (typeof pos === "number") nameInput.setSelectionRange(pos, pos);
    }
  });

  // Contact: previous value to detect deletion
  contactInput.dataset.prev = contactInput.value || "";

  contactInput.addEventListener("input", (e) => {
    const prev = contactInput.dataset.prev || "";
    const next = contactInput.value;

    const inputType = e?.inputType || "";
    const isDeleting =
      inputType.startsWith("delete") || next.length < prev.length;

    const mode = detectContactMode(next);
    if (!mode) {
      contactInput.dataset.prev = next;
      return;
    }

    if (mode === "phone") {
      contactInput.value = formatUA(next, { isDeleting });
    }

    if (mode === "tg") {
      contactInput.value = sanitizeTG(next, { isDeleting });
    }

    // keep prev in sync after formatting
    contactInput.dataset.prev = contactInput.value;
  });

  // submit: validation + toasts
  form.addEventListener("submit", (e) => {
    const name = nameInput.value;
    const contact = contactInput.value.trim();
    const consent = consentInput?.checked;

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
    }
  });
};
