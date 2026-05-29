import { escapeHtml } from "./escape.js";
import { getClientText } from "./site-text.js";

const root = () => document.querySelector(".toasts");
const clientText = getClientText();

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/* Swipe tuning (Emil: momentum beats a fixed threshold) */
const SWIPE_THRESHOLD = 40; // px upward before a slow drag counts as dismiss
const VELOCITY_THRESHOLD = 0.11; // px/ms — a quick flick dismisses regardless of distance
const EXIT_FALLBACK_MS = 460; // safety net if transitionend never fires

/* Pausable timer so toasts don't vanish while the tab is hidden / hovered / dragged */
const timers = new Set();

const createTimer = (ms, fn) => {
  let remaining = ms;
  let startedAt = performance.now();
  let id = null;

  const run = () => {
    startedAt = performance.now();
    id = window.setTimeout(fn, remaining);
  };
  const pause = () => {
    if (id == null) return;
    window.clearTimeout(id);
    id = null;
    remaining -= performance.now() - startedAt;
  };
  const resume = () => {
    if (id == null && remaining > 0) run();
  };
  const clear = () => {
    if (id != null) window.clearTimeout(id);
    id = null;
    timers.delete(api);
  };

  const api = { pause, resume, clear };
  timers.add(api);
  run();
  return api;
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const hidden = document.hidden;
    timers.forEach((t) => (hidden ? t.pause() : t.resume()));
  });
}

const show = ({ type = "success", title, text, timeout = 3500 }) => {
  const host = root();
  if (!host) return;

  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.dataset.mounted = "false";
  el.innerHTML = `
    <span class="toast__dot" aria-hidden="true"></span>
    <div>
      <p class="toast__title">${escapeHtml(title)}</p>
      ${text ? `<p class="toast__text">${escapeHtml(text)}</p>` : ""}
    </div>
    <button class="toast__close" type="button" aria-label="${escapeHtml(clientText.toast.closeAria)}">✕</button>
  `;

  host.appendChild(el);

  // Enter: flush initial (hidden) styles, then flip to mounted so the CSS transition runs.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.dataset.mounted = "true";
    });
  });

  let removed = false;
  const timer = createTimer(timeout, () => dismiss());

  const finalize = () => {
    el.remove();
  };

  /* Programmatic / swipe dismissal — interruptible because it rides CSS transitions */
  const dismiss = (viaSwipe = false) => {
    if (removed) return;
    removed = true;
    timer.clear();

    if (!viaSwipe) {
      // gentle upward fade for timeout / close-button dismissals
      el.dataset.removed = "true";
    }
    // (for swipe, the inline transform set on release drives the exit)

    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      el.removeEventListener("transitionend", onEnd);
      finalize();
    };
    const onEnd = (ev) => {
      if (ev.target === el && (ev.propertyName === "transform" || ev.propertyName === "opacity")) end();
    };
    el.addEventListener("transitionend", onEnd);
    window.setTimeout(end, EXIT_FALLBACK_MS);
  };

  el.querySelector(".toast__close")?.addEventListener("click", () => dismiss());

  // Pause auto-dismiss while the pointer rests on the toast.
  el.addEventListener("pointerenter", () => timer.pause());
  el.addEventListener("pointerleave", () => {
    if (!dragging) timer.resume();
  });

  /* ----- Swipe-to-dismiss (upward, matching the enter direction) ----- */
  let dragging = false;
  let pointerId = null;
  let startY = 0;
  let startT = 0;
  let dy = 0;

  el.addEventListener("pointerdown", (e) => {
    if (removed) return;
    if (dragging) return; // multi-touch protection: ignore extra fingers
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest(".toast__close")) return; // let the button handle its own click

    dragging = true;
    pointerId = e.pointerId;
    startY = e.clientY;
    startT = performance.now();
    dy = 0;

    el.setPointerCapture?.(e.pointerId);
    el.style.transition = "none"; // track the finger 1:1
    el.dataset.dragging = "true";
    timer.pause();
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    let delta = e.clientY - startY;
    if (delta > 0) delta *= 0.2; // friction in the dead direction (nowhere to go below)
    dy = delta;
    el.style.transform = `translateY(${dy}px)`;
    el.style.opacity = String(Math.max(0, 1 - Math.abs(Math.min(0, dy)) / 110));
  });

  const endDrag = (e) => {
    if (!dragging || (e && e.pointerId !== pointerId)) return;
    dragging = false;
    el.dataset.dragging = "false";
    el.releasePointerCapture?.(pointerId);

    const elapsed = Math.max(1, performance.now() - startT);
    const velocity = Math.abs(dy) / elapsed;
    el.style.transition = ""; // hand motion back to CSS

    const flung = dy < 0 && (Math.abs(dy) >= SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD);
    if (flung) {
      el.style.transform = "translateY(-120%)"; // throw it off the top edge
      el.style.opacity = "0";
      dismiss(true);
    } else {
      // snap back
      el.style.transform = "";
      el.style.opacity = "";
      timer.resume();
    }
  };

  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
};

export const toast = {
  success: (title, text) => show({ type: "success", title, text }),
  error: (title, text) => show({ type: "error", title, text }),
};
