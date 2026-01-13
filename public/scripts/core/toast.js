/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

/**
 * Toast system (TeaCha)
 */

const escapeHtml = (str) =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const root = () => document.querySelector(".toasts");

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

export const toast = {
  success: (title, text) => show({ type: "success", title, text }),
  error: (title, text) => show({ type: "error", title, text }),
};
