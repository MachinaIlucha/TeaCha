// Shared TeaCha motion, adapted from Mimiao's CSS-first entrance vocabulary.
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (n) => Math.min(1, Math.max(0, n));

export function positionGlider(group, active) {
  if (!group || !active) return;
  group.style.setProperty("--glide-y", `${active.offsetTop}px`);
  group.style.setProperty("--glide-h", `${active.offsetHeight}px`);
  group.style.setProperty("--glide-x", `${active.offsetLeft}px`);
  group.style.setProperty("--glide-w", `${active.offsetWidth}px`);
}

export function animatePrice(element, amount) {
  if (reduced.matches) {
    element.textContent = amount.toLocaleString("uk-UA");
    return;
  }
  element.getAnimations().forEach((animation) => animation.cancel());
  element.animate(
    [
      { opacity: 0.2, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" },
  );
  element.textContent = amount.toLocaleString("uk-UA");
}

export function initSchoolMotion() {
  const intro = document.querySelector(".tc-intro");
  const ripple = document.querySelector(".tc-intro-ripple");
  if (intro && root.classList.contains("tc-arriving") && !reduced.matches) {
    let opening = false;
    const timers = [];
    const events = ["pointerdown", "keydown", "wheel", "touchstart"];
    const finish = () => {
      timers.forEach(clearTimeout);
      root.classList.remove("tc-arriving", "tc-pouring");
      intro.remove();
      ripple?.remove();
      events.forEach((name) => window.removeEventListener(name, open));
    };
    const open = () => {
      if (opening) return;
      opening = true;
      timers.forEach(clearTimeout);
      intro.classList.add("is-word", "is-opening");
      ripple?.classList.add("is-opening");
      root.classList.add("tc-pouring");
      events.forEach((name) => window.removeEventListener(name, open));
      timers.push(setTimeout(finish, 1700));
    };
    timers.push(
      setTimeout(
        () => intro.querySelector("image")?.removeAttribute("mask"),
        2100,
      ),
    );
    timers.push(setTimeout(() => intro.classList.add("is-word"), 2350));
    timers.push(setTimeout(open, 3550));
    events.forEach((name) =>
      window.addEventListener(name, open, { once: true, passive: true }),
    );
    reduced.addEventListener("change", () => {
      if (reduced.matches) finish();
    });
  } else {
    intro?.remove();
    ripple?.remove();
    root.classList.remove("tc-arriving");
  }

  if (!reduced.matches && "IntersectionObserver" in window) {
    root.classList.add("tc-motion");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          entry.target.querySelectorAll("[data-count]").forEach((el) => {
            const amount = Number(el.dataset.count);
            let start;
            const tick = (now) => {
              start ??= now;
              const progress = reduced.matches
                ? 1
                : clamp((now - start) / 1300);
              el.textContent = String(
                Math.round(amount * (1 - (1 - progress) ** 3)),
              );
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    document
      .querySelectorAll('[data-rise], [data-reveal="photo"]')
      .forEach((el) => observer.observe(el));
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        root.classList.remove("tc-motion");
        observer.disconnect();
      }
    });
  }

  const scenes = [
    ...document.querySelectorAll(
      "[data-photo-story], [data-portrait-fan], [data-learning-path]",
    ),
  ];
  let scheduled = false;
  let pageHeight = 1;
  const update = () => {
    scheduled = false;
    root.style.setProperty(
      "--read-progress",
      String(clamp(scrollY / pageHeight)),
    );
    if (reduced.matches) return;
    const height = innerHeight;
    const snapshots = scenes.map((el) => ({
      el,
      rect: el.getBoundingClientRect(),
    }));
    for (const { el, rect } of snapshots) {
      if (rect.top > height + 100 || rect.bottom < -100) continue;
      if (el.hasAttribute("data-photo-story") && innerWidth > 800) {
        const p = clamp((height - rect.top) / (height + 280));
        const eased = 1 - (1 - p) ** 2;
        el.style.setProperty("--story-spread", eased.toFixed(4));
        el.style.setProperty(
          "--story-copy",
          clamp((eased - 0.45) / 0.45).toFixed(4),
        );
      }
      if (el.hasAttribute("data-portrait-fan"))
        el.style.setProperty(
          "--fan-shift",
          clamp((height - rect.top) / (height + rect.height)).toFixed(3),
        );
      if (el.hasAttribute("data-learning-path"))
        el.style.setProperty(
          "--path-progress",
          clamp((height * 0.7 - rect.top) / (rect.height * 0.8)).toFixed(3),
        );
    }
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  };
  const measure = () => {
    scenes
      .filter((el) => el.hasAttribute("data-photo-story"))
      .forEach((el) =>
        el.classList.toggle(
          "tc-memory--animated",
          !reduced.matches && innerWidth > 800,
        ),
      );
    pageHeight = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    document
      .querySelectorAll("[data-glide]")
      .forEach((group) =>
        positionGlider(group, group.querySelector(".is-active")),
      );
    schedule();
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  reduced.addEventListener("change", measure);
  new ResizeObserver(() => {
    pageHeight = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    schedule();
  }).observe(document.body);
  measure();
  document.fonts?.ready.then(measure);

  const fine = matchMedia("(hover:hover) and (pointer:fine)");
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    let frame;
    card.addEventListener("pointermove", (event) => {
      if (!fine.matches || reduced.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty(
          "--tilt-x",
          `${((event.clientY - r.top) / r.height - 0.5) * -5}deg`,
        );
        card.style.setProperty(
          "--tilt-y",
          `${((event.clientX - r.left) / r.width - 0.5) * 5}deg`,
        );
      });
    });
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}
