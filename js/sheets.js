// Google Sheets integration.
// Replace the URL below with your Google Apps Script web app deployment URL.
// See apps-script/Code.gs for the server-side code.

const SHEETS_ENDPOINT = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID_HERE/exec";

async function submitToSheets(username, puzzleId, answer, isCorrect) {
  const payload = {
    username: username,
    puzzleId: puzzleId,
    answer: answer,
    isCorrect: isCorrect,
    timestamp: new Date().toISOString()
  };

  // Google Apps Script doesn't handle CORS preflight well.
  // Using mode: "no-cors" with text/plain avoids the preflight OPTIONS request.
  // The tradeoff: we can't read the response body (opaque response).
  await fetch(SHEETS_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  });
}
