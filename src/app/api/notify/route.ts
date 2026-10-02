import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const schema = z.object({
  email: z.string().email().max(120),
  productHandle: z.string().min(1).max(200),
  variantId: z.string().min(1).max(200),
  size: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`notify:${clientIp(req)}`, 10, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Попробуй позже" }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    await db.notifyRequest.create({ data: { ...body, email: body.email.toLowerCase() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь введенные данные" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось сохранить запрос" }, { status: 500 });
  }
}
