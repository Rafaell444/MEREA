import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

const schema = z.object({
  productHandle: z.string().min(1).max(200),
  author: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(5).max(2000),
});

export async function POST(req: Request) {
  const rl = rateLimit(`review:${clientIp(req)}`, 3, 30 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Попробуй позже" }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    await db.review.create({ data: { ...body, approved: false } });
    return NextResponse.json({ ok: true, message: "Спасибо! Отзыв появится после модерации." });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь заполнение формы" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось сохранить отзыв" }, { status: 500 });
  }
}
