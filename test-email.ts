import { EmailService } from "./frontend/src/lib/email/email-service";
import { getWelcomeEmailTemplate } from "./frontend/src/lib/email/templates";

async function testMail() {
  try {
    console.log("Attempting to send test email...");
    const info = await EmailService.sendMail({
      to: process.env.SMTP_USER as string,
      subject: "Welcome to CommandDesk! 🚀 (Premium Design Test)",
      html: getWelcomeEmailTemplate("Rajdeep", "Principal Software Engineer")
    });
    console.log("TEST SUCCESSFUL! Message ID:", info?.messageId);
  } catch (error) {
    console.error("TEST FAILED:", error);
  }
}

testMail();
