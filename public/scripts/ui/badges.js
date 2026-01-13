export const initBadges = () => {
  document.querySelectorAll(".badge--round").forEach((el) => {
    const delay = -(Math.random() * 2.8).toFixed(2) + "s"
    el.style.setProperty("--halo-delay", delay)

    const dur = (2.6 + Math.random() * 0.8).toFixed(2) + "s"
    el.style.setProperty("--halo-dur", dur)

    el.classList.add("is-intro")
    window.setTimeout(() => el.classList.remove("is-intro"), 480)
  })
}
