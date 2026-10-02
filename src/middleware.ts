import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "tz_admin";

function secret() {
  const s = process.env.AUTH_SECRET;
  return new TextEncoder().encode(s && s.length >= 32 ? s : "dev-only-insecure-secret-change-me-please-32chars");
}

async function hasValidAdminSession(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret(), { audience: "admin" });
    return true;
  } catch {
    return false;
  }
}

/** Same-origin check for state-changing requests (CSRF defence in depth on top of SameSite cookies). */
function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser or same-origin form posts without Origin
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF: block cross-origin mutations to our API / server actions
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS" && !sameOrigin(req)) {
    return new NextResponse(JSON.stringify({ error: "Cross-origin request blocked" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  // Admin area protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!(await hasValidAdminSession(req))) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
    if (!(await hasValidAdminSession(req))) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|uploads|robots.txt|sitemap.xml).*)"],
};
