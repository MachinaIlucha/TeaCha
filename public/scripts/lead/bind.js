import { postLead } from "./api.js";
import { toast } from "../core/toast.js";
import { getClientText } from "../core/site-text.js";

const text = getClientText();

export const bindLeadForm = (selector, opts = {}) => {
  const form = document.querySelector(selector);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Let native validity + customValidity messages handle required fields
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = form.elements.name?.value?.trim() || "";
    const contact = form.elements.contact?.value?.trim() || "";

    const btn = form.querySelector('button[type="submit"]');
    const prevText = btn?.textContent;

    if (btn) {
      btn.disabled = true;
      btn.textContent = text.lead.bind.sendingButton;
    }

    try {
      const result = await postLead({ name, contact, source: opts.source });
      if (result.ok) {
        form.reset();
        opts.onSuccess?.();
      }
    } catch (err) {
      console.error("Lead submit error", err);
      toast.error(text.lead.bind.errorTitle, text.lead.bind.errorText);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prevText || text.lead.bind.fallbackSubmitButton;
      }
    }
  });
};
