import { qs } from "../core/dom.js";
import { escapeHtml } from "../core/escape.js";
import { prefersReducedMotion } from "../core/motion.js";

async function predecode(src) {
  if (!src) return;
  try {
    const im = new Image();
    im.src = src;
    if (im.decode) {
      await im.decode();
    } else {
      await new Promise((res) => {
        im.onload = res;
        im.onerror = res;
      });
    }
  } catch {
    // ignore
  }
}

export function initReviews() {
  const root = qs("[data-r2]");
  if (!root) return;

  if (root.dataset.r2Init === "1") return;
  root.dataset.r2Init = "1";

  const jsonEl = qs("[data-r2-json]", root);
  if (!jsonEl) {
    console.warn("[reviews] missing [data-r2-json]");
    return;
  }

  let reviews = [];
  try {
    reviews = JSON.parse((jsonEl.textContent || "[]").trim());
  } catch (e) {
    console.warn("[reviews] JSON parse failed", e);
    return;
  }

  if (!Array.isArray(reviews) || reviews.length < 2) {
    console.warn("[reviews] not enough items");
    return;
  }

  const prevBtn = qs("[data-r2-prev]", root);
  const nextBtn = qs("[data-r2-next]", root);
  const card = qs(".r2Card", root);
  const info = qs(".r2Info", root);

  let frontImg = qs("[data-r2-front-img]", root);
  let backImg = qs("[data-r2-back-img]", root);

  let frontLayer = qs("[data-r2-front]", root);
  let backLayer = qs("[data-r2-back]", root);

  if (
    !prevBtn ||
    !nextBtn ||
    !card ||
    !info ||
    !frontImg ||
    !backImg ||
    !frontLayer ||
    !backLayer
  ) {
    console.warn("[reviews] missing required DOM nodes");
    return;
  }

  frontImg.decoding = "async";
  backImg.decoding = "async";

  // warm cache
  reviews.forEach((r) => {
    if (!r?.img) return;
    const im = new Image();
    im.src = r.img;
  });

  let i = 0;
  let locked = false;
  let fallbackT = 0;

  const buildHTML = (data) => `
    <div class="r2Top">
      <h3 class="r2Name">${escapeHtml(data.name)}</h3>
      <span class="r2Badge">${escapeHtml(data.badge)}</span>
    </div>

    <div class="r2Body">
      <p class="r2Row"><strong>Запит:</strong> <span>${escapeHtml(
        data.request,
      )}</span></p>

      <p class="r2Row">
        <strong>${escapeHtml((data.pointA?.label ?? "Точка А") + ":")}</strong>
        <span class="r2Meta">${escapeHtml(
          `${data.pointA?.date ?? ""} • ${data.pointA?.level ?? ""}`.trim(),
        )}</span>
        <span>${escapeHtml(data.pointA?.text ?? "")}</span>
      </p>

      <p class="r2Row">
        <strong>${escapeHtml((data.pointB?.label ?? "Точка Б") + ":")}</strong>
        <span class="r2Meta">${escapeHtml(
          `${data.pointB?.date ?? ""} • ${data.pointB?.level ?? ""}`.trim(),
        )}</span>
        <span>${escapeHtml(data.pointB?.text ?? "")}</span>
      </p>
    </div>

    <div class="r2Quote">
      <div class="r2Quote__mark" aria-hidden="true">“</div>
      <p class="r2Quote__text">${escapeHtml(data.quote)}</p>
    </div>
  `;

  const fillTextLayer = (layerEl, data) => {
    layerEl.innerHTML = buildHTML(data);
  };

  const setImage = (imgEl, data) => {
    imgEl.src = data.img;
    imgEl.alt = `Фото: ${data.name}`;
  };

  // Mobile height stabilization (matches CSS: desktop starts at 64rem)
  const mqDesktop = window.matchMedia?.("(min-width: 64rem)");

  function syncMobileInfoMinHeight() {
    if (!mqDesktop || mqDesktop.matches) {
      root.style.removeProperty("--r2-info-minh");
      return;
    }

    const infoW = info.getBoundingClientRect().width;
    if (!infoW) return;

    const meas = document.createElement("div");
    meas.className = "r2Info";
    meas.style.position = "absolute";
    meas.style.left = "-9999px";
    meas.style.top = "0";
    meas.style.visibility = "hidden";
    meas.style.pointerEvents = "none";
    meas.style.width = `${Math.ceil(infoW)}px`;

    const stack = document.createElement("div");
    stack.className = "r2TextStack";
    stack.style.display = "grid";

    const layer = document.createElement("div");
    layer.className = "r2Layer is-front";
    stack.appendChild(layer);

    meas.appendChild(stack);
    document.body.appendChild(meas);

    let maxH = 0;
    for (const r of reviews) {
      layer.innerHTML = buildHTML(r);
      const h = Math.ceil(meas.getBoundingClientRect().height);
      if (h > maxH) maxH = h;
    }

    document.body.removeChild(meas);

    if (maxH > 0) {
      root.style.setProperty("--r2-info-minh", `${maxH}px`);
    }
  }

  const rafSync = () =>
    requestAnimationFrame(() => requestAnimationFrame(syncMobileInfoMinHeight));

  rafSync();

  if (document.fonts?.ready) {
    document.fonts.ready.then(rafSync).catch(() => {});
  }

  window.addEventListener("load", rafSync, { once: true });
  window.addEventListener("resize", rafSync);
  window.addEventListener("orientationchange", rafSync);

  const commitSwap = () => {
    card.classList.remove("is-transitioning", "is-prev");

    frontImg.classList.remove("is-front");
    frontImg.classList.add("is-back");
    backImg.classList.remove("is-back");
    backImg.classList.add("is-front");

    frontLayer.classList.remove("is-front");
    frontLayer.classList.add("is-back");
    backLayer.classList.remove("is-back");
    backLayer.classList.add("is-front");

    [frontImg, backImg] = [backImg, frontImg];
    [frontLayer, backLayer] = [backLayer, frontLayer];

    // predecode next (no blocking)
    const warmNext = reviews[(i + 1) % reviews.length];
    predecode(warmNext?.img);

    locked = false;
  };

  const go = (dir) => {
    if (locked) return Promise.resolve(false);
    locked = true;

    window.clearTimeout(fallbackT);

    const nextIndex = (i + dir + reviews.length) % reviews.length;
    const nextData = reviews[nextIndex];

    // do NOT block animation start
    predecode(nextData.img);

    setImage(backImg, nextData);
    fillTextLayer(backLayer, nextData);

    card.classList.toggle("is-prev", dir === -1);

    requestAnimationFrame(() => {
      card.classList.add("is-transitioning");
    });

    return new Promise((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;

        window.clearTimeout(fallbackT);
        backLayer.removeEventListener("transitionend", onEnd);

        i = nextIndex;
        commitSwap();
        resolve(true);
      };

      const onEnd = (e) => {
        if (e.target !== backLayer) return;
        if (e.propertyName !== "opacity") return;
        finish();
      };

      backLayer.addEventListener("transitionend", onEnd);

      // must be >= css opacity transition
      fallbackT = window.setTimeout(finish, 1700);
    });
  };

  // init BACK = next slide
  const next0 = reviews[(i + 1) % reviews.length];
  setImage(backImg, next0);
  fillTextLayer(backLayer, next0);
  predecode(next0?.img);

  // ---- AUTOPLAY (stable) ----
  const reduceMotion = prefersReducedMotion();

  const AUTOPLAY_MS = 5000;

  let t = 0;
  let paused = false;
  let inView = false;

  function stopAutoplay() {
    if (t) window.clearTimeout(t);
    t = 0;
  }

  function canPlay() {
    if (reduceMotion) return false;
    if (!inView) return false;
    if (paused) return false;
    if (document.visibilityState !== "visible") return false;
    return true;
  }

  function schedule(delay = AUTOPLAY_MS) {
    stopAutoplay();
    t = window.setTimeout(tick, delay);
  }

  async function tick() {
    if (!canPlay()) {
      schedule(200);
      return;
    }
    if (locked) {
      schedule(120);
      return;
    }

    try {
      await go(1);
    } finally {
      schedule(AUTOPLAY_MS);
    }
  }

  function startAutoplay() {
    if (reduceMotion) return;
    if (t) return;
    schedule(AUTOPLAY_MS);
  }

  function resetAutoplay() {
    if (reduceMotion) return;
    if (!inView) return;
    schedule(AUTOPLAY_MS);
  }

  // ---- BUTTONS / KEYS ----
  const onPrev = (e) => {
    e.preventDefault();
    go(-1).then(resetAutoplay);
  };

  const onNext = (e) => {
    e.preventDefault();
    go(1).then(resetAutoplay);
  };

  const onKey = (e) => {
    if (e.key === "ArrowLeft") go(-1).then(resetAutoplay);
    if (e.key === "ArrowRight") go(1).then(resetAutoplay);
  };

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);
  root.addEventListener("keydown", onKey);

  // pause on hover/focus
  const onPause = () => {
    paused = true;
  };

  const onResume = () => {
    paused = false;
    resetAutoplay();
  };

  root.addEventListener("pointerenter", onPause);
  root.addEventListener("pointerleave", onResume);
  root.addEventListener("focusin", onPause);
  root.addEventListener("focusout", onResume);

  // IO: only start/stop
  const io = new IntersectionObserver(
    (entries) => {
      const visible = !!entries[0]?.isIntersecting;
      if (visible === inView) return;

      inView = visible;

      if (inView) startAutoplay();
      else stopAutoplay();
    },
    { threshold: 0.2 },
  );
  io.observe(root);

  const cleanup = () => {
    stopAutoplay();
    io.disconnect();

    window.removeEventListener("resize", rafSync);
    window.removeEventListener("orientationchange", rafSync);

    prevBtn.removeEventListener("click", onPrev);
    nextBtn.removeEventListener("click", onNext);
    root.removeEventListener("keydown", onKey);

    root.removeEventListener("pointerenter", onPause);
    root.removeEventListener("pointerleave", onResume);
    root.removeEventListener("focusin", onPause);
    root.removeEventListener("focusout", onResume);
  };

  window.addEventListener("astro:before-swap", cleanup, { once: true });
}
