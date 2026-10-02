import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { adminGraphql, ADMIN_ORDER_NOTE_UPDATE } from "@/lib/shopify/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !["owner", "admin"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id, note } = z.object({ id: z.string().startsWith("gid://shopify/Order/"), note: z.string().max(5000) }).parse(await req.json());
    const data = await adminGraphql<{ orderUpdate: { userErrors: { message: string }[] } }>(ADMIN_ORDER_NOTE_UPDATE, { input: { id, note } });
    if (data.orderUpdate.userErrors.length) return NextResponse.json({ error: data.orderUpdate.userErrors[0].message }, { status: 400 });
    await db.auditLog.create({ data: { userId: session.sub, action: "order-note", entity: "shopify-order", entityId: id } }).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
