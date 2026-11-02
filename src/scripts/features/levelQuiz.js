// Shared engine for the level tests. Each test passes its questions, scoring and wording.
const LETTERS = ["A", "B", "C", "D"];

export function initLevelQuiz(config) {
  const { questions, levelCounts, thresholds, levelCode, levelMark, score } = config;
  const TOTAL = questions.length;
  const root = document.getElementById("hsk-test");
  if (!root) return;

  const $ = (selector) => root.querySelector(selector);
  const screens = {
    intro: $('[data-hsk-screen="intro"]'),
    quiz: $('[data-hsk-screen="quiz"]'),
    results: $('[data-hsk-screen="results"]'),
  };
  const card = $(".hsk-quiz__card");
  const track = $("[data-hsk-track]");
  const counter = $("[data-hsk-counter]");
  const stage = $("[data-hsk-stage]");
  const typeEl = $("[data-hsk-type]");
  const watermark = $("[data-hsk-watermark]");
  const body = $("[data-hsk-body]");
  const promptEl = $("[data-hsk-prompt]");
  const questionEl = $("[data-hsk-question]");
  const optionsEl = $("[data-hsk-options]");
  const prevBtn = $("[data-hsk-prev]");
  const nextBtn = $("[data-hsk-next]");
  const skipBtn = $("[data-hsk-skip]");
  const live = $("[data-hsk-live]");
  const startBtn = $("[data-hsk-start]");
  const restartBtn = $("[data-hsk-restart]");
  const reviewToggle = $("[data-hsk-review-toggle]");
  const reviewEl = $("[data-hsk-review]");
  const resultsTitle = $("[data-hsk-results-title]");
  const levelEl = $("[data-hsk-level]");
  const levelDesc = $("[data-hsk-level-desc]");
  const recEl = $("[data-hsk-recommendation]");
  const sealWrap = $(".hsk-seal");
  const seal = $("[data-hsk-seal]");
  const resultSteps = Array.from(root.querySelectorAll("[data-hsk-result-stairs] .hsk-step"));
  const scoreEl = $("[data-hsk-score]");
  const percentEl = $("[data-hsk-percent]");
  const levelsEl = $("[data-hsk-levels]");
  const coursesEl = $("[data-hsk-courses]");
  if (!card || !body || !questionEl || !optionsEl || !nextBtn || !prevBtn || !skipBtn) return;

  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => reducedQuery.matches;

  let current = 0;
  let answers = Array(TOTAL).fill(undefined);
  let isAnimating = false;
  let isLeaving = false;
  let token = 0;
  let lastLevel = null;
  let countFrame = 0;
  let segments = [];
  let groups = [];

  // ---------- helpers ----------
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const reflow = (node) => void node.offsetWidth;

  const retrigger = (node, className) => {
    node.classList.remove(className);
    reflow(node);
    node.classList.add(className);
  };

  const scrollToScreen = (screen) => {
    const top = screen.getBoundingClientRect().top + window.scrollY - 116;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced() ? "auto" : "smooth" });
  };

  const showScreen = (name) => {
    Object.entries(screens).forEach(([key, node]) => {
      if (node) node.hidden = key !== name;
    });
    scrollToScreen(screens[name]);
  };

  // ---------- track ----------
  const buildTrack = () => {
    if (!track) return;
    track.textContent = "";
    segments = [];
    groups = [];
    let index = 0;
    levelCounts.forEach((count, levelIndex) => {
      const group = el("div", "hsk-track__group");
      group.style.flexGrow = String(count);
      const label = el("span", "hsk-track__label");
      if (config.levelWord) label.append(el("span", "hsk-word", config.levelWord));
      label.append(config.levelShort(levelIndex));
      group.appendChild(label);
      const segs = el("div", "hsk-track__segs");
      for (let i = 0; i < count; i++) {
        const seg = el("i");
        segments[index++] = seg;
        segs.appendChild(seg);
      }
      group.appendChild(segs);
      track.appendChild(group);
      groups.push(group);
    });
  };

  const updateTrack = () => {
    const level = questions[current].level;
    segments.forEach((seg, index) => {
      const answer = answers[index];
      seg.classList.toggle("is-answered", typeof answer === "number");
      seg.classList.toggle("is-skipped", answer === null);
      seg.classList.toggle("is-current", index === current);
    });
    groups.forEach((group, index) => group.classList.toggle("is-active", index === level - 1));
  };

  // ---------- question rendering ----------
  const getBlank = () => questionEl.querySelector("[data-hsk-blank]");

  const updateBlank = (animate) => {
    const blank = getBlank();
    if (!blank) return;
    const q = questions[current];
    const answer = answers[current];
    if (typeof answer === "number") {
      blank.textContent = q.options[answer];
      blank.removeAttribute("role");
      blank.removeAttribute("aria-label");
      if (animate) retrigger(blank, "is-filled");
      else blank.classList.add("is-filled");
    } else {
      blank.textContent = "";
      blank.classList.remove("is-filled");
      blank.setAttribute("role", "img");
      blank.setAttribute("aria-label", "пропуск");
    }
  };

  const updateSelection = () => {
    const answer = answers[current];
    Array.from(optionsEl.children).forEach((button, index) => {
      const selected = answer === index;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };

  const updateControls = () => {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = answers[current] === undefined;
    nextBtn.textContent = current === TOTAL - 1 ? "Завершити тест" : "Далі";
  };

  const renderQuestion = () => {
    const q = questions[current];
    const level = q.level;
    const count = `${config.questionWord} ${current + 1} із ${TOTAL}`;
    const code = levelCode(level - 1);

    counter.textContent = count;
    stage.textContent = code;
    if (typeEl) typeEl.textContent = q.typeLabel;
    live.textContent = `${count}, рівень ${code}. ${q.prompt}`;
    promptEl.textContent = q.prompt;

    watermark.textContent = levelMark(level - 1);
    if (lastLevel !== null && lastLevel !== level) retrigger(watermark, "is-swapping");
    lastLevel = level;

    questionEl.textContent = "";
    questionEl.classList.toggle("hsk-question--glyph", q.text.length === 1);
    const parts = q.text.split("___");
    if (parts.length > 1) {
      questionEl.appendChild(document.createTextNode(parts[0]));
      const blank = el("span", "hsk-blank");
      blank.setAttribute("data-hsk-blank", "");
      questionEl.appendChild(blank);
      questionEl.appendChild(document.createTextNode(parts.slice(1).join("___")));
    } else {
      questionEl.appendChild(document.createTextNode(q.text));
    }

    optionsEl.textContent = "";
    q.options.forEach((option, index) => {
      const button = el("button", "hsk-option");
      button.type = "button";
      button.style.setProperty("--i", String(index));
      button.setAttribute("aria-pressed", "false");
      button.appendChild(
        (() => {
          const letter = el("span", "hsk-option__letter", LETTERS[index]);
          letter.setAttribute("aria-hidden", "true");
          return letter;
        })(),
      );
      const text = el("span", "hsk-option__text", option);
      text.setAttribute("lang", q.optionsLang);
      button.appendChild(text);
      button.addEventListener("click", () => selectOption(index));
      optionsEl.appendChild(button);
    });

    updateBlank(false);
    updateSelection();
    updateControls();
    updateTrack();
  };

  const selectOption = (index) => {
    // While the old question fades out, a key press must not overwrite its answer.
    if (isLeaving) return;
    answers[current] = index;
    updateSelection();
    updateBlank(true);
    updateControls();
    updateTrack();
  };

  // ---------- transitions ----------
  const focusQuestion = () => questionEl.focus({ preventScroll: true });

  const scrollIfCardAbove = () => {
    if (card.getBoundingClientRect().top < 88) scrollToScreen(screens.quiz);
  };

  const settle = (animation) => animation.finished.catch(() => {});

  const goTo = async (target, direction) => {
    const myToken = ++token;
    isAnimating = true;
    try {
      if (reduced()) {
        current = target;
        renderQuestion();
      } else {
        isLeaving = true;
        const out = body.animate(
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: `translateX(${direction > 0 ? -20 : 20}px)` },
          ],
          { duration: 140, easing: "ease-in", fill: "forwards" },
        );
        await settle(out);
        isLeaving = false;
        if (myToken !== token) return;
        current = target;
        renderQuestion();
        out.cancel();
        const incoming = body.animate(
          [
            { opacity: 0, transform: `translateX(${direction > 0 ? 28 : -28}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 340, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        focusQuestion();
        scrollIfCardAbove();
        await settle(incoming);
        return;
      }
      focusQuestion();
      scrollIfCardAbove();
    } finally {
      if (myToken === token) isAnimating = false;
    }
  };

  const cancelBodyAnimations = () => body.getAnimations().forEach((animation) => animation.cancel());

  // ---------- results ----------
  const stopCount = () => {
    if (countFrame) cancelAnimationFrame(countFrame);
    countFrame = 0;
  };

  const countUp = (result) => {
    stopCount();
    const format = (progress) => {
      scoreEl.textContent = config.scoreText(Math.round(result.correct * progress), TOTAL);
      percentEl.textContent = `${Math.round(result.percent * progress)}%`;
    };
    if (reduced()) {
      format(1);
      return;
    }
    format(0);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      format(1 - Math.pow(1 - t, 3));
      if (t < 1) countFrame = requestAnimationFrame(tick);
      else {
        countFrame = 0;
        format(1);
      }
    };
    countFrame = requestAnimationFrame(tick);
  };

  const renderResults = (result) => {
    const { level, perLevel } = result;
    levelEl.textContent = config.levelResult(level);
    levelDesc.textContent = config.description(level);
    if (recEl) recEl.textContent = config.recommendation(level);
    seal.textContent = config.sealText(level);
    sealWrap.classList.toggle("is-long", Boolean(config.longSeal?.(level)));

    resultSteps.forEach((step, index) => {
      step.classList.toggle("is-reached", index < level);
      step.classList.toggle("is-top", index === level - 1);
    });

    levelsEl.textContent = "";
    perLevel.forEach((count, index) => {
      const row = el("div", "hsk-level-row");
      row.appendChild(el("strong", "", levelCode(index)));
      const mini = el("div", "hsk-mini");
      const bar = el("span");
      bar.style.setProperty("--fill", `${(100 * count) / levelCounts[index]}%`);
      bar.style.setProperty("--i", String(index));
      if (count >= thresholds[index]) bar.classList.add("is-passed");
      mini.appendChild(bar);
      row.appendChild(mini);
      row.appendChild(el("span", "", `${count}/${levelCounts[index]}`));
      if (count >= thresholds[index]) row.classList.add("is-passed");
      levelsEl.appendChild(row);
    });

    coursesEl.textContent = "";
    config.courses(level).forEach((course) => {
      const link = el("a", "hsk-course");
      link.href = course.href;
      link.appendChild(el("span", "", course.label));
      const arrow = el("span", "hsk-course__arrow", "→");
      arrow.setAttribute("aria-hidden", "true");
      link.appendChild(arrow);
      coursesEl.appendChild(link);
    });

    countUp(result);
  };

  // Tags Chinese runs in mixed Ukrainian text so screen readers switch language.
  const mixed = (tag, className, text) => {
    const node = el(tag, className);
    text.split(/([\u3400-\u9fff][\u3400-\u9fff\u3000-\u303f\uff00-\uffef…]*)/).forEach((part, index) => {
      if (!part) return;
      if (index % 2 === 0) node.append(part);
      else {
        const run = el("span", "", part);
        run.setAttribute("lang", "zh-Hans");
        node.append(run);
      }
    });
    return node;
  };

  const run = (text, lang) => {
    const node = el("span", "", text);
    node.setAttribute("lang", lang);
    return node;
  };

  const buildReview = () => {
    reviewEl.textContent = "";
    questions.forEach((q, index) => {
      const answer = answers[index];
      const skipped = typeof answer !== "number";
      const right = answer === q.correct;
      const item = el("div", `hsk-review__item ${skipped ? "is-skipped" : right ? "is-right" : "is-wrong"}`);
      const mark = skipped ? "–" : right ? "✓" : "×";
      const title = el("h4", "hsk-review__title", `${index + 1}. ${mark} ${q.prompt} `);
      title.append(run(q.text, config.textLang));
      item.appendChild(title);
      const yours = el("p", "", skipped ? "Пропущено" : "Ваша відповідь: ");
      if (!skipped) yours.append(run(q.options[answer], q.optionsLang));
      item.appendChild(yours);
      const correct = el("p", "", "Правильна відповідь: ");
      correct.append(run(q.options[q.correct], q.optionsLang));
      if (q.explanation) correct.append(". ", ...mixed("span", "", q.explanation).childNodes);
      item.appendChild(correct);
      reviewEl.appendChild(item);
    });
  };

  const collapseReview = () => {
    reviewEl.hidden = true;
    reviewEl.textContent = "";
    reviewToggle.setAttribute("aria-expanded", "false");
    reviewToggle.textContent = "Переглянути відповіді";
  };

  const finish = () => {
    const result = score(answers);
    token++;
    isAnimating = false;
    cancelBodyAnimations();
    collapseReview();
    renderResults(result);
    showScreen("results");
    retrigger(screens.results, "is-entered");
    resultsTitle.focus({ preventScroll: true });
  };

  // ---------- flow ----------
  const reset = () => {
    token++;
    isAnimating = false;
    cancelBodyAnimations();
    stopCount();
    current = 0;
    answers = Array(TOTAL).fill(undefined);
    lastLevel = null;
    screens.results.classList.remove("is-entered");
    collapseReview();
  };

  const begin = () => {
    reset();
    renderQuestion();
    showScreen("quiz");
    focusQuestion();
  };

  const next = () => {
    if (isAnimating || answers[current] === undefined) return;
    if (current === TOTAL - 1) finish();
    else goTo(current + 1, 1);
  };

  const skip = () => {
    if (isAnimating) return;
    answers[current] = null;
    if (current === TOTAL - 1) {
      updateTrack();
      finish();
    } else goTo(current + 1, 1);
  };

  const prev = () => {
    if (isAnimating || current === 0) return;
    goTo(current - 1, -1);
  };

  startBtn?.addEventListener("click", begin);
  restartBtn?.addEventListener("click", begin);
  nextBtn.addEventListener("click", next);
  skipBtn.addEventListener("click", skip);
  prevBtn.addEventListener("click", prev);

  reviewToggle?.addEventListener("click", () => {
    const open = reviewEl.hidden;
    if (open) buildReview();
    else reviewEl.textContent = "";
    reviewEl.hidden = !open;
    reviewToggle.setAttribute("aria-expanded", String(open));
    reviewToggle.textContent = open ? "Сховати відповіді" : "Переглянути відповіді";
  });

  // ---------- keyboard ----------
  const KEY_INDEX = {
    Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
    Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3,
    KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3,
  };

  document.addEventListener("keydown", (event) => {
    if (screens.quiz.hidden) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    // Single-key shortcuts apply only while focus is inside the card (WCAG 2.1.4).
    if (!(target instanceof Element) || !card.contains(target)) return;
    const modal = document.getElementById("consultModal");
    if (modal && (modal.open || modal.matches("[open]"))) return;
    if (event.code in KEY_INDEX) {
      const button = optionsEl.children[KEY_INDEX[event.code]];
      if (button) {
        event.preventDefault();
        selectOption(KEY_INDEX[event.code]);
      }
    } else if (event.code === "Enter" || event.key === "Enter") {
      if (target instanceof Element && target.closest("button, a")) return;
      if (!nextBtn.disabled) {
        event.preventDefault();
        next();
      }
    }
  });

  buildTrack();
}
