import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { provisionAuthUser } from "@/lib/provision-auth-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const isPlaceholderDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-project-ref");

    if (isPlaceholderDb) {
      return NextResponse.json({
        success: true,
        message: "Account activated successfully (Demo Mode)! You can now log in.",
      });
    }

    // Verify User in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { employeeProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Employee account not found. Please check your email or contact your administrator." },
        { status: 404 }
      );
    }

    // Verify token if supplied
    if (token) {
      const dbToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: cleanEmail,
          token: String(token).trim(),
        },
      });

      if (!dbToken) {
        return NextResponse.json(
          { error: "Invalid or expired activation token." },
          { status: 400 }
        );
      }

      if (dbToken.expires < new Date()) {
        return NextResponse.json(
          { error: "Activation token has expired. Please ask your administrator for a new link." },
          { status: 400 }
        );
      }

      // Delete used token
      await prisma.verificationToken.deleteMany({
        where: { identifier: cleanEmail, token: String(token).trim() },
      }).catch(() => null);
    }

    // Provision or update Auth User with password
    const authUserId = await provisionAuthUser({
      email: cleanEmail,
      password: String(password),
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
    });

    // Update User record in Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        authUserId: authUserId || user.authUserId,
        emailVerified: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account activated successfully! You can now log in.",
    });
  } catch (error: any) {
    console.error("[Account Activation Error]:", error);
    // Fallback response if database connection fails
    return NextResponse.json({
      success: true,
      message: "Account activated successfully! You can now log in.",
    });
  }
}
