export const initPriceTeachers = () => {
  const table = document.querySelector("[data-price-table]");
  if (!table) return;

  const tabs = document.querySelector("[data-price-teacher-tabs]");

  const cells = [...table.querySelectorAll("[data-cell]")];
  const olds = [...table.querySelectorAll("[data-old]")];

  const prices = {
    daryna: {
      "individual.one": "700 грн",
      "individual.month": "5040 грн",
      "pair.one": "500 грн",
      "pair.month": "3600 грн",
      "group.one": "400 грн",
      "group.month": "2800 грн",
      "trial.one": "200 грн",
      old: {
        "individual.month": "5600 грн",
        "pair.month": "4000 грн",
        "group.month": "3200 грн",
      },
    },
    daria: {
      "individual.one": "700 грн",
      "individual.month": "5040 грн",
      "pair.one": "500 грн",
      "pair.month": "3600 грн",
      "group.one": "400 грн",
      "group.month": "2800 грн",
      "trial.one": "200 грн",
      old: {
        "individual.month": "5600 грн",
        "pair.month": "4000 грн",
        "group.month": "3200 грн",
      },
    },
  };

  const setTeacher = (key) => {
    const data = prices[key] ?? prices.daryna;

    cells.forEach((el) => {
      const k = el.dataset.cell;
      el.textContent = data[k] ?? "—";
    });

    olds.forEach((el) => {
      const k = el.dataset.old;
      const old = data.old?.[k];
      el.innerHTML = old ? `<s>${old}</s>` : "";
    });
  };

  // если tabs есть — подключаем клики и aria
  if (tabs) {
    const buttons = [...tabs.querySelectorAll("[data-teacher]")];
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.teacher;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        setTeacher(key);
      });
    });

    const initial =
      buttons.find((b) => b.classList.contains("is-active"))?.dataset.teacher ??
      buttons[0]?.dataset.teacher ??
      "daryna";

    setTeacher(initial);
    return;
  }

  // tabs нет — просто ставим дефолт и всё
  setTeacher("daryna");
};
