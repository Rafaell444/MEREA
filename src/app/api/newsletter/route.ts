import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { getT } from "@/lib/i18n/server";

const schema = z.object({ email: z.string().email().max(120), source: z.string().max(40).optional(), consent: z.boolean().optional() });

export async function POST(req: Request) {
  const { t } = await getT();
  const rl = rateLimit(`newsletter:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: t("Попробуй позже") }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    await db.subscriber.upsert({
      where: { email },
      update: { source: body.source, consent: body.consent ?? true },
      create: { email, source: body.source, consent: body.consent ?? true },
    });
    return NextResponse.json({ ok: true, message: t("Спасибо за подписку! Проверь почту.") });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: t("Введи корректный e-mail") }, { status: 400 });
    return NextResponse.json({ error: t("Не удалось сохранить подписку") }, { status: 500 });
  }
}
