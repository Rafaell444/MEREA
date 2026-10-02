import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getCustomerToken, setCustomerToken } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
const schema = z.object({
  firstName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().email().max(120).optional(),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  gender: z.enum(["female", "male", "other", ""]).optional(),
  acceptsMarketing: z.boolean().optional(),
  currentPassword: z.string().max(200).optional(),
  password: z.string().min(8).max(200).optional(),
});

export async function PATCH(req: Request) {
  const rl = rateLimit(`profile:${clientIp(req)}`, 20, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Попробуй позже" }, { status: 429 });
  const token = await getCustomerToken();
  if (!token) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  try {
    const body = schema.parse(await req.json());
    const catalog = await getCatalog();
    if (body.password) {
      // verify current password before changing it
      const me = await catalog.getCustomer(token);
      if (!me) return NextResponse.json({ error: "Сессия истекла" }, { status: 401 });
      const check = await catalog.login(me.email, body.currentPassword ?? "");
      if ("error" in check) return NextResponse.json({ error: "Текущий пароль указан неверно" }, { status: 400 });
    }
    const { currentPassword: _cp, ...input } = body;
    void _cp;
    const res = await catalog.updateCustomer(token, { ...input, birthday: input.birthday || undefined, gender: input.gender || undefined });
    if ("error" in res) return NextResponse.json({ error: res.error }, { status: 400 });
    if (res.token && res.expiresAt) await setCustomerToken(res.token, res.expiresAt);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Проверь заполнение формы" }, { status: 400 });
    return NextResponse.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
}
