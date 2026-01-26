const LOAD_SEL = '[data-reveal="load"], [data-reveal-load]';
const SCROLL_SEL = '[data-reveal="scroll"], [data-reveal-scroll]';

function reduced() {
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

function runLoad() {
  const targets = document.querySelectorAll(LOAD_SEL);
  if (!targets.length) return;

  if (reduced()) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  targets.forEach((el) => {
    el.classList.remove("is-visible");
    // reflow to restart transitions on reload/bfcache
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      targets.forEach((el) => el.classList.add("is-visible"));
    });
  });
}

function runScroll() {
  const targets = document.querySelectorAll(SCROLL_SEL);
  if (!targets.length) return;

  if (reduced()) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.25 },
  );

  targets.forEach((el) => {
    el.classList.remove("is-visible");
    io.observe(el);
  });
}

function initReveal() {
  runLoad();
  runScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReveal, { once: true });
} else {
  initReveal();
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted) initReveal();
});

document.addEventListener("astro:page-load", initReveal);
document.addEventListener("astro:after-swap", initReveal);
