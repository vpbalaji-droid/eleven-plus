// Core test logic — stack-independent, shared by the browser app and tests.
// Exposes window.Engine in the browser, module.exports under Node.
(function () {
  // Load questions in whichever environment we're in.
  const QUESTIONS = (typeof module !== "undefined" && module.exports)
    ? require("./questions.js")
    : (typeof window !== "undefined" ? window.QUESTIONS : []);

  const REGIONS = {
    kent:   { label: "Kent",   board: "GL",
              subjects: ["english", "maths", "verbal", "nonverbal"] },
    bexley: { label: "Bexley", board: "Quest",
              subjects: ["english", "maths", "verbal", "nonverbal"] }
  };

  const SUBJECT_LABELS = {
    english: "English", maths: "Maths",
    verbal: "Verbal Reasoning", nonverbal: "Non-Verbal Reasoning"
  };

  // Build a test paper for a region. Options: { region, subjects?, limit?, durationSec? }
  // Deterministic order (by id) so the same options reproduce the same paper;
  // shuffling is a UI concern layered on top if wanted.
  function buildTest(opts) {
    const region = opts.region;
    const cfg = REGIONS[region];
    if (!cfg) throw new Error("Unknown region: " + region);
    const subjects = opts.subjects || cfg.subjects;

    let pool = QUESTIONS.filter((q) =>
      q.region.includes(region) && subjects.includes(q.subject));
    pool.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    if (opts.limit) pool = pool.slice(0, opts.limit);

    return {
      id: "test-" + region + "-" + subjects.join("+"),
      region,
      board: cfg.board,
      subjects,
      durationSec: opts.durationSec || 2700,
      questionIds: pool.map((q) => q.id)
    };
  }

  // Score an attempt. answers = { questionId: chosenIndex }. Missing = wrong.
  function scoreAttempt(test, answers) {
    let correct = 0;
    const bySubject = {};
    const wrong = [];
    test.questionIds.forEach((id) => {
      const q = QUESTIONS.find((x) => x.id === id);
      if (!q) return;
      bySubject[q.subject] = bySubject[q.subject] || 0;
      const chosen = answers[id];
      if (chosen === q.answer) {
        correct++;
        bySubject[q.subject]++;
      } else {
        wrong.push({ id, chosen: chosen == null ? null : chosen, answer: q.answer });
      }
    });
    return { correct, total: test.questionIds.length, bySubject, wrong };
  }

  // Map id -> question, for subject lookups when aggregating progress.
  const Q_BY_ID = {};
  QUESTIONS.forEach((q) => { Q_BY_ID[q.id] = q; });

  // Question ids an attempt covered. Prefer the stored list (so unanswered
  // questions still count); fall back to the answer keys for old attempts.
  function attemptQuestionIds(attempt) {
    if (attempt.questionIds && attempt.questionIds.length) return attempt.questionIds;
    return Object.keys(attempt.answers || {});
  }

  // Pure progress summary for one child across their attempts.
  // Stack-independent: app renders it, tests assert on it.
  // Returns { count, pcts[], avg, best, latest, first, delta, subjects[], weakest }.
  function summariseProgress(attempts, name) {
    const mine = (attempts || [])
      .filter((a) => !a.student || a.student === name)
      .slice()
      .sort((a, b) => a.finishedAt - b.finishedAt);

    if (!mine.length) return { count: 0, pcts: [], subjects: [], weakest: null };

    const pcts = mine.map((a) => Math.round((a.score.correct / a.score.total) * 100));
    const avg = Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length);
    const best = Math.max(...pcts);
    const latest = pcts[pcts.length - 1];
    const first = pcts[0];

    // Per-subject correct/total across all of this child's attempts.
    const subjAgg = {};
    mine.forEach((a) => {
      const totals = {};
      attemptQuestionIds(a).forEach((id) => {
        const q = Q_BY_ID[id];
        if (!q) return;
        totals[q.subject] = (totals[q.subject] || 0) + 1;
      });
      Object.keys(totals).forEach((s) => {
        subjAgg[s] = subjAgg[s] || { got: 0, tot: 0 };
        subjAgg[s].got += (a.score.bySubject && a.score.bySubject[s]) || 0;
        subjAgg[s].tot += totals[s];
      });
    });

    const subjects = Object.keys(subjAgg).map((s) => ({
      subject: s,
      got: subjAgg[s].got,
      tot: subjAgg[s].tot,
      pct: Math.round((subjAgg[s].got / subjAgg[s].tot) * 100)
    }));
    // Weakest = lowest average ratio; a useful "focus here" nudge.
    const weakest = subjects.length
      ? subjects.slice().sort((a, b) => (a.got / a.tot) - (b.got / b.tot))[0].subject
      : null;

    return { count: mine.length, pcts, avg, best, latest, first,
             delta: latest - first, subjects, weakest };
  }

  const api = { buildTest, scoreAttempt, summariseProgress, attemptQuestionIds,
                REGIONS, SUBJECT_LABELS };
  if (typeof window !== "undefined") window.Engine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
