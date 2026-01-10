export function initReviews() {
  const imgEl = document.getElementById("reviewImage");
  const textEl = document.getElementById("reviewText");
  const sigEl = document.getElementById("reviewSig");
  const prevBtn = document.getElementById("prevReview");
  const nextBtn = document.getElementById("nextReview");

  if (!imgEl || !textEl || !sigEl || !prevBtn || !nextBtn) return;

  const reviews = [
    {
      img: "/img/review-1.svg",
      text: "Все класно структуровано. Урок проходить на дошці, де є вправи, схеми та ігри. Під час уроку можна ставити питання і одразу отримувати виправлення.",
      sig: "— Анастасія",
    },
    {
      img: "/img/review-2.svg",
      text: "Нарешті зʼявилась система: короткі правила, багато розмовної практики та домашка без хаосу. Прогрес відчувся вже за кілька тижнів.",
      sig: "— Ірина",
    },
    {
      img: "/img/review-3.svg",
      text: "Подобається темп і формат. Виправлення мʼякі, але точні, а матеріали залишаються доступними — можна повернутися й повторити.",
      sig: "— Олег",
    },
  ];

  let current = 0;

  const render = (i) => {
    const r = reviews[i];
    imgEl.src = r.img;
    textEl.textContent = r.text;
    sigEl.textContent = r.sig;
  };

  prevBtn.addEventListener("click", () => {
    current = (current - 1 + reviews.length) % reviews.length;
    render(current);
  });

  nextBtn.addEventListener("click", () => {
    current = (current + 1) % reviews.length;
    render(current);
  });

  render(current);
}
