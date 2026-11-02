import {
  hskQuestions,
  LEVEL_COUNTS,
  LEVEL_THRESHOLDS,
  LEVEL_GLYPHS,
  RESULT_DESCRIPTIONS,
  COURSE_RECOMMENDATIONS,
  scoreHskTest,
  recommendationFor,
} from "../../data/chineseHskTest";
import { initLevelQuiz } from "./levelQuiz.js";

export function initChineseTest() {
  initLevelQuiz({
    questions: hskQuestions,
    levelCounts: LEVEL_COUNTS,
    thresholds: LEVEL_THRESHOLDS,
    questionWord: "Запитання",
    textLang: "zh-Hans",
    levelWord: "HSK ",
    levelShort: (index) => String(index + 1),
    levelCode: (index) => `HSK ${index + 1}`,
    levelMark: (index) => LEVEL_GLYPHS[index],
    score: scoreHskTest,
    scoreText: (correct, total) => `${correct} / ${total}`,
    levelResult: (level) => (level === 0 ? "Початковий" : `HSK ${level}`),
    description: (level) => RESULT_DESCRIPTIONS[level],
    recommendation: recommendationFor,
    sealText: (level) => (level === 0 ? "入门" : LEVEL_GLYPHS[level - 1]),
    longSeal: (level) => level === 0,
    courses: (level) => COURSE_RECOMMENDATIONS[level],
  });
}
