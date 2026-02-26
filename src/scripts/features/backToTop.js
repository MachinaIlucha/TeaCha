const TOP_EPSILON_PX = 2;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

export const initBackToTop = () => {
  const button = document.querySelector("[data-back-to-top]");
  if (!(button instanceof HTMLButtonElement)) return;
  if (button.dataset.bound === "1") return;
  button.dataset.bound = "1";

  const syncVisibility = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    button.classList.toggle("is-visible", y > TOP_EPSILON_PX);
  };

  const onScroll = () => syncVisibility();
  const onClick = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  button.addEventListener("click", onClick);
  window.addEventListener("scroll", onScroll, { passive: true });
  syncVisibility();

  const onBeforeSwap = () => {
    button.removeEventListener("click", onClick);
    window.removeEventListener("scroll", onScroll);
    button.dataset.bound = "0";
    window.removeEventListener("astro:before-swap", onBeforeSwap);
  };

  window.addEventListener("astro:before-swap", onBeforeSwap);
};
