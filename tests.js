// Node test suite for the 11+ app. Run: node tests.js
// Verifies question-bank integrity + scoring logic before any UI work.
const QUESTIONS = require("./data/questions.js");
const { buildTest, scoreAttempt, summariseProgress, REGIONS } = require("./data/engine.js");

let passed = 0, failed = 0;
function ok(name, cond) {
  if (cond) { passed++; }
  else { failed++; console.log("  ✗ FAIL: " + name); }
}

// ---- Question bank integrity -------------------------------------------------
const SUBJECTS = ["english", "maths", "verbal", "nonverbal"];
const BOARDS = ["GL", "Quest"];
const VALID_REGIONS = ["kent", "bexley"];
const ids = new Set();

QUESTIONS.forEach((q) => {
  ok(`${q.id}: unique id`, !ids.has(q.id));
  ids.add(q.id);
  ok(`${q.id}: valid subject`, SUBJECTS.includes(q.subject));
  ok(`${q.id}: valid board`, BOARDS.includes(q.board));
  ok(`${q.id}: region non-empty + valid`,
     Array.isArray(q.region) && q.region.length > 0 &&
     q.region.every((r) => VALID_REGIONS.includes(r)));
  ok(`${q.id}: difficulty 1-3`, q.difficulty >= 1 && q.difficulty <= 3);
  ok(`${q.id}: 4-5 choices`, q.choices.length >= 4 && q.choices.length <= 5);
  ok(`${q.id}: answer index in range`,
     Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length);
  ok(`${q.id}: has stem`, typeof q.stem === "string" && q.stem.length > 0);
  ok(`${q.id}: has explanation`, typeof q.explanation === "string" && q.explanation.length > 0);
  ok(`${q.id}: nonverbal has image`, q.subject !== "nonverbal" || !!q.image);
  ok(`${q.id}: no duplicate choices`, new Set(q.choices).size === q.choices.length);
});

// Coverage: each region has at least one question per non-NVR subject.
VALID_REGIONS.forEach((region) => {
  ["english", "maths", "verbal"].forEach((subj) => {
    const n = QUESTIONS.filter((q) => q.subject === subj && q.region.includes(region)).length;
    ok(`${region}/${subj}: has >=1 seed question`, n >= 1);
  });
});

// ---- buildTest ---------------------------------------------------------------
const kent = buildTest({ region: "kent" });
ok("buildTest kent: board is GL", kent.board === "GL");
ok("buildTest kent: only kent questions", kent.questionIds.every((id) => {
  const q = QUESTIONS.find((x) => x.id === id);
  return q.region.includes("kent");
}));
ok("buildTest kent: has questions", kent.questionIds.length > 0);

const bexley = buildTest({ region: "bexley" });
ok("buildTest bexley: board is Quest", bexley.board === "Quest");
ok("buildTest bexley: only bexley questions", bexley.questionIds.every((id) => {
  const q = QUESTIONS.find((x) => x.id === id);
  return q.region.includes("bexley");
}));

// Subject filter
const kentMaths = buildTest({ region: "kent", subjects: ["maths"] });
ok("buildTest subject filter: maths only", kentMaths.questionIds.every((id) => {
  return QUESTIONS.find((x) => x.id === id).subject === "maths";
}));

// limit
const limited = buildTest({ region: "kent", limit: 3 });
ok("buildTest limit: caps count", limited.questionIds.length <= 3);

// ---- scoreAttempt ------------------------------------------------------------
// All correct
const allCorrect = {};
kent.questionIds.forEach((id) => {
  allCorrect[id] = QUESTIONS.find((q) => q.id === id).answer;
});
const perfect = scoreAttempt(kent, allCorrect);
ok("score: all correct => full marks", perfect.correct === kent.questionIds.length);
ok("score: total matches question count", perfect.total === kent.questionIds.length);

// All wrong (pick an index that isn't the answer)
const allWrong = {};
kent.questionIds.forEach((id) => {
  const q = QUESTIONS.find((x) => x.id === id);
  allWrong[id] = q.answer === 0 ? 1 : 0;
});
const zero = scoreAttempt(kent, allWrong);
ok("score: all wrong => 0 correct", zero.correct === 0);

// Unanswered counts as wrong, not crash
const partial = scoreAttempt(kent, {});
ok("score: no answers => 0 correct", partial.correct === 0);
ok("score: bySubject sums to correct", Object.values(perfect.bySubject)
   .reduce((a, b) => a + b, 0) === perfect.correct);
ok("score: wrong list captured", zero.wrong.length === kent.questionIds.length);
ok("score: perfect has empty wrong list", perfect.wrong.length === 0);

// ---- summariseProgress -------------------------------------------------------
// Deterministic synthetic attempts so the math is fully predictable.
// Each attempt covers 2 maths + 2 english questions; we vary how many are right.
// summariseProgress builds its subject lookup from the real QUESTIONS bank,
// so use real ids: 2 maths + 2 english per attempt.
const someMaths = QUESTIONS.filter((q) => q.subject === "maths").slice(0, 2).map((q) => q.id);
const someEng = QUESTIONS.filter((q) => q.subject === "english").slice(0, 2).map((q) => q.id);
function realAttempt(student, finishedAt, correct, total, bySubject) {
  return { student, finishedAt,
           questionIds: someMaths.concat(someEng),
           score: { correct, total, bySubject } };
}

// Empty / no attempts for this child.
const empty = summariseProgress([], "Ada");
ok("progress: no attempts => count 0", empty.count === 0);
ok("progress: no attempts => null weakest", empty.weakest === null);

// Two attempts, out of order in time — should sort oldest→newest.
const a1 = realAttempt("Ada", 200, 2, 4, { maths: 2, english: 0 }); // 50%, later
const a2 = realAttempt("Ada", 100, 1, 4, { maths: 0, english: 1 }); // 25%, earlier
const ada = summariseProgress([a1, a2], "Ada");
ok("progress: counts this child's attempts", ada.count === 2);
ok("progress: first is the chronologically earliest", ada.first === 25);
ok("progress: latest is the chronologically latest", ada.latest === 50);
ok("progress: pcts ordered oldest->newest", JSON.stringify(ada.pcts) === JSON.stringify([25, 50]));
ok("progress: avg of 25 and 50 => 38", ada.avg === 38);
ok("progress: best is the max", ada.best === 50);
ok("progress: delta = latest - first", ada.delta === 25);

// Per-subject aggregation: maths 2/4, english 1/4 across the two attempts.
const mathsRow = ada.subjects.find((s) => s.subject === "maths");
const engRow = ada.subjects.find((s) => s.subject === "english");
ok("progress: maths got 2 of 4", mathsRow.got === 2 && mathsRow.tot === 4 && mathsRow.pct === 50);
ok("progress: english got 1 of 4", engRow.got === 1 && engRow.tot === 4 && engRow.pct === 25);
ok("progress: weakest is english (lowest ratio)", ada.weakest === "english");

// Per-child filter: another student's attempts are excluded.
const mixed = summariseProgress([a1, a2, realAttempt("Bob", 300, 4, 4, { maths: 2, english: 2 })], "Ada");
ok("progress: filters out other students", mixed.count === 2 && mixed.best === 50);

// Legacy attempts with no student tag are attributed to the current child.
const legacy = summariseProgress([{ finishedAt: 50, questionIds: someMaths,
  score: { correct: 2, total: 2, bySubject: { maths: 2 } } }], "Ada");
ok("progress: untagged attempt counted for child", legacy.count === 1 && legacy.latest === 100);

// ---- Summary -----------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed (${QUESTIONS.length} questions in bank)`);
process.exit(failed ? 1 : 0);
