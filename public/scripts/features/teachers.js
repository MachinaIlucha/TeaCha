/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { qs, qsa, on } from "../core/dom.js"

export function initTeacherTabs() {
  const tabs = qs(".teachers [data-teacher-tabs]")
  if (!tabs) return

  const buttons = qsa("[data-teacher]", tabs)
  const panels = qsa(".teachers [data-teacher-panel]")

  buttons.forEach((btn) => {
    on(btn, "click", () => {
      const key = btn.dataset.teacher
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn))
      panels.forEach((p) => (p.hidden = p.dataset.teacherPanel !== key))
    })
  })
}
