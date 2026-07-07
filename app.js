// ---------- QUESTION BANK ----------
const questionBank = {
  math: [
    { q: "What is 1/2 + 1/4?", options: ["3/4", "2/6", "1/6", "2/4"], answer: 0 },
    { q: "Which fraction is bigger: 1/3 or 1/4?", options: ["1/4", "1/3", "Equal", "Cannot say"], answer: 1 },
    { q: "What is 5 x 6?", options: ["30", "11", "35", "25"], answer: 0 },
    { q: "What is 100 - 45?", options: ["45", "55", "65", "50"], answer: 1 },
    { q: "What is 3/4 as a decimal?", options: ["0.34", "0.75", "0.43", "0.7"], answer: 1 },
  ],
  science: [
    { q: "What gas do plants absorb from air?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], answer: 1 },
    { q: "How many legs does an insect have?", options: ["4", "6", "8", "10"], answer: 1 },
    { q: "Water boils at what temperature (°C)?", options: ["50", "90", "100", "150"], answer: 2 },
    { q: "Which organ pumps blood in our body?", options: ["Lungs", "Brain", "Heart", "Kidney"], answer: 2 },
    { q: "The sun is a ___?", options: ["Planet", "Star", "Moon", "Comet"], answer: 1 },
  ],
  language: [
    { q: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receeve", "Receve"], answer: 1 },
    { q: "What is the opposite of 'Happy'?", options: ["Joyful", "Sad", "Excited", "Glad"], answer: 1 },
    { q: "Which word is a noun?", options: ["Run", "Quickly", "Table", "Blue"], answer: 2 },
    { q: "Complete: 'The cat ___ on the mat.'", options: ["sit", "sits", "sitting", "sat sat"], answer: 1 },
    { q: "Choose the plural of 'Child'", options: ["Childs", "Childes", "Children", "Childies"], answer: 2 },
  ],
};

// ---------- STORAGE HELPERS ----------
function getStudent() {
  return JSON.parse(localStorage.getItem("gyanplay_student") || "null");
}
function saveStudent(data) {
  localStorage.setItem("gyanplay_student", JSON.stringify(data));
}
function getLeaderboard() {
  return JSON.parse(localStorage.getItem("gyanplay_leaderboard") || "[]");
}
function saveLeaderboard(list) {
  localStorage.setItem("gyanplay_leaderboard", JSON.stringify(list));
}

// ---------- LOGIN PAGE ----------
function startLearning() {
  const name = document.getElementById("studentName").value.trim();
  const cls = document.getElementById("studentClass").value;
  const lang = document.getElementById("langSelect").value;

  if (!name) {
    alert("Please enter your name to continue!");
    return;
  }

  const student = { name, cls, lang, xp: 0, level: 1 };
  saveStudent(student);
  window.location.href = "dashboard.html";
}

// ---------- DASHBOARD PAGE ----------
function loadDashboard() {
  const student = getStudent();
  if (!student) { window.location.href = "index.html"; return; }

  document.getElementById("welcomeMsg").innerText = `Hi, ${student.name}! 👋`;
  document.getElementById("xpCount").innerText = student.xp;
  document.getElementById("levelNum").innerText = student.level;

  const xpForNextLevel = student.level * 50;
  const progressPercent = Math.min((student.xp % 50) / 50 * 100, 100);
  document.getElementById("progressFill").style.width = progressPercent + "%";

  renderLeaderboard(student);
}

function renderLeaderboard(currentStudent) {
  let board = getLeaderboard();

  // update or add current student's entry
  const idx = board.findIndex(s => s.name === currentStudent.name);
  if (idx >= 0) board[idx] = { name: currentStudent.name, xp: currentStudent.xp };
  else board.push({ name: currentStudent.name, xp: currentStudent.xp });

  board.sort((a, b) => b.xp - a.xp);
  saveLeaderboard(board);

  const container = document.getElementById("leaderboard");
  container.innerHTML = board.slice(0, 5).map((s, i) =>
    `<div class="leaderboard-item"><span>${i + 1}. ${s.name}</span><span>⭐ ${s.xp}</span></div>`
  ).join("");
}

function goToQuiz(subject) {
  localStorage.setItem("gyanplay_currentSubject", subject);
  localStorage.setItem("gyanplay_qIndex", "0");
  localStorage.setItem("gyanplay_score", "0");
  window.location.href = "quiz.html";
}

// ---------- QUIZ PAGE ----------
let currentQuestions = [];
let qIndex = 0;

function loadQuiz() {
  const student = getStudent();
  if (!student) { window.location.href = "index.html"; return; }

  document.getElementById("xpCount").innerText = student.xp;

  const subject = localStorage.getItem("gyanplay_currentSubject") || "math";
  currentQuestions = questionBank[subject];
  qIndex = parseInt(localStorage.getItem("gyanplay_qIndex") || "0");

  showQuestion();
}

function showQuestion() {
  if (qIndex >= currentQuestions.length) {
    finishQuiz();
    return;
  }

  const question = currentQuestions[qIndex];
  document.getElementById("quizProgress").innerText = `Question ${qIndex + 1} of ${currentQuestions.length}`;
  document.getElementById("questionText").innerText = question.q;
  document.getElementById("feedbackText").innerText = "";

  const optionsWrap = document.getElementById("optionsWrap");
  optionsWrap.innerHTML = "";
  question.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(i, btn);
    optionsWrap.appendChild(btn);
  });
}

function checkAnswer(selectedIndex, btnEl) {
  const question = currentQuestions[qIndex];
  const allButtons = document.querySelectorAll(".option-btn");
  allButtons.forEach(b => b.onclick = null); // lock further clicks

  if (selectedIndex === question.answer) {
    btnEl.classList.add("correct");
    document.getElementById("feedbackText").innerText = "✅ Correct! +10 XP";
    document.getElementById("feedbackText").style.color = "#27ae60";
    addXP(10);
  } else {
    btnEl.classList.add("wrong");
    allButtons[question.answer].classList.add("correct");
    document.getElementById("feedbackText").innerText = "❌ Not quite — check the correct answer!";
    document.getElementById("feedbackText").style.color = "#e74c3c";
  }

  setTimeout(() => {
    qIndex++;
    localStorage.setItem("gyanplay_qIndex", qIndex);
    showQuestion();
  }, 1200);
}

function addXP(amount) {
  const student = getStudent();
  student.xp += amount;
  student.level = Math.floor(student.xp / 50) + 1;
  saveStudent(student);
  document.getElementById("xpCount").innerText = student.xp;
}

function finishQuiz() {
  document.getElementById("questionText").innerText = "🎉 Quiz Complete!";
  document.getElementById("optionsWrap").innerHTML = "";
  document.getElementById("quizProgress").innerText = "";
  document.getElementById("feedbackText").innerText = "Great job! Redirecting to dashboard...";
  document.getElementById("feedbackText").style.color = "#27ae60";
  setTimeout(() => window.location.href = "dashboard.html", 1800);
}

function speakQuestion() {
  const text = document.getElementById("questionText").innerText;
  const student = getStudent();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = student && student.lang === "ta" ? "ta-IN" : "en-IN";
  speechSynthesis.speak(utterance);
}

// ---------- PAGE ROUTER ----------
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("dashboard.html")) loadDashboard();
  if (path.includes("quiz.html")) loadQuiz();
});