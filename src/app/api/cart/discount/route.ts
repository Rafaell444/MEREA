import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { ensureCart, fail, guard, ok } from "@/lib/cart-server";

export const dynamic = "force-dynamic";
const schema = z.object({ codes: z.array(z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9_-]+$/)).max(3) });

export async function POST(req: Request) {
  const g = guard(req, 20);
  if (g) return g;
  try {
    const body = schema.parse(await req.json());
    const cart = await ensureCart();
    const catalog = await getCatalog();
    return ok(await catalog.applyDiscount(cart.id, body.codes));
  } catch (e) {
    return fail(e);
  }
}
