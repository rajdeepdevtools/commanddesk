import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/verify-email" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/webhooks");

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Bypass session check for health routes and static assets
  if (pathname.startsWith("/api/health") || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return supabaseResponse;
  }

  const isDemoSession = request.cookies.get("commanddesk_demo_session")?.value === "true";
  if (isDemoSession) {
    if (pathname === "/login") {
      const nextParam = request.nextUrl.searchParams.get("next");
      const targetPath =
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") &&
        !nextParam.startsWith("/login") &&
        !nextParam.includes("manifest.json")
          ? nextParam
          : "/";
      return NextResponse.redirect(new URL(targetPath, request.nextUrl.origin));
    }
    return supabaseResponse;
  }

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // If there are no Supabase auth cookies, redirect to login for protected pages immediately
  // without wasting a network roundtrip to Supabase Auth API
  if (!hasAuthCookie) {
    if (!isPublicRoute && !pathname.startsWith("/api/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Clear dead/bloated auth cookies to prevent HTTP 431 header overflow
      allCookies.forEach((c) => {
        if (c.name.startsWith("sb-") || c.name.includes("auth-token")) {
          supabaseResponse.cookies.delete(c.name);
        }
      });
    }

    if (!user && !isPublicRoute && !pathname.startsWith("/api/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }

    if (user && pathname === "/login") {
      const nextParam = request.nextUrl.searchParams.get("next");
      const targetPath =
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") &&
        !nextParam.startsWith("/login") &&
        !nextParam.includes("manifest.json")
          ? nextParam
          : "/";
      const destinationUrl = new URL(targetPath, request.nextUrl.origin);
      const redirectResponse = NextResponse.redirect(destinationUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  } catch (err) {
    console.warn("[Middleware] Auth session check error:", err);
  }

  return supabaseResponse;
}
