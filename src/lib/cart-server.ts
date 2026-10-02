import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import type { Cart } from "@/lib/catalog/types";
import { getCartId, setCartId, clearCartId } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const lineInput = z.object({ merchandiseId: z.string().min(1).max(200), quantity: z.number().int().min(1).max(50) });
export const updateInput = z.object({ id: z.string().min(1).max(200), quantity: z.number().int().min(0).max(50) });

export async function loadCart(): Promise<Cart | null> {
  const id = await getCartId();
  if (!id) return null;
  const catalog = await getCatalog();
  const cart = await catalog.getCart(id).catch(() => null);
  if (!cart) await clearCartId();
  return cart;
}

export async function ensureCart(): Promise<Cart> {
  const existing = await loadCart();
  if (existing) return existing;
  const catalog = await getCatalog();
  const cart = await catalog.createCart([]);
  await setCartId(cart.id);
  return cart;
}

export function guard(req: Request, limit = 60) {
  const rl = rateLimit(`cart:${clientIp(req)}`, limit, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  return null;
}

export function ok(cart: Cart) {
  return NextResponse.json({ cart }, { headers: { "Cache-Control": "no-store" } });
}

export function fail(e: unknown, status = 400) {
  const msg = e instanceof Error ? e.message : "Ошибка";
  return NextResponse.json({ error: msg }, { status });
}
