import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { setCustomerToken } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const schema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(200),
  firstName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(30).optional(),
  acceptsMarketing: z.boolean().optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 30 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Слишком много попыток" }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    const catalog = await getCatalog();
    const res = await catalog.register({ ...body, email });
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    if (body.acceptsMarketing) {
      await db.subscriber.upsert({ where: { email }, update: { source: "register" }, create: { email, source: "register" } }).catch(() => undefined);
    }
    const login = await catalog.login(email, body.password);
    if ("token" in login) await setCustomerToken(login.token, login.expiresAt);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь заполнение формы (пароль — минимум 8 символов)" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось создать аккаунт" }, { status: 500 });
  }
}
