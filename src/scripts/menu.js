export function initMenu() {
  const burger = document.querySelector("[data-burger]");
  const panel = document.querySelector("[data-nav-panel]");

  if (!burger || !panel) return;

  const close = () => {
    panel.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    panel.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
  };

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  panel
    .querySelectorAll("a")
    .forEach((a) => a.addEventListener("click", close));

  document.addEventListener("click", (e) => {
    const t = e.target;
    const inside = panel.contains(t) || burger.contains(t);
    if (!inside) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
