export const initPriceTeachers = () => {
  const tabs = document.querySelector("[data-price-teacher-tabs]")
  const table = document.querySelector("[data-price-table]")
  if (!tabs || !table) return

  const buttons = [...tabs.querySelectorAll("[data-teacher]")]
  const cells = [...table.querySelectorAll("[data-cell]")]
  const olds = [...table.querySelectorAll("[data-old]")]

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
        "group.month": "3200 грн"
      }
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
        "group.month": "3200 грн"
      }
    }
  }

  const setTeacher = key => {
    const idx = Math.max(0, buttons.findIndex(b => b.dataset.teacher === key))

    buttons.forEach((b, i) => {
      const active = i === idx
      b.classList.toggle("is-active", active)
      b.setAttribute("aria-selected", active ? "true" : "false")
    })

    const data = prices[key] ?? prices.daryna

    cells.forEach(el => {
      const k = el.dataset.cell
      el.textContent = data[k] ?? "—"
    })

    olds.forEach(el => {
      const k = el.dataset.old
      const old = data.old?.[k]
      el.innerHTML = old ? `<s>${old}</s>` : ""
    })
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => setTeacher(btn.dataset.teacher))
  })

  const initial =
    buttons.find(b => b.classList.contains("is-active"))?.dataset.teacher ??
    buttons[0]?.dataset.teacher

  if (initial) setTeacher(initial)
}
