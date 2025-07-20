function doPost(e) {
  try {
    Logger.log("Event object: " + JSON.stringify(e));
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid or missing POST data");
    }

    Logger.log("PostData contents: " + e.postData.contents);
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const timestamp = new Date();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    // Save to Google Sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Newsletter");
    if (!sheet) {
      sheet = ss.insertSheet("Newsletter");
      sheet.appendRow(["Timestamp", "Email"]);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Email"]);
    }
    sheet.appendRow([timestamp, email]);

    // Send confirmation email to subscriber (HTML)
    const subjectUser = "Thank you for subscribing to Yetenbi Ethiopia Tours!";
    const htmlBodyUser = `
      <div style="font-family:Arial,sans-serif; color:#222;">
        <h2>Thank you for subscribing!</h2>
        <p>Hello,</p>
        <p>Thank you for subscribing to our newsletter! You'll receive updates about our latest tours, offers, and travel tips for Ethiopia.</p>
        <p>Best regards,<br>Yetenbi Ethiopia Tours Team</p>
      </div>
    `;
    MailApp.sendEmail({
      to: email,
      subject: subjectUser,
      htmlBody: htmlBodyUser
    });

    // Send notification email to admin/owner
    const adminEmail = "YOUR_ADMIN_EMAIL@gmail.com"; // <-- CHANGE THIS TO YOUR EMAIL
    const subjectAdmin = "New Newsletter Subscription";
    const bodyAdmin = "A new user has subscribed to the newsletter:\n\nEmail: " + email + "\nTime: " + timestamp;
    MailApp.sendEmail(adminEmail, subjectAdmin, bodyAdmin);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Thank you for subscribing!" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error: " + error.message);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message || "Failed to subscribe. Please try again." })
    ).setMimeType(ContentService.MimeType.JSON);
  }
} 