import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { ensureCart, fail, guard, ok, updateInput } from "@/lib/cart-server";

export const dynamic = "force-dynamic";
const schema = z.object({ lines: z.array(updateInput).min(1).max(50) });

export async function POST(req: Request) {
  const g = await guard(req);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    const cart = await ensureCart();
    const catalog = await getCatalog();
    const toRemove = body.lines.filter((l) => l.quantity === 0).map((l) => l.id);
    const toUpdate = body.lines.filter((l) => l.quantity > 0);
    let result = cart;
    if (toUpdate.length) result = await catalog.updateCartLines(cart.id, toUpdate);
    if (toRemove.length) result = await catalog.removeCartLines(cart.id, toRemove);
    return ok(result);
  } catch (e) {
    return fail(e);
  }
}
