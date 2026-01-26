const qs = (sel, root = document) => root.querySelector(sel);

export function initEnglishPage() {
  const shots = qs("[data-en-shots] .enShots__track");
  if (!shots) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onDown = (e) => {
    isDown = true;
    shots.classList.add("is-dragging");
    startX = (e.pageX || e.touches?.[0]?.pageX || 0);
    scrollLeft = shots.scrollLeft;
  };

  const onMove = (e) => {
    if (!isDown) return;
    const x = (e.pageX || e.touches?.[0]?.pageX || 0);
    const walk = (startX - x);
    shots.scrollLeft = scrollLeft + walk;
  };

  const onUp = () => {
    isDown = false;
    shots.classList.remove("is-dragging");
  };

  shots.addEventListener("mousedown", onDown);
  shots.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  shots.addEventListener("touchstart", onDown, { passive: true });
  shots.addEventListener("touchmove", onMove, { passive: true });
  shots.addEventListener("touchend", onUp);
}
