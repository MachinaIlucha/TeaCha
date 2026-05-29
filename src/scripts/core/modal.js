export const initModal = ({
  modalId,
  openSelector = "[data-open-modal]",
  closeSelector = "[data-close-modal]",
  openClass = "is-open",
  bodyOpenClass = "modal-open",
} = {}) => {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const closingClass = "is-closing";
  const EXIT_MS = 220; // keep in sync with modal exit animation duration
  let exitTimer = null;

  const close = () => {
    if (!modal.classList.contains(openClass)) return;
    modal.classList.remove(openClass);
    modal.classList.add(closingClass); // play the exit animation
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove(bodyOpenClass);

    window.clearTimeout(exitTimer);
    exitTimer = window.setTimeout(() => {
      modal.classList.remove(closingClass);
    }, EXIT_MS);
  };

  const open = () => {
    window.clearTimeout(exitTimer);
    modal.classList.remove(closingClass); // cancel any in-flight exit
    modal.classList.add(openClass);
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.classList.add(bodyOpenClass);
  };

  document.querySelectorAll(openSelector).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // ✅ не прыгать вверх
      e.stopPropagation();
      open();
    });
  });

  document.querySelectorAll(closeSelector).forEach((btn) => {
    btn.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return { open, close, modal };
};
