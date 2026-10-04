import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { getT } from "@/lib/i18n/server";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(30).optional(),
  topic: z.string().max(60).optional(),
  orderNo: z.string().max(40).optional(),
  message: z.string().trim().min(5).max(3000),
  website: z.string().max(0).optional(), // honeypot field, must stay empty
});

export async function POST(req: Request) {
  const { t } = await getT();
  const rl = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: t("Попробуй позже") }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    const { website: _honeypot, ...data } = body;
    void _honeypot;
    await db.contactMessage.create({ data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: t("Проверь заполнение формы") }, { status: 400 });
    return NextResponse.json({ error: t("Не удалось отправить сообщение") }, { status: 500 });
  }
}
