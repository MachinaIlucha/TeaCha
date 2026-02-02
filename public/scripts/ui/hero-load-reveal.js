/**
 * Hero load reveal (smooth, on page load)
 * Works with: <section class="hero" data-reveal="load"> ... data-reveal-item="..."
 */

export function initHeroLoadReveal() {
  // allow disabling reveal globally
  if (document.body?.hasAttribute("data-reveal-off")) return;

  const heroes = document.querySelectorAll('.hero[data-reveal="load"]');
  if (!heroes.length) return;

  // idempotency per hero
  heroes.forEach((hero) => {
    if (hero.dataset.heroRevealInit === "1") return;
    hero.dataset.heroRevealInit = "1";
  });

  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  if (reduceMotion) {
    heroes.forEach((hero) => hero.classList.add("is-visible"));
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroes.forEach((hero) => hero.classList.add("is-visible"));
      }, 120);
    });
  });
}
