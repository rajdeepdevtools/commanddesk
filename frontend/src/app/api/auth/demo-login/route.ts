import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email || "rajdeepdevtools@gmail.com";

    const response = NextResponse.json({
      success: true,
      message: `Logged in as Master Super Admin (${email})`,
    });

    // Set fallback demo auth cookies for master super admin
    response.cookies.set("commanddesk_demo_session", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("commanddesk_demo_email", email, {
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
  } catch (err) {
    console.error("[DemoLogin Error]", err);
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
