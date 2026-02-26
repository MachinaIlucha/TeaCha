import { postLead } from "./api.js";
import { toast } from "../core/toast.js";
import { getClientText } from "../core/site-text.js";

const text = getClientText();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getLabelEl = (btn) =>
  btn?.querySelector(".leadSubmitFx__label, .leadDock__btnText") || null;

const setupSubmitFx = (btn) => {
  if (!btn || btn.dataset.submitFx === "1") return false;
  let label = getLabelEl(btn);

  if (!label) {
    const defaultLabel = (btn.textContent || "").trim();
    btn.textContent = "";

    label = document.createElement("span");
    label.className = "leadSubmitFx__label";
    label.textContent = defaultLabel;
    btn.append(label);
  }

  if (!btn.querySelector(".leadSubmitFx__check")) {
    const check = document.createElement("span");
    check.className = "leadSubmitFx__check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML =
      '<svg class="leadSubmitFx__icon leadSubmitFx__icon--ok" viewBox="0 0 50 50" role="presentation" focusable="false"><path d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg><svg class="leadSubmitFx__icon leadSubmitFx__icon--err" viewBox="0 0 50 50" role="presentation" focusable="false"><path d="M16 16l18 18"/><path d="M34 16L16 34"/></svg>';
    btn.append(check);
  }

  btn.classList.add("leadSubmitFx");
  btn.dataset.defaultLabel = (label.textContent || "").trim();
  btn.dataset.submitFx = "1";

  return true;
};

export const bindLeadForm = (selector, opts = {}) => {
  const form = document.querySelector(selector);
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const hasSubmitFx = setupSubmitFx(submitBtn);

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
    const labelEl = getLabelEl(btn);
    const prevText = btn?.dataset.defaultLabel || labelEl?.textContent || btn?.textContent || "";

    if (btn) {
      btn.disabled = true;
      btn.classList.add("is-loading");
      if (labelEl) {
        labelEl.textContent = text.lead.bind.sendingButton;
      } else {
        btn.textContent = text.lead.bind.sendingButton;
      }
    }

    try {
      const result = await postLead({ name, contact, source: opts.source });
      if (result.ok) {
        form.reset();

        if (btn && hasSubmitFx && labelEl) {
          labelEl.textContent = text.lead.api.successTitle;
          btn.classList.add("is-success");
          await wait(1100);
          btn.classList.remove("is-success");
        }

        opts.onSuccess?.();
      } else if (btn && hasSubmitFx && labelEl) {
        labelEl.textContent = text.lead.bind.errorTitle;
        btn.classList.add("is-error");
        await wait(1100);
        btn.classList.remove("is-error");
      }
    } catch (err) {
      console.error("Lead submit error", err);
      toast.error(text.lead.bind.errorTitle, text.lead.bind.errorText);
      if (btn && hasSubmitFx && labelEl) {
        labelEl.textContent = text.lead.bind.errorTitle;
        btn.classList.add("is-error");
        await wait(1100);
        btn.classList.remove("is-error");
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove("is-loading", "is-success");
        if (labelEl) {
          labelEl.textContent = prevText || text.lead.bind.fallbackSubmitButton;
        } else {
          btn.textContent = prevText || text.lead.bind.fallbackSubmitButton;
        }
      }
    }
  });
};
