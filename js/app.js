// ===== DOM References =====

const loginScreen = document.getElementById("login-screen");
const introScreen = document.getElementById("intro-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username-input");
const introContinueBtn = document.getElementById("intro-continue-btn");
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

function hideAllScreens() {
  loginScreen.classList.add("hidden");
  introScreen.classList.add("hidden");
  dashboardScreen.classList.add("hidden");
}

function updateUserDisplays() {
  const username = localStorage.getItem(LS_USERNAME);
  document.querySelectorAll(".display-username").forEach(el => {
    el.textContent = username;
  });
}

function showLogin() {
  hideAllScreens();
  loginScreen.classList.remove("hidden");
  usernameInput.value = "";
  usernameInput.focus();
}

function showIntro() {
  updateUserDisplays();
  hideAllScreens();
  introScreen.classList.remove("hidden");
}

function showDashboard() {
  updateUserDisplays();
  hideAllScreens();
  dashboardScreen.classList.remove("hidden");
  renderPuzzles();
}

// ===== Login / Logout =====

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = usernameInput.value.trim();
  if (!name) return;
  localStorage.setItem(LS_USERNAME, name);
  showIntro();
});

introContinueBtn.addEventListener("click", () => {
  showDashboard();
});

document.querySelectorAll(".logout-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    localStorage.removeItem(LS_USERNAME);
    showLogin();
  });
});

// ===== Puzzle Rendering =====

function getSubmissions(puzzleId) {
  const raw = localStorage.getItem(LS_SUBMISSION_PREFIX + puzzleId);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // Migrate old single-object format to array
    if (!Array.isArray(parsed)) return [parsed];
    return parsed;
  } catch {
    return [];
  }
}

function saveSubmission(puzzleId, answer, correct) {
  const submissions = getSubmissions(puzzleId);
  submissions.push({ answer, correct });
  localStorage.setItem(
    LS_SUBMISSION_PREFIX + puzzleId,
    JSON.stringify(submissions)
  );
}

function isSolved(submissions) {
  return submissions.some(s => s.correct);
}

function getWrongAttempts(submissions) {
  return submissions.filter(s => !s.correct);
}

function renderPuzzles() {
  puzzleList.innerHTML = "";

  PUZZLES.forEach((puzzle) => {
    const submissions = getSubmissions(puzzle.id);
    const solved = isSolved(submissions);
    const wrong = getWrongAttempts(submissions);

    const card = document.createElement("article");
    card.className = "puzzle-card";
    if (solved) {
      card.classList.add("correct");
    } else if (wrong.length > 0) {
      card.classList.add("wrong");
    }

    // Header
    const header = document.createElement("div");
    header.className = "puzzle-header";

    const title = document.createElement("h2");
    title.className = "puzzle-title";
    title.textContent = puzzle.title;
    header.appendChild(title);

    if (solved) {
      const badge = document.createElement("span");
      badge.className = "badge badge-correct";
      badge.textContent = "Vyřešeno";
      header.appendChild(badge);
    } else if (wrong.length > 0) {
      const badge = document.createElement("span");
      badge.className = "badge badge-wrong";
      badge.textContent = "Nevyřešeno";
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

    // Wrong attempts list
    if (wrong.length > 0) {
      const attemptsDiv = document.createElement("div");
      attemptsDiv.className = "puzzle-attempts";
      const attemptsLabel = document.createElement("span");
      attemptsLabel.className = "attempts-label";
      attemptsLabel.textContent = "Špatné pokusy: ";
      attemptsDiv.appendChild(attemptsLabel);
      const attemptsList = wrong.map(s => s.answer).join(", ");
      attemptsDiv.appendChild(document.createTextNode(attemptsList));
      card.appendChild(attemptsDiv);
    }

    // Correct answer display
    if (solved) {
      const correctAnswer = submissions.find(s => s.correct);
      const answerDisplay = document.createElement("p");
      answerDisplay.className = "puzzle-answer-display puzzle-answer-correct";
      answerDisplay.textContent = "Správná odpověď: " + correctAnswer.answer;
      card.appendChild(answerDisplay);
    }

    // Form (only if not solved yet)
    if (!solved) {
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
    showIntro();
  } else {
    showLogin();
  }
})();
