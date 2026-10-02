import { ensureCart, fail, guard, ok } from "@/lib/cart-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = guard(req, 120);
  if (g) return g;
  try {
    return ok(await ensureCart());
  } catch (e) {
    return fail(e, 500);
  }
}
