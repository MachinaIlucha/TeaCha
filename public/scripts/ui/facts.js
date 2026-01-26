/**
 * Reveals "facts" section on scroll.
 * - Uses IntersectionObserver for performance.
 * - Respects prefers-reduced-motion.
 */
function initFactsReveal() {
  const sections = document.querySelectorAll("[data-facts]");
  if (!sections.length) return;

  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;
  if (reduceMotion) {
    sections.forEach((s) => s.classList.add("is-visible"));
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
    { threshold: 0.25 },
  );

  sections.forEach((s) => io.observe(s));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFactsReveal, {
    once: true,
  });
} else {
  initFactsReveal();
}
