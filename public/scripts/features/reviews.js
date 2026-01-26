const qs = (sel, root = document) => root.querySelector(sel);

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
      <p class="r2Row"><strong>Запит:</strong> <span>${escapeHtml(data.request)}</span></p>

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

  // ✅ Стабилизация высоты на мобилке
  const mqMobile = window.matchMedia?.("(max-width: 979px)");

  function syncMobileInfoMinHeight() {
    if (!mqMobile?.matches) {
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
    stack.style.display = "block"; // измеряем “как в потоке”, без наложений

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

  // запуск сразу
  rafSync();

  // ✅ после загрузки шрифтов (иначе переносы меняются => прыжки)
  if (document.fonts?.ready) {
    document.fonts.ready.then(rafSync).catch(() => {});
  }

  // ✅ после полной загрузки страницы (картинки/стили)
  window.addEventListener("load", rafSync, { once: true });

  // ✅ ресайз/поворот
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

    locked = false;
  };

  const go = async (dir) => {
    if (locked) return;
    locked = true;
    window.clearTimeout(fallbackT);

    const nextIndex = (i + dir + reviews.length) % reviews.length;
    const nextData = reviews[nextIndex];

    await predecode(nextData.img);

    setImage(backImg, nextData);
    fillTextLayer(backLayer, nextData);

    card.classList.toggle("is-prev", dir === -1);

    requestAnimationFrame(() => {
      card.classList.add("is-transitioning");
    });

    const onEnd = (e) => {
      if (e.target !== backLayer) return;
      if (e.propertyName !== "opacity") return;
      backLayer.removeEventListener("transitionend", onEnd);

      i = nextIndex;
      commitSwap();
    };

    backLayer.addEventListener("transitionend", onEnd);

    fallbackT = window.setTimeout(() => {
      if (!locked) return;
      i = nextIndex;
      commitSwap();
    }, 1200);
  };

  // init BACK = next slide
  const next0 = reviews[(i + 1) % reviews.length];
  setImage(backImg, next0);
  fillTextLayer(backLayer, next0);

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    go(-1);
    resetAutoplay();
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    go(1);
    resetAutoplay();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      go(-1);
      resetAutoplay();
    }
    if (e.key === "ArrowRight") {
      go(1);
      resetAutoplay();
    }
  });

  // ---- AUTOPLAY ----
  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;
  const AUTOPLAY_MS = 7000;

  let t = 0;
  let paused = false;
  let inView = true;

  function stopAutoplay() {
    if (t) window.clearInterval(t);
    t = 0;
  }

  function startAutoplay() {
    if (reduceMotion) return;
    if (t) return;

    t = window.setInterval(() => {
      if (paused) return;
      if (!inView) return;
      if (document.visibilityState !== "visible") return;
      go(1);
    }, AUTOPLAY_MS);
  }

  const onPause = () => (paused = true);
  const onResume = () => (paused = false);

  root.addEventListener("pointerenter", onPause);
  root.addEventListener("pointerleave", onResume);
  root.addEventListener("focusin", onPause);
  root.addEventListener("focusout", onResume);

  const io = new IntersectionObserver(
    (entries) => {
      inView = !!entries[0]?.isIntersecting;
    },
    { threshold: 0.2 },
  );
  io.observe(root);

  startAutoplay();

  const cleanup = () => {
    stopAutoplay();
    io.disconnect();

    window.removeEventListener("resize", rafSync);
    window.removeEventListener("orientationchange", rafSync);

    root.removeEventListener("pointerenter", onPause);
    root.removeEventListener("pointerleave", onResume);
    root.removeEventListener("focusin", onPause);
    root.removeEventListener("focusout", onResume);
  };

  window.addEventListener("astro:before-swap", cleanup, { once: true });
}
