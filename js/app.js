// ===== DOM References =====

const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const displayUsername = document.getElementById("display-username");
const logoutBtn = document.getElementById("logout-btn");
const puzzleList = document.getElementById("puzzle-list");
const toastEl = document.getElementById("toast");

// ===== LocalStorage Keys =====

const LS_USERNAME = "sifrovacka_username";
const LS_SUBMISSION_PREFIX = "sifrovacka_submitted_";

// ===== Toast =====

let toastTimeout = null;

function showToast(message, type = "info") {
  clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type} visible`;
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("visible");
  }, 3000);
}

// ===== Screen Switching =====

function showLogin() {
  loginScreen.classList.remove("hidden");
  dashboardScreen.classList.add("hidden");
  usernameInput.value = "";
  usernameInput.focus();
}

function showDashboard() {
  const username = localStorage.getItem(LS_USERNAME);
  displayUsername.textContent = username;
  loginScreen.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  renderPuzzles();
}

// ===== Login / Logout =====

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = usernameInput.value.trim();
  if (!name) return;
  localStorage.setItem(LS_USERNAME, name);
  showDashboard();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(LS_USERNAME);
  showLogin();
});

// ===== Puzzle Rendering =====

function getSubmission(puzzleId) {
  const raw = localStorage.getItem(LS_SUBMISSION_PREFIX + puzzleId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSubmission(puzzleId, answer, correct) {
  localStorage.setItem(
    LS_SUBMISSION_PREFIX + puzzleId,
    JSON.stringify({ answer, correct })
  );
}

function renderPuzzles() {
  puzzleList.innerHTML = "";

  PUZZLES.forEach((puzzle) => {
    const submission = getSubmission(puzzle.id);
    const card = document.createElement("article");
    card.className = "puzzle-card";
    if (submission) {
      card.classList.add(submission.correct ? "correct" : "wrong");
    }

    // Header
    const header = document.createElement("div");
    header.className = "puzzle-header";

    const title = document.createElement("h2");
    title.className = "puzzle-title";
    title.textContent = puzzle.title;
    header.appendChild(title);

    if (submission) {
      const badge = document.createElement("span");
      badge.className = `badge ${submission.correct ? "badge-correct" : "badge-wrong"}`;
      badge.textContent = submission.correct ? "Správně" : "Špatně";
      header.appendChild(badge);
    }

    card.appendChild(header);

    // Description
    const desc = document.createElement("p");
    desc.className = "puzzle-desc";
    desc.textContent = puzzle.description;
    card.appendChild(desc);

    // Files
    if (puzzle.files && puzzle.files.length > 0) {
      const filesDiv = document.createElement("div");
      filesDiv.className = "puzzle-files";
      puzzle.files.forEach((file) => {
        const link = document.createElement("a");
        link.className = "file-link";
        link.href = file.path;
        link.download = "";
        link.textContent = file.name;
        filesDiv.appendChild(link);
      });
      card.appendChild(filesDiv);
    }

    // Hint
    if (puzzle.hint) {
      const hint = document.createElement("p");
      hint.className = "puzzle-hint";
      hint.textContent = "Nápověda: " + puzzle.hint;
      card.appendChild(hint);
    }

    // Form (or submitted answer display)
    if (submission && submission.correct) {
      const answerDisplay = document.createElement("p");
      answerDisplay.className = "puzzle-answer-display";
      answerDisplay.textContent = "Vaše odpověď: " + submission.answer;
      card.appendChild(answerDisplay);
    } else {
      const form = document.createElement("form");
      form.className = "puzzle-form";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Zadejte heslo...";
      input.autocomplete = "off";
      input.required = true;

      const btn = document.createElement("button");
      btn.type = "submit";
      btn.className = "btn btn-submit";
      btn.textContent = "Odeslat";

      form.appendChild(input);
      form.appendChild(btn);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const answer = input.value.trim();
        if (!answer) return;

        btn.disabled = true;
        btn.textContent = "Odesílám...";

        try {
          const correct = await checkAnswer(answer, puzzle.answerHash);
          const username = localStorage.getItem(LS_USERNAME);

          saveSubmission(puzzle.id, answer, correct);

          // Send to Google Sheets (fire and forget)
          submitToSheets(username, puzzle.id, answer, correct).catch(() => {});

          if (correct) {
            showToast("Správná odpověď!", "success");
          } else {
            showToast("Špatná odpověď, zkuste to znovu.", "error");
          }

          // Re-render to update UI
          renderPuzzles();
        } catch (err) {
          showToast("Chyba při ověřování. Zkuste to znovu.", "error");
          btn.disabled = false;
          btn.textContent = "Odeslat";
        }
      });

      card.appendChild(form);
    }

    puzzleList.appendChild(card);
  });
}

// ===== Init =====

(function init() {
  const username = localStorage.getItem(LS_USERNAME);
  if (username) {
    showDashboard();
  } else {
    showLogin();
  }
})();
