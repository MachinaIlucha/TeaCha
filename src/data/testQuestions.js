/**
 * TeaCha website
 * English Level Test — Question Bank
 *
 * 20 questions, 4 per CEFR level (A1 → C1).
 * Each question: { id, level, type, question, options[], correct (0-based index) }
 *
 * Types: "grammar" | "vocabulary" | "reading"
 */

export const testQuestions = [
  /* ───────────── A1  (1–4) ───────────── */
  {
    id: 1,
    level: "A1",
    type: "grammar",
    question: "She ___ a student at this school.",
    options: ["am", "is", "are", "be"],
    correct: 1,
  },
  {
    id: 2,
    level: "A1",
    type: "vocabulary",
    question: "Where do you buy medicine?",
    options: ["library", "pharmacy", "cinema", "bakery"],
    correct: 1,
  },
  {
    id: 3,
    level: "A1",
    type: "grammar",
    question: "___ you like chocolate?",
    options: ["Does", "Are", "Do", "Is"],
    correct: 2,
  },
  {
    id: 4,
    level: "A1",
    type: "grammar",
    question: "He ___ to work by bus every day.",
    options: ["go", "goes", "going", "gone"],
    correct: 1,
  },

  /* ───────────── A2  (5–8) ───────────── */
  {
    id: 5,
    level: "A2",
    type: "grammar",
    question: "We ___ to London last summer.",
    options: ["go", "goes", "went", "goed"],
    correct: 2,
  },
  {
    id: 6,
    level: "A2",
    type: "grammar",
    question: "This exercise is ___ than the previous one.",
    options: ["more difficult", "difficulter", "most difficult", "the difficult"],
    correct: 0,
  },
  {
    id: 7,
    level: "A2",
    type: "vocabulary",
    question: "I need to ___ an appointment with the dentist.",
    options: ["do", "take", "make", "have"],
    correct: 2,
  },
  {
    id: 8,
    level: "A2",
    type: "grammar",
    question: "I've already ___ my homework.",
    options: ["do", "did", "done", "does"],
    correct: 2,
  },

  /* ───────────── B1  (9–12) ───────────── */
  {
    id: 9,
    level: "B1",
    type: "grammar",
    question: "If I ___ enough money, I would buy a new car.",
    options: ["have", "had", "will have", "would have"],
    correct: 1,
  },
  {
    id: 10,
    level: "B1",
    type: "grammar",
    question: "The letter ___ yesterday.",
    options: ["sent", "was sent", "is sent", "has sent"],
    correct: 1,
  },
  {
    id: 11,
    level: "B1",
    type: "grammar",
    question: "I've been learning English ___ five years.",
    options: ["since", "from", "for", "during"],
    correct: 2,
  },
  {
    id: 12,
    level: "B1",
    type: "vocabulary",
    question: "The meeting was ___ to next Monday because the manager was ill.",
    options: ["cancelled", "postponed", "arranged", "confirmed"],
    correct: 1,
  },

  /* ───────────── B2  (13–16) ───────────── */
  {
    id: 13,
    level: "B2",
    type: "grammar",
    question: "Not only ___ the exam, but she also got the highest score.",
    options: ["she passed", "did she pass", "she did pass", "has she passed"],
    correct: 1,
  },
  {
    id: 14,
    level: "B2",
    type: "grammar",
    question: "Had I known about the delay, I ___ later.",
    options: ["would arrive", "arrived", "would have arrived", "had arrived"],
    correct: 2,
  },
  {
    id: 15,
    level: "B2",
    type: "grammar",
    question: "___ the heavy rain, the event went ahead as planned.",
    options: ["Although", "However", "Despite", "Nevertheless"],
    correct: 2,
  },
  {
    id: 16,
    level: "B2",
    type: "vocabulary",
    question: "After a long discussion, they managed to come ___ with a solution.",
    options: ["out", "off", "up", "through"],
    correct: 2,
  },

  /* ───────────── C1  (17–20) ───────────── */
  {
    id: 17,
    level: "C1",
    type: "grammar",
    question: "Hardly ___ the station when the train departed.",
    options: ["I had reached", "had I reached", "I reached", "did I reach"],
    correct: 1,
  },
  {
    id: 18,
    level: "C1",
    type: "vocabulary",
    question: "His argument was so ___ that even the critics were won over.",
    options: ["compulsive", "compelling", "comprising", "complying"],
    correct: 1,
  },
  {
    id: 19,
    level: "C1",
    type: "reading",
    question: '"He\'s been burning the candle at both ends." This means he is:',
    options: [
      "Wasting money",
      "Working too hard and not resting enough",
      "Making quick progress",
      "Being very careful with his time",
    ],
    correct: 1,
  },
  {
    id: 20,
    level: "C1",
    type: "vocabulary",
    question: "After years of research, the team finally made a major ___.",
    options: ["breakout", "breakdown", "breakthrough", "breakaway"],
    correct: 2,
  },
];

/** Ordered list of CEFR levels used in this test */
export const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

/** Number of questions per level band */
export const QUESTIONS_PER_LEVEL = 4;
