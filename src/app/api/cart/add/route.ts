import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { ensureCart, fail, guard, lineInput, ok } from "@/lib/cart-server";

export const dynamic = "force-dynamic";
const schema = z.object({ lines: z.array(lineInput).min(1).max(20) });

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    const cart = await ensureCart();
    const catalog = await getCatalog();
    return ok(await catalog.addToCart(cart.id, body.lines));
  } catch (e) {
    return fail(e);
  }
}
