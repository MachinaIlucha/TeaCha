import { prefersReducedMotion } from "../core/motion.js";

export const initPrices = () => {
  const section = document.querySelector("[data-prices]");
  if (!section) return;

  const reduceMotion = prefersReducedMotion();

  const raw = {
    individual: {
      1: { total: 700 },
      8: { per: 645, total: 5160 },
      12: { per: 630, total: 7560 },
      24: { per: 600, total: 14400 },
    },
    pair: {
      1: { total: 500 },
      8: { per: 445, total: 3560 },
      12: { per: 430, total: 5160 },
      24: { per: 400, total: 9600 },
    },
    group: {
      1: { total: 400 },
      8: { per: 355, total: 2840 },
      12: { per: 330, total: 3960 },
      24: { per: 310, total: 7440 },
    },
    trial: {
      1: { total: 200 },
    },
  };

  const fmt = (v) => `${Number(v).toLocaleString("uk-UA")}<span class="priceCard__cur">₴</span>`;

  const nodes = [...section.querySelectorAll("[data-price]")];
  nodes.forEach((el) => {
    const key = el.dataset.price || "";
    const [group, pack, field] = key.split(".");
    const p = Number(pack);
    const val = raw?.[group]?.[p]?.[field];
    el.innerHTML = typeof val === "number" ? fmt(val) : "—";
  });

  const items = [
    ...section.querySelectorAll("[data-price-item]"),
    ...section.querySelectorAll(".priceCard"),
  ];

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 70, 520)}ms`;
  });

  const show = () => {
    section.classList.add("is-visible");
  };

  if (reduceMotion) {
    show();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show();
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -18% 0px" },
  );

  io.observe(section);
};
