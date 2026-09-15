import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.replace(/[^a-zA-Z0-9]/g, ""),
    },
  });

  /**
   * Sends an email using the configured SMTP server.
   */
  static async sendMail(options: SendMailOptions) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not configured. Email will not be sent.");
      return;
    }

    const fromName = process.env.SMTP_FROM_NAME || "CommandDesk";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log("Email sent successfully: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }
}
