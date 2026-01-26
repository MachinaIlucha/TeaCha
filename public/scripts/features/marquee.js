export function initMarquee() {
  const root = document.querySelector("[data-marquee]");
  if (!root) return;

  // скорость (px/sec) — меняй как хочешь
  const SPEED = 80;

  const track = root.querySelector("[data-marquee-track]");
  if (!track) return;

  // ширина одного трека -> длительность
  const measure = () => {
    const w = track.getBoundingClientRect().width || 1;
    const duration = w / SPEED; // сек
    root.style.setProperty("--marquee-duration", `${duration}s`);
  };

  // старт
  measure();

  // после шрифтов/картинок/ресайза — пересчитать
  window.addEventListener("load", measure, { once: true });
  window.addEventListener("resize", measure);
}
