/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { qs, on } from "../core/dom.js";

export const initReviews = () => {
  const root = qs(".reviews");
  if (!root) return;

  // защита от двойной инициализации
  if (root.dataset.reviewsInit === "1") return;
  root.dataset.reviewsInit = "1";

  const jsonEl = qs("[data-reviews-json]", root);
  if (!jsonEl) return;

  let reviews = [];
  try {
    reviews = JSON.parse(jsonEl.textContent || "[]");
  } catch {
    reviews = [];
  }
  if (!Array.isArray(reviews) || reviews.length < 2) return;

  const prevBtn = qs("[data-reviews-prev]", root);
  const nextBtn = qs("[data-reviews-next]", root);

  const anim = qs("[data-desk-anim]", root);
  const isDesktop = () => window.matchMedia("(min-width: 980px)").matches;

  // если десктоп-узлов нет — просто выходим (мобайл и так статичный)
  if (!anim) return;

  let frontImg = qs("[data-front-img]", root);
  let backImg = qs("[data-back-img]", root);

  let frontP = qs("[data-front-p]", root);
  let backP = qs("[data-back-p]", root);

  let frontName = qs("[data-front-name]", root);
  let backName = qs("[data-back-name]", root);

  let frontTextLayer = qs("[data-front-text]", root);
  let backTextLayer = qs("[data-back-text]", root);

  if (
    !frontImg ||
    !backImg ||
    !frontP ||
    !backP ||
    !frontName ||
    !backName ||
    !frontTextLayer ||
    !backTextLayer
  )
    return;

  let i = 0;
  let locked = false;
  let fallbackT = 0;

  const setLayer = (imgEl, pEl, nameEl, data) => {
    imgEl.src = data.img;
    imgEl.alt = `Фото: ${data.name}`;
    pEl.textContent = data.text;
    nameEl.textContent = `— ${data.name}`;
  };

  // preload
  reviews.forEach((r) => {
    const im = new Image();
    im.src = r.img;
  });

  setLayer(frontImg, frontP, frontName, reviews[i]);
  setLayer(backImg, backP, backName, reviews[(i + 1) % reviews.length]);

  const commit = () => {
    anim.classList.remove("is-transitioning", "is-prev");

    frontImg.classList.remove("is-front");
    frontImg.classList.add("is-back");
    backImg.classList.remove("is-back");
    backImg.classList.add("is-front");

    frontTextLayer.classList.remove("is-front");
    frontTextLayer.classList.add("is-back");
    backTextLayer.classList.remove("is-back");
    backTextLayer.classList.add("is-front");
    [frontImg, backImg] = [backImg, frontImg];
    [frontP, backP] = [backP, frontP];
    [frontName, backName] = [backName, frontName];
    [frontTextLayer, backTextLayer] = [backTextLayer, frontTextLayer];

    locked = false;
  };

  const go = (dir) => {
    if (!isDesktop()) return;
    if (locked) return;
    locked = true;

    window.clearTimeout(fallbackT);

    const nextIndex = (i + dir + reviews.length) % reviews.length;
    const nextData = reviews[nextIndex];

    setLayer(backImg, backP, backName, nextData);

    anim.classList.toggle("is-prev", dir === -1);

    requestAnimationFrame(() => {
      anim.classList.add("is-transitioning");
    });

    const onEnd = () => {
      i = nextIndex;
      commit();
    };

    backTextLayer.addEventListener("transitionend", onEnd, { once: true });

    fallbackT = window.setTimeout(() => {
      if (!locked) return;
      i = nextIndex;
      commit();
    }, 1400);
  };

  on(prevBtn, "click", () => go(-1));
  on(nextBtn, "click", () => go(1));
};
