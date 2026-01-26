/**
 * Process reveal on scroll.
 */
function initProcessReveal() {
  const section = document.querySelector("[data-process]");
  if (!section) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) {
    section.classList.add("is-visible");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.25 }
  );

  io.observe(section);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProcessReveal, { once: true });
} else {
  initProcessReveal();
}