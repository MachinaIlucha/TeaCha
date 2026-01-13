/**
 * TeaCha website
 * Design & development: Ілля Пінчук Вадимович
 * © 2026. All rights reserved.
 */

import { qs, on } from "../core/dom.js"

export function initMenu() {
  const burger = qs("[data-burger]")
  const panel = qs("[data-nav-panel]")
  if (!burger || !panel) return

  const close = () => {
    panel.classList.remove("is-open")
    burger.setAttribute("aria-expanded", "false")
  }

  on(burger, "click", (e) => {
    e.stopPropagation()
    const isOpen = panel.classList.toggle("is-open")
    burger.setAttribute("aria-expanded", String(isOpen))
  })

  panel.querySelectorAll("a").forEach((a) => on(a, "click", close))

  on(document, "click", (e) => {
    const t = e.target
    const inside = panel.contains(t) || burger.contains(t)
    if (!inside) close()
  })

  on(window, "keydown", (e) => {
    if (e.key === "Escape") close()
  })
}
