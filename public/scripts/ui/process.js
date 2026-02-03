import { prefersReducedMotion } from "../core/motion.js";

export const initProcessReveal = () => {
  const section = document.querySelector("[data-process]");
  if (!section || section.dataset.processInit === "1") return;
  section.dataset.processInit = "1";

  if (prefersReducedMotion()) {
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
    {
      threshold: 0.45,
      rootMargin: "0px 0px -18% 0px",
    },
  );

  io.observe(section);

  window.addEventListener(
    "astro:before-swap",
    () => {
      io.disconnect();
      section.dataset.processInit = "0";
    },
    { once: true },
  );
};
