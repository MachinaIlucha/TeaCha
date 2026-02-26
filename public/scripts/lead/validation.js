import { toast } from "../core/toast.js";
import { getClientText } from "../core/site-text.js";

const text = getClientText();

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
 * UA phone normalization:
 * - final target: +380XXXXXXXXX (12 digits total incl 380)
 * - if user types anything not starting with 0/38/380, treat it as digits AFTER 380
 * - supports deletion: if user deletes back to 3/38/380, allow clearing the field
 */
const formatUA = (raw, { isDeleting }) => {
  let digits = onlyDigits(raw);
  if (!digits) return "";

  if (isDeleting && (digits === "3" || digits === "38" || digits === "380"))
    return "";

  // common UA entry: 0XXXXXXXXX -> 380XXXXXXXXX
  if (digits.startsWith("0")) digits = "38" + digits;

  // handles pasted: 80XXXXXXXXX (rare) -> 380...
  if (digits.startsWith("80")) digits = "3" + digits;

  // 38XXXXXXXXXX -> 380XXXXXXXXX
  if (digits.startsWith("38") && !digits.startsWith("380")) {
    digits = "380" + digits.slice(2);
  }

  // 3XXXXXXXXXXX -> 380XXXXXXXXX
  if (digits.startsWith("3") && !digits.startsWith("38")) {
    digits = "380" + digits.slice(1);
  }

  // any other prefix -> treat as digits after 380
  if (!digits.startsWith("380")) {
    digits = "380" + digits;
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
 * - keeps @prefix
 * - strips spaces and invalid chars
 * - supports deletion: "@" alone can be cleared
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
 * Custom UA messages for required fields via reportValidity()
 */
const attachUaNativeMessages = ({ nameInput, contactInput, consentInput }) => {
  nameInput?.addEventListener("invalid", () => {
    nameInput.setCustomValidity(text.lead.validation.requiredName);
  });
  nameInput?.addEventListener("input", () => {
    nameInput.setCustomValidity("");
  });

  contactInput?.addEventListener("invalid", () => {
    contactInput.setCustomValidity(text.lead.validation.requiredContact);
  });
  contactInput?.addEventListener("input", () => {
    contactInput.setCustomValidity("");
  });

  if (consentInput) {
    consentInput.addEventListener("invalid", () => {
      consentInput.setCustomValidity(text.lead.validation.requiredConsent);
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

  attachUaNativeMessages({ nameInput, contactInput, consentInput });

  nameInput.addEventListener("input", () => {
    const pos = nameInput.selectionStart;
    const cleaned = nameInput.value.replace(/\s{2,}/g, " ");
    if (cleaned !== nameInput.value) {
      nameInput.value = cleaned;
      if (typeof pos === "number") nameInput.setSelectionRange(pos, pos);
    }
  });

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

    if (mode === "phone") contactInput.value = formatUA(next, { isDeleting });
    if (mode === "tg") contactInput.value = sanitizeTG(next, { isDeleting });

    contactInput.dataset.prev = contactInput.value;
  });

  form.addEventListener("submit", (e) => {
    const name = nameInput.value;
    const contact = contactInput.value.trim();

    // Required fields should be handled by reportValidity() in bindLeadForm
    if (nameInput.validity.valueMissing || contactInput.validity.valueMissing)
      return;
    if (consentInput && !consentInput.checked) return;

    if (!isValidName(name)) {
      e.preventDefault();
      nameInput.setCustomValidity(text.lead.validation.invalidName);
      form.reportValidity();
      nameInput.setCustomValidity("");
      toast.error(
        text.lead.validation.invalidNameToastTitle,
        text.lead.validation.invalidNameToastText,
      );
      nameInput.focus();
      return;
    }

    const mode = detectContactMode(contact);

    if (mode === "phone") {
      if (!isValidUA(contact)) {
        e.preventDefault();
        contactInput.setCustomValidity(text.lead.validation.invalidPhone);
        form.reportValidity();
        contactInput.setCustomValidity("");
        toast.error(
          text.lead.validation.invalidPhoneToastTitle,
          text.lead.validation.invalidPhoneToastText,
        );
        contactInput.focus();
        return;
      }
    } else if (mode === "tg") {
      if (!isValidTG(contact)) {
        e.preventDefault();
        contactInput.setCustomValidity(text.lead.validation.invalidTelegram);
        form.reportValidity();
        contactInput.setCustomValidity("");
        toast.error(
          text.lead.validation.invalidTelegramToastTitle,
          text.lead.validation.invalidTelegramToastText,
        );
        contactInput.focus();
        return;
      }
    } else {
      e.preventDefault();
      contactInput.setCustomValidity(text.lead.validation.invalidContact);
      form.reportValidity();
      contactInput.setCustomValidity("");
      toast.error(
        text.lead.validation.invalidContactToastTitle,
        text.lead.validation.invalidContactToastText,
      );
      contactInput.focus();
    }
  });
};
