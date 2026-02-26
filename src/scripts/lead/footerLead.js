/**
 * TeaCha website
 * © 2026. All rights reserved.
 */

import { attachLeadValidation } from "./validation.js";
import { bindLeadForm } from "./bind.js";

/**
 * ✅ Init for Footer Lead form
 * - safe for Astro re-navigation (guards against double init)
 */
export const initFooterLead = () => {
  const form = document.querySelector("#footer-lead-form");
  if (!form) return;

  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  attachLeadValidation(form);
  bindLeadForm("#footer-lead-form", { source: "footer-lead" });
};
