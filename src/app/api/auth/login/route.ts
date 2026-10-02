import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { setCustomerToken } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
const schema = z.object({ email: z.string().email().max(120), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Слишком много попыток. Попробуй через несколько минут." }, { status: 429 });
  try {
    const body = schema.parse(await req.json());
    const catalog = await getCatalog();
    const res = await catalog.login(body.email.toLowerCase(), body.password);
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 401 });
    await setCustomerToken(res.token, res.expiresAt);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь e-mail и пароль" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось войти" }, { status: 500 });
  }
}
