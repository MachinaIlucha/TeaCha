import { initMenu } from "./menu.js";
import { initReviews } from "./reviews.js";

initMenu();
initReviews();

const modal = document.getElementById("consultModal");
const openBtns = document.querySelectorAll("[data-open-modal]");
const closeBtns = document.querySelectorAll("[data-close-modal]");

openBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

closeBtns.forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// закрытие по Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
