export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export const on = (el, evt, handler, opts) => {
  if (!el) return;
  el.addEventListener(evt, handler, opts);
};
