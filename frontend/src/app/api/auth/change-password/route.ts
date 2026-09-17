import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password-utils";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const demoEmail = cookieStore.get("commanddesk_demo_email")?.value;

    const body = await request.json().catch(() => ({}));
    const newPassword = body?.newPassword ? String(body.newPassword) : "";
    const email = (body?.email ? String(body.email).trim().toLowerCase() : "") || demoEmail?.toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Active user email session not found" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Permanent password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found" },
        { status: 404 }
      );
    }

    const newPasswordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Permanent password set successfully! Redirecting to workspace...",
    });
  } catch (err: any) {
    console.error("[Change Password Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to set permanent password" },
      { status: 500 }
    );
  }
}
