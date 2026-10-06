import { attachLeadValidation } from "./lead/validation.js";
import { bindLeadForm } from "./lead/bind.js";
import { initLevelTest } from "./features/levelTest.js";
import { tuition, packs } from "../data/school";
import {
  initSchoolMotion,
  animatePrice,
  positionGlider,
} from "./school-motion.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

initSchoolMotion();

const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("#school-nav");
const closeMenu = () => {
  nav?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Відкрити меню");
};
menuButton?.addEventListener("click", () => {
  const opened = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(opened));
  menuButton.setAttribute(
    "aria-label",
    opened ? "Закрити меню" : "Відкрити меню",
  );
});
nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".tc-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia("(min-width: 1101px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

// Native dialog provides focus trapping, Escape, background inertness and focus restoration.
const dialog = document.querySelector("#consultModal");
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-modal]")) {
    event.preventDefault();
    closeMenu();
    dialog?.showModal();
    document.body.style.overflow = "hidden";
  }
  if (event.target.closest("[data-close-modal]")) dialog?.close();
});
dialog?.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    dialog.close();
});
dialog?.addEventListener("close", () => {
  document.body.style.overflow = "";
});
["consultForm", "start-lead-form"].forEach((id) => {
  const form = document.getElementById(id);
  if (!form) return;
  attachLeadValidation(form);
  bindLeadForm(`#${id}`, {
    source: id === "consultForm" ? "modal" : "start-lead",
    onSuccess: () => {
      if (id === "consultForm") dialog?.close();
    },
  });
});

document.querySelectorAll("[data-back-to-top]").forEach((button) =>
  button.addEventListener("click", () =>
    window.scrollTo({
      top: 0,
      behavior: reduced.matches ? "instant" : "smooth",
    }),
  ),
);

document.querySelectorAll("[data-service]").forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-service]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    positionGlider(button.closest("[data-glide]"), button);
    document.querySelectorAll("[data-service-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.servicePanel !== button.dataset.service;
    });
  }),
);

const reviews = [...document.querySelectorAll("[data-review]")];
let reviewIndex = 0;
const showReview = (direction, selected) => {
  if (!reviews.length) return;
  reviewIndex =
    selected ?? (reviewIndex + direction + reviews.length) % reviews.length;
  document
    .querySelector(".tc-review-stage")
    ?.style.setProperty("--review-direction", String(direction));
  document
    .querySelectorAll("[data-review-select]")
    .forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === reviewIndex)),
    );
  reviews.forEach((item, i) => {
    item.hidden = i !== reviewIndex;
  });
  const counter = document.querySelector("[data-review-count]");
  if (counter)
    counter.textContent = `${String(reviewIndex + 1).padStart(2, "0")} / ${String(reviews.length).padStart(2, "0")}`;
};
document.querySelectorAll("[data-review-select]").forEach((button) =>
  button.addEventListener("click", () => {
    const selected = Number(button.dataset.reviewSelect);
    showReview(selected > reviewIndex ? 1 : -1, selected);
  }),
);
document
  .querySelector("[data-review-prev]")
  ?.addEventListener("click", () => showReview(-1));
document
  .querySelector("[data-review-next]")
  ?.addEventListener("click", () => showReview(1));

document.querySelectorAll("[data-pack]").forEach((button) =>
  button.addEventListener("click", () => {
    const count = Number(button.dataset.pack);
    const index = packs.indexOf(count);
    positionGlider(button.closest("[data-glide]"), button);
    document.querySelectorAll("[data-pack]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-tuition]").forEach((item) => {
      animatePrice(item, tuition[item.dataset.tuition].prices[index]);
    });
    document.querySelectorAll("[data-tuition-total]").forEach((item) => {
      const total = tuition[item.dataset.tuitionTotal].prices[index] * count;
      item.textContent = count === 1 ? "1 урок" : `${count} уроків`;
    });
  }),
);

const search = document.querySelector("[data-blog-search]");
let category = "all";
const filterArticles = () => {
  const query = (search?.value || "").toLocaleLowerCase("uk").trim();
  let count = 0;
  document.querySelectorAll("[data-article-title]").forEach((card) => {
    const visible =
      (!query || card.dataset.articleTitle.includes(query)) &&
      (category === "all" || card.dataset.articleCategory === category);
    card.hidden = !visible;
    if (visible) {
      count++;
      card.classList.add("is-visible");
    }
  });
  const empty = document.querySelector("[data-blog-empty]");
  if (empty) empty.hidden = count > 0;
  const counter = document.querySelector("[data-blog-count]");
  if (counter) counter.textContent = `Матеріалів: ${count}`;
};
search?.addEventListener("input", filterArticles);
document.querySelectorAll("[data-category]").forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterArticles();
  }),
);
initLevelTest();
