import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { ensureCart, fail, guard, ok } from "@/lib/cart-server";

export const dynamic = "force-dynamic";
const schema = z.object({ lineIds: z.array(z.string().min(1).max(200)).min(1).max(50) });

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    const cart = await ensureCart();
    const catalog = await getCatalog();
    return ok(await catalog.removeCartLines(cart.id, body.lineIds));
  } catch (e) {
    return fail(e);
  }
}
