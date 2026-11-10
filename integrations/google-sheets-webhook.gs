/**
 * Restricted Google Sheet Private Lead Store (Alternative to full CRM)
 * 1. Create a private Google Sheet with headers in Row 1:
 *    name | phone | email | address | roof_type | service | message | created_at | status
 * 2. Open Extensions -> Apps Script, paste this code, and click Deploy -> New deployment -> Web app.
 * 3. Set "Execute as: Me" and "Who has access: Anyone" (only your script can write to your private Sheet).
 * 4. Paste the Web App URL into CLIENT_CONFIG.googleSheetWebhookUrl or the Storage Config modal.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.name || '',
    data.phone || '',
    data.email || '',
    data.address || '',
    data.roof_type || '',
    data.service || '',
    data.message || '',
    data.created_at || new Date().toISOString(),
    data.status || 'New'
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
