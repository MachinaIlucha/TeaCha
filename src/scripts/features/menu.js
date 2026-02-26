import { qs, on } from "../core/dom.js"

export function initMenu() {
  const burger = qs("[data-burger]")
  const panel = qs("[data-nav-panel]")
  if (!burger || !panel) return

  let scrollLockActive = false
  let lockedScrollY = 0

  const lockScroll = () => {
    if (scrollLockActive) return
    scrollLockActive = true

    lockedScrollY = window.scrollY || window.pageYOffset || 0
    document.documentElement.classList.add("menu-open")
    document.body.classList.add("menu-open")

    document.body.style.position = "fixed"
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.width = "100%"
  }

  const unlockScroll = () => {
    if (!scrollLockActive) return
    scrollLockActive = false

    document.documentElement.classList.remove("menu-open")
    document.body.classList.remove("menu-open")

    document.body.style.position = ""
    document.body.style.top = ""
    document.body.style.left = ""
    document.body.style.right = ""
    document.body.style.width = ""

    window.scrollTo(0, lockedScrollY)
  }

  const setState = (open) => {
    panel.classList.toggle("is-open", open)
    burger.setAttribute("aria-expanded", String(open))
    panel.setAttribute("aria-hidden", String(!open))
    if (open) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }

  const close = () => {
    setState(false)
  }

  on(burger, "click", (e) => {
    e.stopPropagation()
    const isOpen = !panel.classList.contains("is-open")
    setState(isOpen)
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

  setState(false)
}
