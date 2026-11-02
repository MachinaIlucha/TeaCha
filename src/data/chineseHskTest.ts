export type HskQuestion = {
  id: number;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  prompt: string;          // Ukrainian instruction
  text: string;            // Chinese; "___" marks the blank
  optionsLang: "uk" | "zh-Hans";
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
};

const FILL = "Оберіть слово, яке підходить у речення:";

export const hskQuestions: HskQuestion[] = [
  { id: 1, level: 1, prompt: "Що означає цей ієрогліф?", text: "水", optionsLang: "uk", options: ["Вода", "Чай", "Молоко", "Рис"], correct: 0, explanation: "水 (shuǐ) — вода." },
  { id: 2, level: 1, prompt: "Оберіть слово:", text: "我___学生。", optionsLang: "zh-Hans", options: ["有", "是", "在", "会"], correct: 1, explanation: "我 是 学生。— Я студент / студентка." },
  { id: 3, level: 1, prompt: "Доповніть:", text: "你___岁？", optionsLang: "zh-Hans", options: ["哪里", "什么", "多少", "谁"], correct: 2, explanation: "你多少岁？ — Скільки тобі років?" },
  { id: 4, level: 2, prompt: FILL, text: "昨天我们___了一部电影。", optionsLang: "zh-Hans", options: ["写", "说", "看", "听"], correct: 2, explanation: "看电影 — дивитися фільм; 昨天…看了 — минула дія." },
  { id: 5, level: 2, prompt: FILL, text: "下雨了，出门的时候___带伞。", optionsLang: "zh-Hans", options: ["正在", "应该", "已经", "比"], correct: 1, explanation: "应该 — слід / варто; 应该带伞 — варто взяти парасолю." },
  { id: 6, level: 2, prompt: FILL, text: "我比妹妹___两岁。", optionsLang: "zh-Hans", options: ["长", "多", "老", "大"], correct: 3, explanation: "我比妹妹大两岁。— Я на два роки старший(-а) за сестру." },
  { id: 7, level: 3, prompt: FILL, text: "他一边听音乐，___做作业。", optionsLang: "zh-Hans", options: ["一直", "一边", "突然", "已经"], correct: 1, explanation: "一边……一边…… — одночасно виконувати дві дії." },
  { id: 8, level: 3, prompt: FILL, text: "如果明天下雨，我们___不去爬山了。", optionsLang: "zh-Hans", options: ["才", "又", "就", "先"], correct: 2, explanation: "如果……就…… — якщо…, то…" },
  { id: 9, level: 3, prompt: FILL, text: "他把钥匙___桌子上了。", optionsLang: "zh-Hans", options: ["想在", "放在", "听在", "认识"], correct: 1, explanation: "把钥匙放在桌子上 — покласти ключі на стіл." },
  { id: 10, level: 4, prompt: FILL, text: "即使下雨，比赛也会___进行。", optionsLang: "zh-Hans", options: ["继续", "终于", "从来", "顺便"], correct: 0, explanation: "继续进行 — продовжуватися; 即使……也…… — навіть якщо…" },
  { id: 11, level: 4, prompt: FILL, text: "与其坐出租车，___坐地铁。", optionsLang: "zh-Hans", options: ["尽管", "不如", "尤其", "既然"], correct: 1, explanation: "与其……不如…… — краще…, ніж…" },
  { id: 12, level: 4, prompt: FILL, text: "这份工作不仅要求专业知识，___需要沟通能力。", optionsLang: "zh-Hans", options: ["否则", "例如", "而且", "即使"], correct: 2, explanation: "不仅……而且…… — не лише…, а й…" },
  { id: 13, level: 5, prompt: FILL, text: "为了避免误会，请把你的意思表达得更___。", optionsLang: "zh-Hans", options: ["偶然", "固定", "明确", "勉强"], correct: 2, explanation: "表达得更明确 — висловитися чіткіше." },
  { id: 14, level: 5, prompt: FILL, text: "这项政策的实施，___了不少争议。", optionsLang: "zh-Hans", options: ["维持", "引发", "依赖", "忍受"], correct: 1, explanation: "引发争议 — викликати суперечки." },
  { id: 15, level: 5, prompt: FILL, text: "面对批评，他没有急着反驳，而是先___对方的意见。", optionsLang: "zh-Hans", options: ["隐瞒", "拒绝", "依赖", "倾听"], correct: 3, explanation: "倾听意见 — уважно вислухати думку." },
  { id: 16, level: 5, prompt: FILL, text: "价格只是影响购买决定的诸多___之一。", optionsLang: "zh-Hans", options: ["因素", "成就", "习俗", "后果"], correct: 0, explanation: "诸多因素之一 — один із багатьох чинників." },
  { id: 17, level: 6, prompt: FILL, text: "这一结论缺少一个重要的___：样本必须有代表性。", optionsLang: "zh-Hans", options: ["后果", "前提", "偏见", "偶然"], correct: 1, explanation: "前提 — передумова; репрезентативність вибірки є умовою." },
  { id: 18, level: 6, prompt: FILL, text: "面对突发事件，他始终___，有条不紊地指挥现场。", optionsLang: "zh-Hans", options: ["迫不及待", "随波逐流", "临危不乱", "无所事事"], correct: 2, explanation: "临危不乱 — зберігати спокій у небезпеці." },
  { id: 19, level: 6, prompt: "Оберіть правильну відповідь:", text: "成语“因噎废食”最接近哪种意思？", optionsLang: "zh-Hans", options: ["碰到困难就调整方法", "担心出问题就干脆放弃", "为省时间而简化步骤", "事先准备好避免失败"], correct: 1, explanation: "因噎废食 — відмовитися від потрібної справи через страх труднощів." },
  { id: 20, level: 6, prompt: "Оберіть правильну відповідь:", text: "“数字化能提高效率，但也要考虑老年人的使用困难。”作者强调什么？", optionsLang: "zh-Hans", options: ["数字化必然降低效率", "老年人都不喜欢科技", "应该停止所有数字化项目", "推进改革时应兼顾不同群体"], correct: 3, explanation: "Автор радить враховувати потреби різних груп під час реформ." },
];

export const LEVEL_COUNTS = [3, 3, 3, 3, 4, 4] as const;
export const LEVEL_THRESHOLDS = [2, 2, 2, 2, 3, 3] as const;
export const LEVEL_GLYPHS = ["一", "二", "三", "四", "五", "六"] as const;
export const SAMPLE_QUESTION_IDS = [1, 4, 7, 10, 13, 17] as const;

// answers[i]: option index, null = skipped, undefined = not reached
export function scoreHskTest(answers: Array<number | null | undefined>) {
  const perLevel = [0, 0, 0, 0, 0, 0];
  hskQuestions.forEach((q, i) => {
    if (answers[i] === q.correct) perLevel[q.level - 1]++;
  });
  let level = 0;
  for (let i = 0; i < 6; i++) {
    if (perLevel[i] >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const correct = perLevel.reduce((sum, n) => sum + n, 0);
  return { perLevel, level, correct, percent: Math.round((100 * correct) / hskQuestions.length) };
}

export const RESULT_DESCRIPTIONS = [
  "Поки що нижче орієнтира HSK 1.",
  "Володіння базовими словами й реченнями.",
  "Можете спілкуватися на прості побутові теми.",
  "Опанували чимало повсякденних граматичних конструкцій.",
  "Можете працювати зі складнішими текстами й поясненнями.",
  "Розумієте досить складну лексику та мовні зв’язки.",
  "Добре орієнтуєтеся в абстрактній лексиці й нюансах текстів.",
] as const;

export function recommendationFor(level: number) {
  return level === 6
    ? "Рекомендація: для точнішої оцінки HSK 6 перевірте також аудіювання, письмо й усне мовлення."
    : `Рекомендація: почніть із повторення тем HSK ${Math.max(1, level + 1)}, потім підтвердьте рівень аудіюванням і короткою розмовою.`;
}

const COURSES = {
  beginners: { label: "Китайська для початківців", href: "/chinese/dlya-pochatkivciv/" },
  phonetics: { label: "Фонетика і тони", href: "/chinese/fonetyka/" },
  speaking: { label: "Розмовна китайська", href: "/chinese/rozmovna/" },
  hsk: { label: "Підготовка до HSK", href: "/chinese/hsk/" },
  business: { label: "Ділова китайська", href: "/chinese/dilova/" },
};
export const COURSE_RECOMMENDATIONS = [
  [COURSES.beginners, COURSES.phonetics],
  [COURSES.beginners, COURSES.speaking],
  [COURSES.speaking, COURSES.hsk],
  [COURSES.hsk, COURSES.speaking],
  [COURSES.hsk, COURSES.business],
  [COURSES.hsk, COURSES.business],
  [COURSES.business, COURSES.hsk],
];

export const HSK_LEVEL_CARDS = [
  { level: 1, stage: "Перші кроки", text: "Окремі слова й короткі речення: привітатися, представитися, назвати числа та поставити просте запитання." },
  { level: 2, stage: "Базове спілкування", text: "Прості розмови про себе, родину, навчання й покупки. Ви розумієте короткі фрази на знайомі теми." },
  { level: 3, stage: "Повсякденні теми", text: "Побутове спілкування без постійної підготовки: минулі події, плани, порівняння й базові складні речення." },
  { level: 4, stage: "Впевнена мова", text: "Ви обговорюєте ширше коло тем і користуєтеся сполучниками на кшталт 即使……也…… та 不仅……而且……." },
  { level: 5, stage: "Складніші тексти", text: "Статті, пояснення й аргументація: тут важливі точний вибір слова та стійкі словосполучення." },
  { level: 6, stage: "Абстрактна лексика", text: "Абстрактні теми, ідіоми-ченьюй і розуміння авторської думки в коротких текстах." },
] as const;

export const HSK_TEST_FAQ = [
  { q: "Як безкоштовно визначити рівень китайської мови онлайн?", a: "Пройдіть тест TeaCha на цій сторінці: 20 запитань від HSK 1 до HSK 6, орієнтовно 5–7 хвилин. Реєстрація не потрібна, результат і розбір відповідей ви побачите одразу." },
  { q: "Чи замінює цей тест офіційний іспит HSK?", a: "Ні. Це експрес-оцінка, а не сертифікація HSK. Короткий письмовий тест не замінює перевірку аудіювання, мовлення та письма." },
  { q: "Як рахується результат тесту?", a: "Рівні проходяться послідовно. Для HSK 1–4 потрібно щонайменше 2 правильні відповіді з 3, для HSK 5–6 — щонайменше 3 з 4. Ваш результат — останній рівень, пройдений без перерви." },
  { q: "Що робити, якщо я не знаю відповіді?", a: "Натисніть «Не знаю — пропустити». Пропущене запитання не зараховується як правильне, зате результат точніше покаже ваш реальний рівень, ніж відповіді навмання." },
  { q: "Чи враховує тест нову систему HSK 3.0?", a: "Тест використовує звичну шкалу HSK 1–6. Нова система HSK 3.0 має дев’ять рівнів і впроваджується поетапно, тому формат конкретного іспиту варто уточнювати в екзаменаційному центрі. Детальніше — у статті <a href=\"/blog/nova-systema-hsk-3-0/\">про нову систему HSK 3.0</a>." },
  { q: "Що робити після тесту?", a: "Подивіться рекомендовані курси на екрані результату або запишіться на пробне заняття: викладач перевірить аудіювання й мовлення та уточнить ваш рівень." },
];
