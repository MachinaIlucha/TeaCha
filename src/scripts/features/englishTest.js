import { testQuestions, LEVELS, QUESTIONS_PER_LEVEL } from "../../data/testQuestions.js";
import { initLevelQuiz } from "./levelQuiz.js";

const PASS_MARK = Math.ceil(QUESTIONS_PER_LEVEL * 0.67);

const TYPE_LABELS = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  reading: "Reading",
};

const LEVEL_META = {
  A1: {
    name: "Beginner",
    nameUk: "Початковий",
    description:
      "Ви розумієте та вживаєте базові фрази й вирази. Можете представитися, поставити прості запитання та відповісти на них. Це чудовий старт — і найкращий час почати навчання системно!",
  },
  A2: {
    name: "Elementary",
    nameUk: "Елементарний",
    description:
      "Ви спілкуєтесь у простих повсякденних ситуаціях та описуєте своє оточення й найближчі потреби. Саме час переходити до впевненого спілкування та розширювати словниковий запас!",
  },
  B1: {
    name: "Intermediate",
    nameUk: "Середній",
    description:
      "Ви справляєтесь із більшістю ситуацій у подорожах та на роботі. Можете описувати досвід, події та обґрунтовувати свою думку. Чудова база для професійного зростання!",
  },
  B2: {
    name: "Upper-Intermediate",
    nameUk: "Вище середнього",
    description:
      "Ви спілкуєтесь вільно та спонтанно, створюєте чіткі тексти на різні теми й відстоюєте свою позицію. Час виходити на рівень впевненого професійного спілкування!",
  },
  C1: {
    name: "Advanced",
    nameUk: "Просунутий",
    description:
      "Ви гнучко використовуєте мову в будь-яких контекстах — соціальних, академічних і професійних. Створюєте структуровані, детальні тексти на складні теми. Вражаючий результат!",
  },
};

const COURSES = {
  A1: [
    { label: "Розмовна англійська", href: "/english/rozmovna-anhliyska/" },
    { label: "Англійська граматика", href: "/english/anhliyska-hramatyka/" },
  ],
  A2: [
    { label: "Розмовна англійська", href: "/english/rozmovna-anhliyska/" },
    { label: "Англійська граматика", href: "/english/anhliyska-hramatyka/" },
    { label: "Підготовка до НМТ", href: "/english/pidhotovka-do-nmt/" },
  ],
  B1: [
    { label: "Бізнес-англійська", href: "/english/biznes-anhliyska/" },
    { label: "Speaking Club", href: "/english/spiking-klub/" },
    { label: "Англійська для переїзду", href: "/english/anhliyska-dlya-pereizdu/" },
  ],
  B2: [
    { label: "Бізнес-англійська", href: "/english/biznes-anhliyska/" },
    { label: "Англійська для IT", href: "/english/anhliyska-dlya-it/" },
    { label: "Корпоративна англійська", href: "/english/korporatyvna-anhliyska/" },
    { label: "Speaking Club", href: "/english/spiking-klub/" },
  ],
  C1: [
    { label: "Speaking Club", href: "/english/spiking-klub/" },
    { label: "Англійська для IT", href: "/english/anhliyska-dlya-it/" },
    { label: "Англійська для дизайнерів", href: "/english/anhliyska-dlya-dyzayneriv/" },
    { label: "Корпоративна англійська", href: "/english/korporatyvna-anhliyska/" },
  ],
};

const questions = testQuestions.map((q) => ({
  level: LEVELS.indexOf(q.level) + 1,
  typeLabel: TYPE_LABELS[q.type],
  prompt: q.question.includes("___")
    ? "Оберіть слово, яке підходить у речення:"
    : "Оберіть правильну відповідь:",
  text: q.question,
  optionsLang: "en",
  options: q.options,
  correct: q.correct,
}));

// The result is the highest level with enough correct answers, A1 if there is none.
function score(answers) {
  const perLevel = LEVELS.map(() => 0);
  questions.forEach((q, i) => {
    if (answers[i] === q.correct) perLevel[q.level - 1]++;
  });
  let level = 1;
  perLevel.forEach((count, index) => {
    if (count >= PASS_MARK) level = index + 1;
  });
  const correct = perLevel.reduce((sum, n) => sum + n, 0);
  return { perLevel, level, correct, percent: Math.round((100 * correct) / questions.length) };
}

const metaFor = (level) => LEVEL_META[LEVELS[level - 1]];

export function initEnglishTest() {
  initLevelQuiz({
    questions,
    levelCounts: LEVELS.map(() => QUESTIONS_PER_LEVEL),
    thresholds: LEVELS.map(() => PASS_MARK),
    questionWord: "Питання",
    textLang: "en",
    levelShort: (index) => LEVELS[index],
    levelCode: (index) => LEVELS[index],
    levelMark: (index) => LEVELS[index],
    score,
    scoreText: (correct) => String(correct),
    levelResult: (level) => `${LEVELS[level - 1]} — ${metaFor(level).name}`,
    description: (level) => `${metaFor(level).nameUk}. ${metaFor(level).description}`,
    sealText: (level) => LEVELS[level - 1],
    courses: (level) => COURSES[LEVELS[level - 1]],
  });
}
