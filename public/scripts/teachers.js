export function initTeacherTabs() {
  const tabs = document.querySelector(".teachers [data-teacher-tabs]")
  if (!tabs) return

  const buttons = tabs.querySelectorAll("[data-teacher]")
  const panels = document.querySelectorAll(".teachers [data-teacher-panel]")

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.teacher

      buttons.forEach(b => b.classList.toggle("is-active", b === btn))
      panels.forEach(p => (p.hidden = p.dataset.teacherPanel !== key))
    })
  })
}
