/**
 * TeaCha website — English Level Test
 * Test engine: state management, scoring, UI orchestration.
 */

import { testQuestions, LEVELS, QUESTIONS_PER_LEVEL } from "../../data/testQuestions.js";
import { qs, qsa, on } from "../core/dom.js";

/* ── helpers ── */
const $ = (sel) => qs(sel);
const $$ = (sel) => qsa(sel);

/* ── state ── */
let current = 0;
let answers = [];        // user selections (index per question, -1 = unanswered)
let isTransitioning = false;

/* ── level descriptions (Ukrainian) ── */
const levelMeta = {
  A1: {
    name: "Beginner",
    nameUk: "Початковий",
    description:
      "Ви розумієте та вживаєте базові фрази й вирази. Можете представитися, поставити прості запитання та відповісти на них. Це чудовий старт — і найкращий час почати навчання системно!",
    color: "#43a047",
  },
  A2: {
    name: "Elementary",
    nameUk: "Елементарний",
    description:
      "Ви спілкуєтесь у простих повсякденних ситуаціях та описуєте своє оточення й найближчі потреби. Саме час переходити до впевненого спілкування та розширювати словниковий запас!",
    color: "#7cb342",
  },
  B1: {
    name: "Intermediate",
    nameUk: "Середній",
    description:
      "Ви справляєтесь із більшістю ситуацій у подорожах та на роботі. Можете описувати досвід, події та обґрунтовувати свою думку. Чудова база для професійного зростання!",
    color: "#fdd835",
  },
  B2: {
    name: "Upper-Intermediate",
    nameUk: "Вище середнього",
    description:
      "Ви спілкуєтесь вільно та спонтанно, створюєте чіткі тексти на різні теми й відстоюєте свою позицію. Час виходити на рівень впевненого професійного спілкування!",
    color: "#ff9800",
  },
  C1: {
    name: "Advanced",
    nameUk: "Просунутий",
    description:
      "Ви гнучко використовуєте мову в будь-яких контекстах — соціальних, академічних і професійних. Створюєте структуровані, детальні тексти на складні теми. Вражаючий результат!",
    color: "#e53935",
  },
};

/* ── course recommendations per level ── */
const recommendations = {
  A1: [
    { label: "Розмовна англійська", href: "/english/rozmovna-anhliyska" },
    { label: "Англійська граматика", href: "/english/anhliyska-hramatyka" },
  ],
  A2: [
    { label: "Розмовна англійська", href: "/english/rozmovna-anhliyska" },
    { label: "Англійська граматика", href: "/english/anhliyska-hramatyka" },
    { label: "Підготовка до НМТ", href: "/english/pidhotovka-do-nmt" },
  ],
  B1: [
    { label: "Бізнес-англійська", href: "/english/biznes-anhliyska" },
    { label: "Speaking Club", href: "/english/spiking-klub" },
    { label: "Англійська для переїзду", href: "/english/anhliyska-dlya-pereizdu" },
  ],
  B2: [
    { label: "Бізнес-англійська", href: "/english/biznes-anhliyska" },
    { label: "Англійська для IT", href: "/english/anhliyska-dlya-it" },
    { label: "Корпоративна англійська", href: "/english/korporatyvna-anhliyska" },
    { label: "Speaking Club", href: "/english/spiking-klub" },
  ],
  C1: [
    { label: "Speaking Club", href: "/english/spiking-klub" },
    { label: "Англійська для IT", href: "/english/anhliyska-dlya-it" },
    { label: "Англійська для дизайнерів", href: "/english/anhliyska-dlya-dyzayneriv" },
    { label: "Корпоративна англійська", href: "/english/korporatyvna-anhliyska" },
  ],
};

/* ── type labels ── */
const typeLabels = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  reading: "Reading",
};

// ───────────────────────────── scoring ─────────────────────────────

function computeResult() {
  const bandScores = {};
  for (const lvl of LEVELS) bandScores[lvl] = { correct: 0, total: 0 };

  testQuestions.forEach((q, i) => {
    bandScores[q.level].total++;
    if (answers[i] === q.correct) bandScores[q.level].correct++;
  });

  // Determine level: highest band with ≥ 4/6 correct
  let determinedLevel = "A1";
  for (const lvl of LEVELS) {
    if (bandScores[lvl].correct >= Math.ceil(QUESTIONS_PER_LEVEL * 0.67)) {
      determinedLevel = lvl;
    }
  }

  const totalCorrect = Object.values(bandScores).reduce((s, b) => s + b.correct, 0);

  return { determinedLevel, bandScores, totalCorrect };
}

// ───────────────────────────── rendering ─────────────────────────────

function showScreen(name) {
  $$("[data-test-screen]").forEach((el) => {
    const isTarget = el.dataset.testScreen === name;
    el.hidden = !isTarget;
    el.classList.toggle("is-active", isTarget);
  });
}

function renderQuestion(index) {
  const q = testQuestions[index];
  if (!q) return;

  const counter = $("[data-test-counter]");
  const progressFill = $("[data-test-progress]");
  const questionEl = $("[data-test-question]");
  const typeBadge = $("[data-test-type]");
  const levelBand = $("[data-test-level-band]");
  const qNumber = $("[data-test-q-number]");
  const optionsEl = $("[data-test-options]");
  const questionWrap = $(".levelTest__questionWrap");
  const dotsEl = $("[data-test-dots]");

  if (counter) counter.textContent = `${index + 1} / ${testQuestions.length}`;
  if (progressFill) progressFill.style.width = `${((index + 1) / testQuestions.length) * 100}%`;

  if (typeBadge) typeBadge.textContent = typeLabels[q.type] || q.type;
  if (levelBand) levelBand.textContent = q.level;
  if (qNumber) qNumber.textContent = String(index + 1).padStart(2, "0");

  if (questionEl) questionEl.textContent = q.question;

  if (optionsEl) {
    optionsEl.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "levelTest__option";
      btn.dataset.index = i;
      btn.textContent = opt;

      // restore previous answer if going back (not used yet, but safe)
      if (answers[index] === i) btn.classList.add("is-selected");

      on(btn, "click", () => handleAnswer(index, i));
      optionsEl.appendChild(btn);
    });
  }

  // render dots
  if (dotsEl) {
    dotsEl.innerHTML = "";
    testQuestions.forEach((_, di) => {
      const dot = document.createElement("span");
      dot.className = "levelTest__dot";
      if (di < index) dot.classList.add("is-done");
      if (di === index) dot.classList.add("is-current");
      dotsEl.appendChild(dot);
    });
  }

  // animate in
  if (questionWrap) {
    questionWrap.classList.remove("is-entering");
    // force reflow
    void questionWrap.offsetWidth;
    questionWrap.classList.add("is-entering");
  }
}

function handleAnswer(qIndex, optionIndex) {
  if (isTransitioning) return;
  isTransitioning = true;

  answers[qIndex] = optionIndex;

  // Highlight selected
  const options = $$("[data-test-options] .levelTest__option");
  options.forEach((btn) => {
    btn.classList.toggle("is-selected", Number(btn.dataset.index) === optionIndex);
    btn.setAttribute("aria-disabled", "true");
  });

  // Brief delay → advance
  setTimeout(() => {
    if (current < testQuestions.length - 1) {
      current++;
      renderQuestion(current);
    } else {
      showResult();
    }
    isTransitioning = false;
  }, 600);
}

// ───────────────────────────── result screen ─────────────────────────────

function showResult() {
  showScreen("result");

  const { determinedLevel, bandScores, totalCorrect } = computeResult();
  const meta = levelMeta[determinedLevel];

  // level badge
  const levelBadge = $("[data-test-result-level]");
  if (levelBadge) {
    levelBadge.textContent = determinedLevel;
    levelBadge.style.setProperty("--level-color", meta.color);
  }

  // title
  const titleEl = $("[data-test-result-title]");
  if (titleEl) titleEl.textContent = `${determinedLevel} — ${meta.name}`;

  // subtitle
  const subtitleEl = $("[data-test-result-subtitle]");
  if (subtitleEl) subtitleEl.textContent = meta.nameUk;

  // description
  const descEl = $("[data-test-result-desc]");
  if (descEl) descEl.textContent = meta.description;

  // total score
  const scoreEl = $("[data-test-result-score]");
  if (scoreEl) scoreEl.textContent = totalCorrect;

  // band breakdown bars
  const breakdownEl = $("[data-test-breakdown]");
  if (breakdownEl) {
    breakdownEl.innerHTML = "";
    for (const lvl of LEVELS) {
      const band = bandScores[lvl];
      const pct = Math.round((band.correct / band.total) * 100);
      const passed = band.correct >= Math.ceil(QUESTIONS_PER_LEVEL * 0.67);

      const row = document.createElement("div");
      row.className = "levelTest__bandRow";
      row.innerHTML = `
        <span class="levelTest__bandLabel">${lvl}</span>
        <div class="levelTest__bandTrack">
          <div class="levelTest__bandFill ${passed ? "is-passed" : ""}"
               style="--fill-pct: ${pct}%"></div>
        </div>
        <span class="levelTest__bandScore">${band.correct}/${band.total}</span>
      `;
      breakdownEl.appendChild(row);
    }

    // animate bars in with stagger
    requestAnimationFrame(() => {
      const fills = breakdownEl.querySelectorAll(".levelTest__bandFill");
      fills.forEach((f, i) => {
        f.style.transitionDelay = `${i * 120}ms`;
        f.classList.add("is-animated");
      });
    });
  }

  // recommendations
  const recsEl = $("[data-test-recommendations]");
  if (recsEl) {
    const recs = recommendations[determinedLevel] || [];
    recsEl.innerHTML = "";
    recs.forEach((rec) => {
      const a = document.createElement("a");
      a.href = rec.href;
      a.className = "levelTest__recLink";
      a.textContent = rec.label;
      recsEl.appendChild(a);
    });
  }

  // scroll to top of result
  const resultScreen = $('[data-test-screen="result"]');
  if (resultScreen) resultScreen.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ───────────────────────────── init ─────────────────────────────

function resetTest() {
  current = 0;
  answers = new Array(testQuestions.length).fill(-1);
  isTransitioning = false;
  showScreen("welcome");
}

export function initLevelTest() {
  const root = $("#level-test");
  if (!root) return;

  resetTest();

  // Start button
  on($("[data-test-start]"), "click", () => {
    showScreen("question");
    renderQuestion(0);
  });

  // Restart
  on($("[data-test-restart]"), "click", () => {
    resetTest();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Keyboard navigation for options
  on(root, "keydown", (e) => {
    if (e.key >= "1" && e.key <= "4") {
      const idx = Number(e.key) - 1;
      const opts = $$("[data-test-options] .levelTest__option");
      if (opts[idx] && !opts[idx].getAttribute("aria-disabled")) {
        opts[idx].click();
      }
    }
  });
}
