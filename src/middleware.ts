import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { DEFAULT_LOCALE, splitLocale } from "@/lib/i18n/config";

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
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { locale, path: pathname, prefixed } = splitLocale(req.nextUrl.pathname);

  // CSRF: block cross-origin mutations to our API / server actions
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS" && !sameOrigin(req)) {
    return new NextResponse(JSON.stringify({ error: "Cross-origin request blocked" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  // Admin area protection (admin is not localised)
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

  const isApi = pathname.startsWith("/api/");
  const isAdmin = pathname.startsWith("/admin");
  let res: NextResponse;

  if (isApi || isAdmin) {
    // API/admin: locale comes from the `lang` cookie (see getLocale); just strip a stray prefix
    if (prefixed) {
      const url = req.nextUrl.clone();
      url.pathname = pathname;
      return NextResponse.redirect(url);
    }
    res = NextResponse.next();
  } else if (prefixed && locale === DEFAULT_LOCALE) {
    // "/ka/..." → canonical unprefixed URL
    const url = req.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  } else {
    // Storefront page: expose the locale to server components and rewrite "/en/x" → "/x"
    const headers = new Headers(req.headers);
    headers.set("x-locale", locale);
    headers.set("x-path", pathname); // locale-less path, used for canonical / hreflang links
    if (prefixed) {
      const url = req.nextUrl.clone();
      url.pathname = pathname;
      res = NextResponse.rewrite(url, { request: { headers } });
    } else {
      res = NextResponse.next({ request: { headers } });
    }
    if (req.cookies.get("lang")?.value !== locale) {
      res.cookies.set("lang", locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
  }

  if (isAdmin || isApi) {
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|uploads|robots.txt|sitemap.xml).*)"],
};
