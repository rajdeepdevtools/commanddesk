import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/lib/email/email-service";
import { getForgotPasswordTemplate } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Check if the user exists
    // 2. Generate a secure, time-limited token
    // 3. Save the token to the database
    // 4. Construct the reset URL with the token

    const isPlaceholderDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-project-ref");

    if (!isPlaceholderDb) {
      try {
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (user) {
          const resetLink = `https://commanddesk.com/reset-password?token=mock_secure_token_${Date.now()}`;
          await EmailService.sendMail({
            to: user.email,
            subject: "CommandDesk Password Reset Request 🔒",
            html: getForgotPasswordTemplate(resetLink)
          }).catch(() => null);
        }
      } catch {
        // Fallback for demo / unconfigured mode
      }
    }

    // We always return success to prevent email enumeration attacks
    return NextResponse.json({ message: "If an account exists, a password reset email has been sent." }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "If an account exists, a password reset email has been sent." }, { status: 200 });
  }
}
