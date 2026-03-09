/* ════════════════════════════════════
   SCOOTER ROAD SAFETY — app.js
   Vanilla JS, no framework
════════════════════════════════════ */

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  he: {
    appTitle: "בטיחות בדרכים",
    appSubtitle: "קורקינט חשמלי",
    homeTagline: "למד את חוקי הדרך לפני שאתה יוצא לרחוב",
    statTests: "בחינות", statBest: "שיא", statLast: "אחרון",
    btnTrain: "מצב אימון", btnTrainSub: "עיון חופשי בשאלות",
    btnTest:  "מצב בחינה", btnTestSub: "20 שאלות, 30 שניות כל אחת",
    progressTitle: "התקדמות באימון",
    trainTitle: "מצב אימון",
    catAll: "כל הקטגוריות",
    prevBtn: "הקודם", nextBtn: "הבא",
    testTitle: "בחינה",
    questionOf: (n, t) => `שאלה ${n} מתוך ${t}`,
    resultsTitle: "תוצאות הבחינה",
    pass: "עבר ✓", fail: "נכשל ✗",
    scoreSummary: (c, t) => `ענית נכון על ${c} מתוך ${t} שאלות`,
    wrongTitle: "שאלות שטעית",
    correctAnswer: "תשובה נכונה:",
    btnRetry: "נסה שוב",
    btnToTrain: "חזור לאימון",
    modalText: "לצאת מהבחינה? הניקוד לא יישמר.",
    modalContinue: "המשך בחינה",
    modalQuit: "יציאה",
    progressLbl: (done, total) => `${done}/${total}`,
    answered: "ענית על",
    langLabel: "FR",
    timedOut: "הזמן נגמר",
    catLabels: {
      scooter_laws:   "חוקי קורקינט חשמלי",
      traffic_code:   "קוד תעבורה כללי",
      road_awareness: "מודעות דרך וסכנות",
      herzliya_urban: "עירוני והרצליה"
    }
  },
  fr: {
    appTitle: "Sécurité routière",
    appSubtitle: "Trottinette électrique",
    homeTagline: "Apprends le code de la route avant de prendre la rue",
    statTests: "Tests", statBest: "Meilleur", statLast: "Dernier",
    btnTrain: "Mode entraînement", btnTrainSub: "Parcourir toutes les questions",
    btnTest:  "Mode examen", btnTestSub: "20 questions, 30 sec par question",
    progressTitle: "Progression",
    trainTitle: "Entraînement",
    catAll: "Toutes les catégories",
    prevBtn: "Précédent", nextBtn: "Suivant",
    testTitle: "Examen",
    questionOf: (n, t) => `Question ${n} sur ${t}`,
    resultsTitle: "Résultats",
    pass: "Reçu ✓", fail: "Échoué ✗",
    scoreSummary: (c, t) => `${c} bonnes réponses sur ${t}`,
    wrongTitle: "Questions ratées",
    correctAnswer: "Bonne réponse :",
    btnRetry: "Réessayer",
    btnToTrain: "Retour à l'entraînement",
    modalText: "Quitter l'examen ? Le score ne sera pas enregistré.",
    modalContinue: "Continuer",
    modalQuit: "Quitter",
    progressLbl: (done, total) => `${done}/${total}`,
    answered: "Répondu",
    langLabel: "עברית",
    timedOut: "Temps écoulé",
    catLabels: {
      scooter_laws:   "Lois trottinette",
      traffic_code:   "Code de la route",
      road_awareness: "Conscience routière",
      herzliya_urban: "Urbain – Herzliya"
    }
  }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const LETTERS_HE = ["א", "ב", "ג", "ד"];
const LETTERS_FR = ["A", "B", "C", "D"];
const TEST_COUNT  = 20;
const TIMER_SECS  = 30;
const PASS_PCT    = 80;
const CIRCUMFERENCE_TIMER  = 2 * Math.PI * 18; // 113.1
const CIRCUMFERENCE_SCORE  = 2 * Math.PI * 50; // 314.16

// ─── STATE ────────────────────────────────────────────────────────────────────
let lang        = "he";
let trainCat    = "all";
let trainList   = [];
let trainIdx    = 0;
let trainAnswered = {}; // { questionId: correct (bool) }

let testList    = [];
let testIdx     = 0;
let testResults = []; // { question, chosen, correct: bool }
let timerInterval = null;
let timerLeft   = TIMER_SECS;

// ─── DOM REFS ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screens = {
  home:    $("screen-home"),
  train:   $("screen-train"),
  test:    $("screen-test"),
  results: $("screen-results"),
};

// ─── STORAGE ───────────────────────────────────────────────────────────────────
function loadStorage() {
  try {
    return JSON.parse(localStorage.getItem("scooterSafety") || "{}");
  } catch { return {}; }
}
function saveStorage(data) {
  localStorage.setItem("scooterSafety", JSON.stringify(data));
}
function getStats() {
  const d = loadStorage();
  return {
    tests:    d.tests    || 0,
    best:     d.best     !== undefined ? d.best : null,
    last:     d.last     !== undefined ? d.last : null,
    answered: d.answered || {}   // { qId: true/false }
  };
}
function saveTestResult(score) {
  const d = loadStorage();
  d.tests = (d.tests || 0) + 1;
  d.last  = score;
  d.best  = d.best !== undefined ? Math.max(d.best, score) : score;
  saveStorage(d);
}
function saveTrainAnswer(qId, correct) {
  const d = loadStorage();
  if (!d.answered) d.answered = {};
  // only upgrade to correct, never downgrade
  if (!d.answered[qId] || correct) d.answered[qId] = correct;
  saveStorage(d);
}
function getAnswered() {
  return loadStorage().answered || {};
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

// ─── LANGUAGE ─────────────────────────────────────────────────────────────────
function t(key, ...args) {
  const val = T[lang][key];
  return typeof val === "function" ? val(...args) : (val ?? key);
}
function getLetters() {
  return lang === "he" ? LETTERS_HE : LETTERS_FR;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang === "he" ? "rtl" : "ltr";

  // Header
  $("app-title").textContent    = t("appTitle");
  $("app-subtitle").textContent = t("appSubtitle");
  $("lang-label").textContent   = t("langLabel");

  // Home
  $("home-tagline").textContent     = t("homeTagline");
  $("stat-tests-label").textContent = t("statTests");
  $("stat-best-label").textContent  = t("statBest");
  $("stat-last-label").textContent  = t("statLast");
  $("btn-train-text").textContent   = t("btnTrain");
  $("btn-train-sub").textContent    = t("btnTrainSub");
  $("btn-test-text").textContent    = t("btnTest");
  $("btn-test-sub").textContent     = t("btnTestSub");
  $("progress-title").textContent   = t("progressTitle");

  // Train
  $("train-title").textContent      = t("trainTitle");
  $("train-prev-text").textContent  = t("prevBtn");
  $("train-next-text").textContent  = t("nextBtn");

  // Results
  $("results-title").textContent    = t("resultsTitle");
  $("btn-retry-text").textContent   = t("btnRetry");
  $("btn-to-train-text").textContent= t("btnToTrain");
  $("wrong-title").textContent      = t("wrongTitle");

  // Modal
  $("modal-text").textContent       = t("modalText");
  $("modal-cancel").textContent     = t("modalContinue");
  $("modal-confirm").textContent    = t("modalQuit");

  refreshCatSelector();
  renderCategoryProgress();
  updateHomeStats();
}

// ─── HOME ──────────────────────────────────────────────────────────────────────
function updateHomeStats() {
  const s = getStats();
  $("stat-tests").textContent = s.tests;
  $("stat-best").textContent  = s.best !== null  ? s.best + "%" : "—";
  $("stat-last").textContent  = s.last !== null  ? s.last + "%" : "—";
}

function renderCategoryProgress() {
  const answered = getAnswered();
  const listEl = $("cat-progress-list");
  listEl.innerHTML = "";

  Object.keys(CATEGORIES).forEach(catKey => {
    const qs   = QUESTIONS.filter(q => q.category === catKey);
    const done = qs.filter(q => answered[q.id] === true).length;
    const pct  = Math.round(done / qs.length * 100);

    const row = document.createElement("div");
    row.className = "cat-row";
    row.innerHTML = `
      <div class="cat-row-header">
        <span class="cat-name">${t("catLabels")[catKey]}</span>
        <span class="cat-pct">${pct}%</span>
      </div>
      <div class="cat-bar">
        <div class="cat-bar-fill" style="width:${pct}%"></div>
      </div>`;
    listEl.appendChild(row);
  });
}

// ─── TRAINING ─────────────────────────────────────────────────────────────────
function refreshCatSelector() {
  const sel = $("cat-selector");
  const prev = sel.value;
  sel.innerHTML = `<option value="all">${t("catAll")}</option>`;
  Object.keys(CATEGORIES).forEach(k => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = t("catLabels")[k];
    sel.appendChild(opt);
  });
  sel.value = prev || "all";
}

function buildTrainList(cat) {
  trainCat  = cat;
  trainList = cat === "all"
    ? [...QUESTIONS]
    : QUESTIONS.filter(q => q.category === cat);
  trainIdx  = 0;
}

function startTraining(cat) {
  buildTrainList(cat || trainCat || "all");
  $("cat-selector").value = trainCat;
  renderTrainQuestion();
  showScreen("train");
}

function renderTrainQuestion() {
  const q = trainList[trainIdx];
  if (!q) return;

  const answered = getAnswered();
  const letters  = getLetters();

  $("train-q-number").textContent = t("catLabels")[q.category];

  $("train-q-text").textContent = q.question;
  $("train-q-text").className   = "question-text fade-in";

  // Progress
  const total  = trainList.length;
  const done   = trainList.filter(x => answered[x.id] === true).length;
  const pct    = Math.round(done / total * 100);
  $("train-progress-fill").style.width = pct + "%";
  $("train-progress-label").textContent = t("progressLbl", done, total);
  $("train-nav-counter").textContent = `${trainIdx + 1} / ${total}`;

  // Answers
  const answersEl = $("train-answers");
  answersEl.innerHTML = "";
  q.answers.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.dataset.idx = i;
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span>${text}`;
    btn.addEventListener("click", () => handleTrainAnswer(i));
    answersEl.appendChild(btn);
  });

  // Hide explanation
  $("train-explanation").hidden = true;

  // Nav buttons
  $("train-prev").disabled = trainIdx === 0;
}

function handleTrainAnswer(chosen) {
  const q    = trainList[trainIdx];
  const btns = $("train-answers").querySelectorAll(".answer-btn");

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) {
      btn.classList.add(chosen === q.correct ? "correct" : "reveal-correct");
    }
    if (i === chosen && chosen !== q.correct) {
      btn.classList.add("wrong");
    }
  });

  const isCorrect = chosen === q.correct;
  saveTrainAnswer(q.id, isCorrect);

  // Show explanation
  const expBox  = $("train-explanation");
  const expText = $("train-explanation-text");
  expText.textContent = q.explanation;
  expBox.hidden = false;

  // Auto-advance after 1.5s if correct
  if (isCorrect && trainIdx < trainList.length - 1) {
    setTimeout(() => advanceTrain(1), 1500);
  }
}

function advanceTrain(dir) {
  trainIdx = Math.max(0, Math.min(trainList.length - 1, trainIdx + dir));
  renderTrainQuestion();
  renderCategoryProgress();
}

// ─── TEST ──────────────────────────────────────────────────────────────────────
function buildTestList() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - .5);
  testList = shuffled.slice(0, TEST_COUNT);
  testIdx  = 0;
  testResults = [];
}

function startTest() {
  buildTestList();
  renderTestQuestion();
  showScreen("test");
}

function renderTestQuestion() {
  if (testIdx >= testList.length) {
    endTest();
    return;
  }
  const q       = testList[testIdx];
  const letters = getLetters();

  $("test-q-counter").textContent = t("questionOf", testIdx + 1, testList.length);
  $("test-q-text").textContent    = q.question;
  $("test-q-text").className      = "question-text fade-in";

  const answersEl = $("test-answers");
  answersEl.innerHTML = "";
  q.answers.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.dataset.idx = i;
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span>${text}`;
    btn.addEventListener("click", () => handleTestAnswer(i));
    answersEl.appendChild(btn);
  });

  startTimer();
}

function handleTestAnswer(chosen) {
  clearTimer();
  const q = testList[testIdx];
  const isCorrect = chosen === q.correct;
  testResults.push({ question: q, chosen, correct: isCorrect });

  // Brief flash feedback (green/red on chosen only)
  const btns = $("test-answers").querySelectorAll(".answer-btn");
  btns.forEach(b => b.disabled = true);
  btns[chosen].classList.add(isCorrect ? "correct" : "wrong");

  setTimeout(() => {
    testIdx++;
    renderTestQuestion();
  }, 500);
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function startTimer() {
  clearTimer();
  timerLeft = TIMER_SECS;
  updateTimerDisplay(TIMER_SECS);

  timerInterval = setInterval(() => {
    timerLeft--;
    updateTimerDisplay(timerLeft);

    if (timerLeft <= 0) {
      clearTimer();
      // mark as wrong (no answer)
      const q = testList[testIdx];
      testResults.push({ question: q, chosen: -1, correct: false });
      testIdx++;
      renderTestQuestion();
    }
  }, 1000);
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay(secs) {
  const ring  = $("timer-ring");
  const text  = $("timer-text");
  const ratio = secs / TIMER_SECS;
  const offset = CIRCUMFERENCE_TIMER * (1 - ratio);

  ring.style.strokeDashoffset = offset;
  text.textContent = secs;

  if (secs > 15)       ring.style.stroke = "#27ae60";
  else if (secs > 8)   ring.style.stroke = "#e8a000";
  else                 ring.style.stroke = "#c0392b";
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
function endTest() {
  clearTimer();
  const correct = testResults.filter(r => r.correct).length;
  const pct     = Math.round(correct / TEST_COUNT * 100);
  const pass    = pct >= PASS_PCT;

  saveTestResult(pct);
  updateHomeStats();
  renderCategoryProgress();

  $("score-percent").textContent  = pct + "%";
  $("score-verdict").textContent  = pass ? t("pass") : t("fail");
  $("score-verdict").className    = "score-verdict " + (pass ? "pass" : "fail");
  $("score-summary").textContent  = t("scoreSummary", correct, TEST_COUNT);

  // Animate ring
  const fillRing = $("score-fill-ring");
  fillRing.style.stroke = pass ? "#1e8a4c" : "#c0392b";
  requestAnimationFrame(() => {
    fillRing.style.strokeDashoffset = CIRCUMFERENCE_SCORE * (1 - pct / 100);
  });

  // Wrong answers list
  const wrong = testResults.filter(r => !r.correct);
  const sect  = $("wrong-answers-section");
  const list  = $("wrong-list");
  const letters = getLetters();

  if (wrong.length === 0) {
    sect.hidden = true;
  } else {
    sect.hidden = false;
    list.innerHTML = "";
    wrong.forEach(r => {
      const item = document.createElement("div");
      item.className = "wrong-item";
      const correctText = r.question.answers[r.question.correct];
      item.innerHTML = `
        <p class="q-text">${r.question.question}</p>
        <p class="correct-answer">${t("correctAnswer")} ${letters[r.question.correct]}. ${correctText}</p>
        <p class="explanation">${r.question.explanation}</p>`;
      list.appendChild(item);
    });
  }

  showScreen("results");
}

// ─── QUIT MODAL ───────────────────────────────────────────────────────────────
function showQuitModal() {
  $("quit-modal").hidden = false;
}
function hideQuitModal() {
  $("quit-modal").hidden = true;
}

// ─── EVENT WIRING ─────────────────────────────────────────────────────────────
function initEvents() {
  // Lang toggle
  $("lang-btn").addEventListener("click", () => {
    lang = lang === "he" ? "fr" : "he";
    applyLang();
  });

  // Home → Train
  $("btn-train").addEventListener("click", () => startTraining("all"));

  // Home → Test
  $("btn-test").addEventListener("click", startTest);

  // Train: back to home
  $("train-back").addEventListener("click", () => {
    showScreen("home");
    updateHomeStats();
    renderCategoryProgress();
  });

  // Train: category selector
  $("cat-selector").addEventListener("change", e => {
    startTraining(e.target.value);
  });

  // Train: navigation
  $("train-prev").addEventListener("click", () => advanceTrain(-1));
  $("train-next").addEventListener("click", () => advanceTrain(1));

  // Test: quit button
  $("test-quit").addEventListener("click", showQuitModal);

  // Modal buttons
  $("modal-cancel").addEventListener("click",  hideQuitModal);
  $("modal-confirm").addEventListener("click", () => {
    hideQuitModal();
    clearTimer();
    showScreen("home");
    updateHomeStats();
  });

  // Results: retry
  $("btn-retry").addEventListener("click", startTest);

  // Results: to training
  $("btn-to-train").addEventListener("click", () => {
    startTraining("all");
  });
}

// ─── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  initEvents();
  applyLang();
  updateHomeStats();
  renderCategoryProgress();
  startTraining("all"); // pre-build list
  showScreen("home");   // but show home first
}

document.addEventListener("DOMContentLoaded", init);

// ─── SERVICE WORKER REGISTRATION ──────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
