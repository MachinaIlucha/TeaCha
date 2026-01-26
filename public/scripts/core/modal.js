export const initModal = ({
  modalId,
  openSelector = "[data-open-modal]",
  closeSelector = "[data-close-modal]",
  openClass = "is-open",
  bodyOpenClass = "modal-open",
} = {}) => {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const close = () => {
    modal.classList.remove(openClass);
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove(bodyOpenClass);
  };

  const open = () => {
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
