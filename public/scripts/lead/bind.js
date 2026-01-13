import { postLead } from "./api.js";
import { toast } from "../core/toast.js";

/**
 * Bind any form with name/contact fields to /api/lead
 * @param {string} selector
 * @param {{ source?: string, onSuccess?: () => void }} opts
 */
export const bindLeadForm = (selector, opts = {}) => {
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
