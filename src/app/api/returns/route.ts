import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const schema = z.object({
  email: z.string().email().max(120),
  orderNumber: z.string().trim().min(1).max(40),
  items: z.array(z.object({ title: z.string().max(200), quantity: z.number().int().min(1).max(20), reason: z.string().max(80) })).min(1).max(30),
  reason: z.string().max(80).optional(),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`returns:${clientIp(req)}`, 5, 30 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Попробуй позже" }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    const r = await db.returnRequest.create({ data: { email: body.email.toLowerCase(), orderNumber: body.orderNumber, items: JSON.stringify(body.items), reason: body.reason, comment: body.comment } });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь заполнение формы" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось создать заявку" }, { status: 500 });
  }
}
