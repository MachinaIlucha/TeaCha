import { prefersReducedMotion } from "../core/motion.js";

export const initFactsReveal = () => {
  const sections = [...document.querySelectorAll("[data-facts]")].filter(
    (section) => section.dataset.factsInit !== "1",
  );
  if (!sections.length) return;

  sections.forEach((section) => {
    section.dataset.factsInit = "1";
  });

  if (prefersReducedMotion()) {
    sections.forEach((section) => section.classList.add("is-visible"));
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

  sections.forEach((section) => io.observe(section));

  window.addEventListener(
    "astro:before-swap",
    () => {
      io.disconnect();
      sections.forEach((section) => {
        section.dataset.factsInit = "0";
      });
    },
    { once: true },
  );
};
