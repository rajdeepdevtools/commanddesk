import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });

    const allCookies = cookieStore.getAll();
    allCookies.forEach((c) => {
      if (
        c.name.startsWith("sb-") ||
        c.name.includes("auth") ||
        c.name.includes("demo") ||
        c.name.includes("commanddesk")
      ) {
        response.cookies.delete(c.name);
      }
    });

    // Explicitly clear known session cookies across paths
    const cookiesToClear = [
      "commanddesk_demo_session",
      "commanddesk_demo_email",
      "commanddesk_company_id",
      "sb-access-token",
      "sb-refresh-token",
    ];

    cookiesToClear.forEach((name) => {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    });

    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
