// 11+ mock test app — view router + timed test runner + results.
// Vanilla JS, no build step. Depends on window.QUESTIONS, window.Engine, window.Store.
(function () {
  const app = document.getElementById("app");
  const { buildTest, scoreAttempt, REGIONS, SUBJECT_LABELS } = window.Engine;
  const Q_BY_ID = Object.fromEntries(window.QUESTIONS.map((q) => [q.id, q]));

  // Live test session state (null when not in a test).
  let session = null; // { test, answers, index, endsAt, timerId }

  // ---------------------------------------------------------------- utilities
  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function clearTimer() {
    if (session && session.timerId) { clearInterval(session.timerId); session.timerId = null; }
  }

  // ------------------------------------------------------------------- views
  // First-run welcome: ask the child's name once, cache it, then go Home.
  // No password / no account — just a name to personalise progress tracking.
  function renderWelcome() {
    clearTimer(); session = null;
    app.innerHTML = `
      <section class="view welcome">
        <div class="logo-big">11<span class="plus">+</span></div>
        <h1>Welcome!</h1>
        <p class="lead">What's your first name? We'll use it to track your progress on this device.</p>
        <input id="nameInput" class="name-input" type="text" autocomplete="given-name"
               maxlength="24" placeholder="Type your name" />
        <button class="primary-btn" id="saveName">Let's go</button>
        <p class="hint">No password needed — your name stays on this device only.</p>
      </section>`;
    const input = app.querySelector("#nameInput");
    input.focus();
    const save = () => {
      const name = input.value.trim();
      if (!name) { input.focus(); return; }
      window.Store.updateProfile({ name });
      renderHome();
    };
    app.querySelector("#saveName").addEventListener("click", save);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") save(); });
  }

  function renderHome() {
    clearTimer(); session = null;
    const profile = window.Store.getProfile();
    // No cached name yet → first run, ask for it.
    if (!profile.name) { renderWelcome(); return; }
    const regionCards = Object.entries(REGIONS).map(([key, cfg]) => `
      <button class="region-card" data-region="${key}">
        <span class="region-name">${esc(cfg.label)}</span>
        <span class="region-board">${esc(cfg.board)} style</span>
        <span class="region-sub">${cfg.subjects.map((s) => SUBJECT_LABELS[s]).join(" · ")}</span>
      </button>`).join("");

    app.innerHTML = `
      <section class="view">
        <p class="greeting">Hi, ${esc(profile.name)} 👋 <button class="link-btn inline" id="changeName">not you?</button></p>
        <h1>Choose your area</h1>
        <p class="lead">Pick the region your 11+ follows. We'll build a timed mock in that board's style.</p>
        <div class="region-grid">${regionCards}</div>
        ${profile.region ? `<p class="hint">Last practised: <strong>${esc(REGIONS[profile.region].label)}</strong></p>` : ""}
        <div class="home-links">
          <button class="link-btn" id="progressBtn">📈 My progress</button>
          <button class="link-btn" id="historyBtn">View past attempts →</button>
        </div>
      </section>`;

    app.querySelectorAll(".region-card").forEach((btn) =>
      btn.addEventListener("click", () => renderSetup(btn.dataset.region)));
    app.querySelector("#historyBtn").addEventListener("click", renderHistory);
    app.querySelector("#progressBtn").addEventListener("click", renderProgress);
    app.querySelector("#changeName").addEventListener("click", renderWelcome);
  }

  function renderSetup(region) {
    const cfg = REGIONS[region];
    window.Store.updateProfile({ region });
    const subjectToggles = cfg.subjects.map((s) => {
      const count = window.QUESTIONS.filter((q) =>
        q.subject === s && q.region.includes(region)).length;
      return `<label class="subj-toggle">
        <input type="checkbox" value="${s}" checked />
        <span>${SUBJECT_LABELS[s]}</span>
        <span class="count">${count} q</span>
      </label>`;
    }).join("");

    app.innerHTML = `
      <section class="view">
        <button class="link-btn back" id="back">← Back</button>
        <h1>${esc(cfg.label)} mock test</h1>
        <p class="lead">${esc(cfg.board)} style. Choose subjects and time, then start.</p>
        <div class="setup-block">
          <h2>Subjects</h2>
          ${subjectToggles}
        </div>
        <div class="setup-block">
          <h2>Time limit</h2>
          <select id="duration">
            <option value="600">10 minutes</option>
            <option value="1200">20 minutes</option>
            <option value="1800" selected>30 minutes</option>
            <option value="2700">45 minutes</option>
          </select>
        </div>
        <button class="primary-btn" id="startBtn">Start test</button>
      </section>`;

    app.querySelector("#back").addEventListener("click", renderHome);
    app.querySelector("#startBtn").addEventListener("click", () => {
      const subjects = [...app.querySelectorAll(".subj-toggle input:checked")].map((i) => i.value);
      if (!subjects.length) { alert("Pick at least one subject."); return; }
      const durationSec = parseInt(app.querySelector("#duration").value, 10);
      const test = buildTest({ region, subjects, durationSec });
      if (!test.questionIds.length) { alert("No questions available for that selection yet."); return; }
      startTest(test);
    });
  }

  function startTest(test) {
    session = {
      test,
      answers: {},
      index: 0,
      endsAt: Date.now() + test.durationSec * 1000,
      timerId: null
    };
    session.timerId = setInterval(tick, 1000);
    renderQuestion();
  }

  function tick() {
    const remaining = Math.round((session.endsAt - Date.now()) / 1000);
    const el = document.getElementById("timer");
    if (el) {
      el.textContent = fmtTime(Math.max(0, remaining));
      el.classList.toggle("low", remaining <= 60);
    }
    if (remaining <= 0) finishTest();
  }

  function renderQuestion() {
    const { test, index } = session;
    const id = test.questionIds[index];
    const q = Q_BY_ID[id];
    const remaining = Math.max(0, Math.round((session.endsAt - Date.now()) / 1000));
    const chosen = session.answers[id];

    app.innerHTML = `
      <section class="view test-view">
        <div class="test-bar">
          <span class="progress">Q ${index + 1} / ${test.questionIds.length}</span>
          <span class="subject-pill">${SUBJECT_LABELS[q.subject]}</span>
          <span class="timer ${remaining <= 60 ? "low" : ""}" id="timer">${fmtTime(remaining)}</span>
        </div>
        ${q.passage ? `<div class="passage">${esc(q.passage)}</div>` : ""}
        ${q.image ? `<img class="q-image" src="${esc(q.image)}" alt="question figure" />` : ""}
        <h2 class="stem">${esc(q.stem)}</h2>
        <div class="choices">
          ${q.choices.map((c, i) => `
            <button class="choice ${chosen === i ? "selected" : ""}" data-i="${i}">
              <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
              <span>${esc(c)}</span>
            </button>`).join("")}
        </div>
        <div class="test-nav">
          <button class="nav-btn" id="prevBtn" ${index === 0 ? "disabled" : ""}>← Prev</button>
          ${index === test.questionIds.length - 1
            ? `<button class="primary-btn" id="finishBtn">Finish</button>`
            : `<button class="nav-btn" id="nextBtn">Next →</button>`}
        </div>
      </section>`;

    app.querySelectorAll(".choice").forEach((btn) =>
      btn.addEventListener("click", () => {
        session.answers[id] = parseInt(btn.dataset.i, 10);
        app.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      }));

    const prev = app.querySelector("#prevBtn");
    if (prev) prev.addEventListener("click", () => { session.index--; renderQuestion(); });
    const next = app.querySelector("#nextBtn");
    if (next) next.addEventListener("click", () => { session.index++; renderQuestion(); });
    const finish = app.querySelector("#finishBtn");
    if (finish) finish.addEventListener("click", () => {
      const answered = Object.keys(session.answers).length;
      const total = test.questionIds.length;
      if (answered < total &&
          !confirm(`You've answered ${answered} of ${total}. Finish anyway?`)) return;
      finishTest();
    });
  }

  async function finishTest() {
    clearTimer();
    const { test, answers } = session;
    const score = scoreAttempt(test, answers);
    const attempt = {
      id: "attempt-" + test.region + "-" + (session.endsAt),
      testId: test.id,
      student: (window.Store.getProfile().name) || null,
      region: test.region,
      board: test.board,
      subjects: test.subjects,
      questionIds: test.questionIds,   // stored so the detail view rebuilds exactly, incl. unanswered
      startedAt: session.endsAt - test.durationSec * 1000,
      finishedAt: Date.now(),
      answers,
      score
    };
    await window.Store.addAttempt(attempt);
    renderResults(test, attempt);
  }

  // -------------------------------------------------- shared dashboard helpers
  // Resolve the question-id list for an attempt. Newer attempts store
  // questionIds; fall back to the answer keys for older ones.
  function attemptQuestionIds(attempt) {
    if (attempt.questionIds && attempt.questionIds.length) return attempt.questionIds;
    return Object.keys(attempt.answers || {});
  }

  // SVG donut showing the overall percentage. Pure inline SVG — no libraries.
  function scoreDonut(pct) {
    const r = 54, c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const band = pct >= 80 ? "great" : pct >= 50 ? "ok" : "low";
    return `
      <svg class="donut ${band}" viewBox="0 0 140 140" width="150" height="150" role="img"
           aria-label="${pct} percent">
        <circle class="donut-track" cx="70" cy="70" r="${r}" />
        <circle class="donut-fill" cx="70" cy="70" r="${r}"
                stroke-dasharray="${dash} ${c}" transform="rotate(-90 70 70)" />
        <text class="donut-pct" x="70" y="66" text-anchor="middle">${pct}%</text>
        <text class="donut-frac" x="70" y="88" text-anchor="middle">__FRAC__</text>
      </svg>`;
  }

  // Render the graphical dashboard (donut + subject bars) for an attempt.
  function dashboardHTML(attempt) {
    const qIds = attemptQuestionIds(attempt);
    const score = attempt.score;
    const pct = Math.round((score.correct / score.total) * 100);

    const totals = {};
    qIds.forEach((id) => {
      const s = Q_BY_ID[id].subject;
      totals[s] = (totals[s] || 0) + 1;
    });
    const bars = Object.keys(totals).map((s) => {
      const got = score.bySubject[s] || 0;
      const tot = totals[s];
      const p = Math.round((got / tot) * 100);
      const band = p >= 80 ? "great" : p >= 50 ? "ok" : "low";
      return `
        <div class="bar-row">
          <span class="bar-label">${SUBJECT_LABELS[s]}</span>
          <div class="bar-track"><div class="bar-fill ${band}" style="width:${p}%"></div></div>
          <span class="bar-val">${got}/${tot}</span>
        </div>`;
    }).join("");

    const donut = scoreDonut(pct).replace("__FRAC__", `${score.correct} / ${score.total}`);
    return `
      <div class="dashboard">
        <div class="dash-donut">${donut}</div>
        <div class="dash-bars">${bars}</div>
      </div>`;
  }

  // Render the per-question review (explanations) for an attempt.
  function reviewHTML(attempt) {
    const qIds = attemptQuestionIds(attempt);
    return qIds.map((id, n) => {
      const q = Q_BY_ID[id];
      if (!q) return "";
      const chosen = attempt.answers[id];
      const right = chosen === q.answer;
      return `
        <div class="review-item ${right ? "right" : "wrong"}">
          <div class="review-head">
            <span class="review-num">${n + 1}</span>
            <span class="review-stem">${esc(q.stem)}</span>
            <span class="review-mark">${right ? "✓" : "✗"}</span>
          </div>
          <div class="review-body">
            <p><strong>Your answer:</strong> ${chosen == null ? "<em>not answered</em>" : esc(q.choices[chosen])}</p>
            ${right ? "" : `<p><strong>Correct:</strong> ${esc(q.choices[q.answer])}</p>`}
            <p class="explain">${esc(q.explanation)}</p>
          </div>
        </div>`;
    }).join("");
  }

  function renderResults(test, attempt) {
    session = null;
    app.innerHTML = `
      <section class="view">
        <h1>Results</h1>
        ${dashboardHTML(attempt)}
        <h2>Review</h2>
        <div class="review-list">${reviewHTML(attempt)}</div>
        <div class="test-nav">
          <button class="nav-btn" id="againBtn">Try again</button>
          <button class="primary-btn" id="homeBtn">Home</button>
        </div>
      </section>`;
    app.querySelector("#againBtn").addEventListener("click", () => renderSetup(test.region));
    app.querySelector("#homeBtn").addEventListener("click", renderHome);
  }

  // Detailed view of a single past attempt: dashboard at top, explanations below.
  function renderAttemptDetail(attempt) {
    session = null;
    const date = new Date(attempt.finishedAt);
    const regionLabel = REGIONS[attempt.region] ? REGIONS[attempt.region].label : attempt.region;
    app.innerHTML = `
      <section class="view">
        <button class="link-btn back" id="back">← Past attempts</button>
        <h1>${esc(regionLabel)} mock</h1>
        <p class="lead">${esc(attempt.board || "")} style · ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        ${dashboardHTML(attempt)}
        <h2>Question review</h2>
        <div class="review-list">${reviewHTML(attempt)}</div>
        <div class="test-nav">
          <button class="primary-btn" id="againBtn">Practise this region again</button>
        </div>
      </section>`;
    app.querySelector("#back").addEventListener("click", renderHistory);
    app.querySelector("#againBtn").addEventListener("click", () => renderSetup(attempt.region));
  }

  // SVG line chart of overall % across attempts, oldest → newest.
  function trendChart(points) {
    if (points.length < 2) return "";
    const W = 320, H = 140, pad = 24;
    const n = points.length;
    const x = (i) => pad + (i * (W - 2 * pad)) / (n - 1);
    const y = (p) => H - pad - (p / 100) * (H - 2 * pad);
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
    const dots = points.map((p, i) =>
      `<circle cx="${x(i).toFixed(1)}" cy="${y(p).toFixed(1)}" r="4" />`).join("");
    const grid = [0, 50, 100].map((g) =>
      `<line x1="${pad}" y1="${y(g)}" x2="${W - pad}" y2="${y(g)}" class="grid" />
       <text x="2" y="${y(g) + 4}" class="axis">${g}</text>`).join("");
    return `
      <svg class="trend" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Score trend">
        ${grid}
        <path d="${line}" class="trend-line" fill="none" />
        ${dots}
      </svg>`;
  }

  async function renderProgress() {
    session = null;
    const profile = window.Store.getProfile();
    const all = await window.Store.getAttempts();
    // All progress math lives in the (tested) engine; this view just renders it.
    const p = window.Engine.summariseProgress(all, profile.name);

    if (!p.count) {
      app.innerHTML = `
        <section class="view">
          <button class="link-btn back" id="back">← Back</button>
          <h1>My progress</h1>
          <p class="lead">No tests yet, ${esc(profile.name)}. Take a mock and your progress will appear here.</p>
        </section>`;
      app.querySelector("#back").addEventListener("click", renderHome);
      return;
    }

    const subjBars = p.subjects.map((row) => {
      const band = row.pct >= 80 ? "great" : row.pct >= 50 ? "ok" : "low";
      return `<div class="bar-row">
        <span class="bar-label">${SUBJECT_LABELS[row.subject]}</span>
        <div class="bar-track"><div class="bar-fill ${band}" style="width:${row.pct}%"></div></div>
        <span class="bar-val">${row.pct}%</span>
      </div>`;
    }).join("");

    const deltaStr = p.delta === 0 ? "no change yet"
      : (p.delta > 0 ? `▲ up ${p.delta}%` : `▼ down ${-p.delta}%`) + " since your first test";

    app.innerHTML = `
      <section class="view">
        <button class="link-btn back" id="back">← Back</button>
        <h1>${esc(profile.name)}'s progress</h1>
        <p class="lead">${p.count} test${p.count > 1 ? "s" : ""} taken · <span class="${p.delta >= 0 ? "up" : "down"}">${deltaStr}</span></p>

        <div class="stat-row">
          <div class="stat"><span class="stat-num">${p.latest}%</span><span class="stat-lbl">Latest</span></div>
          <div class="stat"><span class="stat-num">${p.avg}%</span><span class="stat-lbl">Average</span></div>
          <div class="stat"><span class="stat-num">${p.best}%</span><span class="stat-lbl">Best</span></div>
        </div>

        ${p.count >= 2 ? `<h2>Scores over time</h2>${trendChart(p.pcts)}`
          : `<p class="hint">Take one more test to see your trend line.</p>`}

        <h2>By subject (all tests)</h2>
        <div class="dash-bars">${subjBars}</div>
        ${p.weakest ? `<p class="hint">💡 Focus area: <strong>${SUBJECT_LABELS[p.weakest]}</strong> is your lowest average — try a ${SUBJECT_LABELS[p.weakest]}-only practice.</p>` : ""}
      </section>`;
    app.querySelector("#back").addEventListener("click", renderHome);
  }

  async function renderHistory() {
    const attempts = await window.Store.getAttempts();
    const rows = attempts.length ? attempts.map((a, i) => {
      const pct = Math.round((a.score.correct / a.score.total) * 100);
      const date = new Date(a.finishedAt);
      const band = pct >= 80 ? "great" : pct >= 50 ? "ok" : "low";
      return `<li><button class="history-row" data-i="${i}">
        <span class="history-region">${esc(REGIONS[a.region] ? REGIONS[a.region].label : a.region)}</span>
        <span class="history-score ${band}">${a.score.correct}/${a.score.total} · ${pct}%</span>
        <span class="muted">${date.toLocaleDateString()}</span>
        <span class="history-chev">›</span>
      </button></li>`;
    }).join("") : `<li class="muted">No attempts yet.</li>`;

    app.innerHTML = `
      <section class="view">
        <button class="link-btn back" id="back">← Back</button>
        <h1>Past attempts</h1>
        <p class="lead">Tap any test to see its dashboard and question explanations.</p>
        <ul class="history-list">${rows}</ul>
        ${attempts.length ? `<button class="link-btn" id="clearBtn">Clear history</button>` : ""}
      </section>`;
    app.querySelector("#back").addEventListener("click", renderHome);
    app.querySelectorAll(".history-row").forEach((btn) =>
      btn.addEventListener("click", () => renderAttemptDetail(attempts[parseInt(btn.dataset.i, 10)])));
    const clr = app.querySelector("#clearBtn");
    if (clr) clr.addEventListener("click", async () => {
      if (confirm("Clear all past attempts?")) { await window.Store.clearAttempts(); renderHistory(); }
    });
  }

  // Warn before losing an in-progress test on accidental close/refresh.
  window.addEventListener("beforeunload", (e) => {
    if (session) { e.preventDefault(); e.returnValue = ""; }
  });

  renderHome();
})();
