import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "tz_admin";
const CUSTOMER_COOKIE = "tz_customer";
const CART_COOKIE = "tz_cart";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (32+ chars)");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-32chars");
  }
  return new TextEncoder().encode(s);
}

export type AdminSession = { sub: string; email: string; name: string; role: string };

export async function createAdminSession(user: AdminSession, maxAgeSec = 60 * 60 * 8) {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .setAudience("admin")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: "admin" });
    if (!payload.sub) return null;
    return { sub: payload.sub, email: String(payload.email), name: String(payload.name), role: String(payload.role) };
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireAdmin(roles?: string[]): Promise<AdminSession> {
  const s = await getAdminSession();
  if (!s) throw new Error("UNAUTHORIZED");
  if (roles && !roles.includes(s.role)) throw new Error("FORBIDDEN");
  return s;
}

/* ---------------- Customer token (Shopify customer access token) ---------------- */
export async function setCustomerToken(token: string, expiresAt: string) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}
export async function getCustomerToken() {
  const jar = await cookies();
  return jar.get(CUSTOMER_COOKIE)?.value ?? null;
}
export async function clearCustomerToken() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

/* ---------------- Cart id ---------------- */
export async function getCartId() {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value ?? null;
}
export async function setCartId(id: string) {
  const jar = await cookies();
  jar.set(CART_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function clearCartId() {
  const jar = await cookies();
  jar.delete(CART_COOKIE);
}

export const ADMIN_COOKIE_NAME = COOKIE;
