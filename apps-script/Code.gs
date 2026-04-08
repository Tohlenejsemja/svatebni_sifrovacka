// Google Apps Script — paste this into your Apps Script editor.
//
// Setup:
// 1. Create a Google Sheet with headers in row 1:
//    Jméno | Šifra | Odpověď | Správně | Čas_klient | Čas_server
// 2. Open Extensions > Apps Script
// 3. Paste this code and save
// 4. Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Copy the deployment URL into js/sheets.js

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.username,
      data.puzzleId,
      data.answer,
      data.isCorrect ? "ANO" : "NE",
      data.timestamp,
      new Date()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
