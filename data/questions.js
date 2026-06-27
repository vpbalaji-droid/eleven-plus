// 11+ seed question bank. Stack-independent module — exposes window.QUESTIONS.
// Each object follows data/schema.md. answer is a 0-based index into choices.
// Seed content for English / Maths / Verbal; Non-verbal is stubbed with
// placeholder images until real visual items are authored.
(function () {
  const QUESTIONS = [
    // ---------------------------------------------------------------- ENGLISH
    {
      id: "en-001", subject: "english", topic: "vocabulary", board: "GL",
      region: ["kent", "bexley"], difficulty: 1,
      stem: "Choose the word most similar in meaning to: RELUCTANT.",
      passage: null, image: null,
      choices: ["eager", "unwilling", "tired", "curious"],
      answer: 1,
      explanation: "‘Reluctant’ means unwilling or hesitant to do something.",
      source: "seed"
    },
    {
      id: "en-002", subject: "english", topic: "vocabulary", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "Choose the word most OPPOSITE in meaning to: ABUNDANT.",
      passage: null, image: null,
      choices: ["plentiful", "scarce", "wealthy", "generous"],
      answer: 1,
      explanation: "‘Abundant’ means plentiful, so its opposite is ‘scarce’.",
      source: "seed"
    },
    {
      id: "en-003", subject: "english", topic: "spelling", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "Which word is spelled correctly?",
      passage: null, image: null,
      choices: ["seperate", "separate", "seperete", "separete"],
      answer: 1,
      explanation: "The correct spelling is ‘separate’ — remember ‘there’s A RAT in separate’.",
      source: "seed"
    },
    {
      id: "en-004", subject: "english", topic: "grammar", board: "Quest",
      region: ["bexley"], difficulty: 2,
      stem: "Choose the correct word: The team played ____ best in the final.",
      passage: null, image: null,
      choices: ["it's", "its", "its'", "its's"],
      answer: 1,
      explanation: "‘Its’ is the possessive form. ‘It’s’ means ‘it is’.",
      source: "seed"
    },
    {
      id: "en-005", subject: "english", topic: "comprehension", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "According to the passage, why did Mia hesitate at the door?",
      passage: "Mia stood at the classroom door, her hand hovering over the handle. She could hear laughter inside, but she did not recognise a single voice. New school, new town, new everything. Taking a slow breath, she finally pushed the door open.",
      image: null,
      choices: [
        "She had forgotten her books.",
        "She did not know anyone inside.",
        "The door was locked.",
        "She was late for class."
      ],
      answer: 1,
      explanation: "The passage says she ‘did not recognise a single voice’ — she hesitated because everyone was unfamiliar.",
      source: "seed"
    },
    {
      id: "en-006", subject: "english", topic: "comprehension", board: "GL",
      region: ["kent", "bexley"], difficulty: 3,
      stem: "The phrase ‘new everything’ suggests that Mia feels:",
      passage: "Mia stood at the classroom door, her hand hovering over the handle. She could hear laughter inside, but she did not recognise a single voice. New school, new town, new everything. Taking a slow breath, she finally pushed the door open.",
      image: null,
      choices: ["excited and confident", "bored and tired", "overwhelmed by change", "angry at her parents"],
      answer: 2,
      explanation: "Listing ‘new school, new town, new everything’ emphasises how much has changed at once, suggesting she feels overwhelmed.",
      source: "seed"
    },

    // ------------------------------------------------------------------ MATHS
    {
      id: "ma-001", subject: "maths", topic: "arithmetic", board: "GL",
      region: ["kent", "bexley"], difficulty: 1,
      stem: "What is 347 + 268?",
      passage: null, image: null,
      choices: ["605", "615", "515", "625"],
      answer: 1,
      explanation: "347 + 268 = 615.",
      source: "seed"
    },
    {
      id: "ma-002", subject: "maths", topic: "fractions", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "What is 3/4 of 60?",
      passage: null, image: null,
      choices: ["15", "30", "45", "48"],
      answer: 2,
      explanation: "60 ÷ 4 = 15, and 15 × 3 = 45.",
      source: "seed"
    },
    {
      id: "ma-003", subject: "maths", topic: "percentages", board: "Quest",
      region: ["bexley"], difficulty: 2,
      stem: "A jacket costs £80. In a sale it is reduced by 25%. What is the sale price?",
      passage: null, image: null,
      choices: ["£55", "£60", "£65", "£75"],
      answer: 1,
      explanation: "25% of £80 is £20, so the sale price is £80 − £20 = £60.",
      source: "seed"
    },
    {
      id: "ma-004", subject: "maths", topic: "word-problem", board: "GL",
      region: ["kent"], difficulty: 3,
      stem: "A train leaves at 14:35 and arrives at 16:20. How long is the journey?",
      passage: null, image: null,
      choices: ["1 h 35 min", "1 h 45 min", "1 h 55 min", "2 h 05 min"],
      answer: 1,
      explanation: "From 14:35 to 16:35 is 2 hours; 16:20 is 15 min before that, so 2 h − 15 min = 1 h 45 min.",
      source: "seed"
    },
    {
      id: "ma-005", subject: "maths", topic: "sequences", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "What number comes next? 3, 6, 12, 24, ___",
      passage: null, image: null,
      choices: ["30", "36", "48", "60"],
      answer: 2,
      explanation: "Each term doubles: 24 × 2 = 48.",
      source: "seed"
    },
    {
      id: "ma-006", subject: "maths", topic: "geometry", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "A rectangle is 8 cm long and 5 cm wide. What is its area?",
      passage: null, image: null,
      choices: ["13 cm²", "26 cm²", "40 cm²", "45 cm²"],
      answer: 2,
      explanation: "Area = length × width = 8 × 5 = 40 cm².",
      source: "seed"
    },

    // ---------------------------------------------------------- VERBAL REASONING
    {
      id: "vr-001", subject: "verbal", topic: "analogy", board: "GL",
      region: ["kent", "bexley"], difficulty: 2,
      stem: "Bird is to Sky as Fish is to ___.",
      passage: null, image: null,
      choices: ["Scales", "Water", "Fin", "Boat"],
      answer: 1,
      explanation: "A bird moves through the sky; a fish moves through water.",
      source: "seed"
    },
    {
      id: "vr-002", subject: "verbal", topic: "odd-one-out", board: "GL",
      region: ["kent", "bexley"], difficulty: 1,
      stem: "Which word is the odd one out?",
      passage: null, image: null,
      choices: ["rose", "tulip", "oak", "daisy"],
      answer: 2,
      explanation: "Rose, tulip and daisy are flowers; an oak is a tree.",
      source: "seed"
    },
    {
      id: "vr-003", subject: "verbal", topic: "letter-sequence", board: "GL",
      region: ["kent"], difficulty: 2,
      stem: "What comes next in the sequence? CE, DF, EG, FH, ___",
      passage: null, image: null,
      choices: ["GI", "GH", "FI", "HI"],
      answer: 0,
      explanation: "Each letter moves forward by one: F→G and H→I, giving ‘GI’.",
      source: "seed"
    },
    {
      id: "vr-004", subject: "verbal", topic: "hidden-word", board: "Quest",
      region: ["bexley"], difficulty: 3,
      stem: "A four-letter word is hidden across two neighbouring words. Find it in: ‘Is this ending soon?’",
      passage: null, image: null,
      choices: ["send", "hise", "ndin", "isen"],
      answer: 0,
      explanation: "‘this ending’ → ‘thi[s end]ing’ — the ‘s’ ending ‘this’ plus ‘end’ starting ‘ending’ spell ‘send’, hidden across the word boundary.",
      source: "seed"
    },
    {
      id: "vr-005", subject: "verbal", topic: "code", board: "GL",
      region: ["kent", "bexley"], difficulty: 3,
      stem: "If CAT is coded as DBU, what is the code for DOG?",
      passage: null, image: null,
      choices: ["EPH", "EPF", "CPH", "EOH"],
      answer: 0,
      explanation: "Each letter moves one forward: D→E, O→P, G→H, giving ‘EPH’.",
      source: "seed"
    },

    // -------------------------------------------------- NON-VERBAL (STUBBED)
    // Placeholder images until real visual items are authored. The `image`
    // field points at an SVG placeholder; choices are still real so the flow
    // and scoring work end-to-end.
    {
      id: "nv-001", subject: "nonverbal", topic: "odd-one-out", board: "GL",
      region: ["kent", "bexley"], difficulty: 1,
      stem: "Which shape is the odd one out? (placeholder image)",
      passage: null, image: "img/nvr-placeholder.svg",
      choices: ["A", "B", "C", "D"],
      answer: 2,
      explanation: "Placeholder item. Real non-verbal artwork will replace this image.",
      source: "seed"
    },
    {
      id: "nv-002", subject: "nonverbal", topic: "series", board: "Quest",
      region: ["bexley"], difficulty: 2,
      stem: "Which figure completes the series? (placeholder image)",
      passage: null, image: "img/nvr-placeholder.svg",
      choices: ["A", "B", "C", "D"],
      answer: 1,
      explanation: "Placeholder item. Real non-verbal artwork will replace this image.",
      source: "seed"
    }
  ];

  if (typeof window !== "undefined") window.QUESTIONS = QUESTIONS;
  if (typeof module !== "undefined" && module.exports) module.exports = QUESTIONS;
})();
