export function initMarquee() {
  const root = document.querySelector("[data-marquee]");
  if (!root) return;
  if (root.dataset.marqueeInit === "1") return;
  root.dataset.marqueeInit = "1";

  // speed (px/sec)
  const SPEED = 80;

  const track = root.querySelector("[data-marquee-track]");
  if (!track) return;

  // width of one track -> duration
  const measure = () => {
    const w = track.getBoundingClientRect().width || 1;
    const duration = w / SPEED; // sec
    root.style.setProperty("--marquee-duration", `${duration}s`);
  };

  measure();

  window.addEventListener("load", measure, { once: true });
  window.addEventListener("resize", measure);

  const cleanup = () => {
    window.removeEventListener("resize", measure);
    root.dataset.marqueeInit = "0";
  };

  window.addEventListener("astro:before-swap", cleanup, { once: true });
}
