/**
 * TeaCha website
 * © 2026. All rights reserved.
 */

import { attachLeadValidation } from "./validation.js";
import { bindLeadForm } from "./bind.js";

/**
 * ✅ Init for Start Lead block
 * - safe for Astro re-navigation (guards against double init)
 */
export const initStartLead = () => {
  const form = document.querySelector("#start-lead-form");
  if (!form) return;

  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  // validation (toasts + formatting)
  attachLeadValidation(form);

  // submit -> /api/lead
  bindLeadForm("#start-lead-form", { source: "start-lead" });
};
