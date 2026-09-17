import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email ? String(body.email).trim().toLowerCase() : "";
    const password = body?.password ? String(body.password) : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    // Look up user in database
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          passwordHash: true,
          mustChangePassword: true,
          companyId: true,
        },
      });
    } catch (dbErr) {
      console.warn("[Auth Login DB Search Warning]", dbErr);
    }

    if (user) {
      // Verify password if passwordHash is stored
      if (user.passwordHash) {
        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: "Invalid password. Please enter the correct password." },
            { status: 401 }
          );
        }
      }

      const response = NextResponse.json({
        success: true,
        mustChangePassword: !!user.mustChangePassword,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
        },
      });

      // Set session cookies matching the authenticated user
      response.cookies.set("commanddesk_demo_session", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("commanddesk_demo_email", user.email, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("sb-access-token", `token-${user.id}`, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // Fallback for demo admin email if DB record doesn't exist yet
    if (email === "rajdeepdevtools@gmail.com") {
      const response = NextResponse.json({
        success: true,
        mustChangePassword: false,
        user: {
          id: "master-super-admin-id",
          email: "rajdeepdevtools@gmail.com",
          name: "Master Super Owner Admin",
          role: "SUPER_ADMIN",
        },
      });

      response.cookies.set("commanddesk_demo_session", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("commanddesk_demo_email", "rajdeepdevtools@gmail.com", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      response.cookies.set("sb-access-token", "demo-token-master-super-admin", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "No active account found for this email address." },
      { status: 404 }
    );
  } catch (err) {
    console.error("[Login API Error]", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
