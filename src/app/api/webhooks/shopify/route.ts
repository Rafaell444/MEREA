import { NextResponse } from "next/server";
import crypto from "crypto";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Shopify webhook receiver. Register in Shopify admin → Settings → Notifications → Webhooks (or via the app) for:
 *   products/create, products/update, products/delete, collections/create, collections/update, collections/delete, inventory_levels/update
 * pointing at https://<site>/api/webhooks/shopify. Set SHOPIFY_WEBHOOK_SECRET to the signing secret shown by Shopify.
 * Verifies the HMAC, then purges the relevant cache tags so the storefront reflects changes immediately.
 */
export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "SHOPIFY_WEBHOOK_SECRET is not set" }, { status: 503 });
  const raw = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("base64");
  if (hmac.length !== digest.length || !crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const topic = req.headers.get("x-shopify-topic") ?? "";
  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(raw); } catch { /* ignore */ }

  const handle = typeof payload.handle === "string" ? payload.handle : null;
  if (topic.startsWith("products/")) {
    if (handle) revalidateTag(`product:${handle}`);
    const tags = typeof payload.tags === "string" ? payload.tags.split(",").map((t) => t.trim()) : [];
    const model = tags.find((t) => t.startsWith("model:"))?.slice(6);
    if (model) revalidateTag(`model:${model}`);
    // product membership may affect any collection
    revalidateTag("cms");
  } else if (topic.startsWith("collections/")) {
    if (handle) revalidateTag(`collection:${handle}`);
    revalidateTag("cms");
  } else if (topic.startsWith("inventory_levels/")) {
    revalidateTag("cms");
  }
  await db.auditLog.create({ data: { action: `webhook:${topic}`, entity: "shopify", entityId: handle ?? undefined } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
