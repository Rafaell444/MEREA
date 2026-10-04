import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { getCustomerToken } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
const address = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).optional(),
  company: z.string().trim().max(80).optional(),
  address1: z.string().trim().min(3).max(160),
  address2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().max(80).optional(),
  zip: z.string().trim().max(12).optional(),
  country: z.string().trim().min(2).max(60).default("Грузия"),
  phone: z.string().trim().max(30).optional(),
});
const schema = z.object({ id: z.string().max(200).optional(), makeDefault: z.boolean().optional(), address });

async function guard(req: Request) {
  const { t } = await getT();
  const rl = rateLimit(`addr:${clientIp(req)}`, 30, 10 * 60_000);
  if (!rl.ok) return { res: NextResponse.json({ error: t("Попробуй позже") }, { status: 429 }) };
  const token = await getCustomerToken();
  if (!token) return { res: NextResponse.json({ error: t("Требуется вход") }, { status: 401 }) };
  return { token };
}

export async function POST(req: Request) {
  const { t } = await getT();
  const g = await guard(req);
  if ("res" in g) return g.res;
  try {
    const body = schema.parse(await req.json());
    const catalog = await getCatalog();
    const r = body.id ? await catalog.updateAddress(g.token!, body.id, body.address, body.makeDefault) : await catalog.createAddress(g.token!, body.address, body.makeDefault);
    if ("error" in r) return NextResponse.json({ error: t(r.error) }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: t("Заполни обязательные поля адреса") }, { status: 400 });
    return NextResponse.json({ error: t("Не удалось сохранить адрес") }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { t } = await getT();
  const g = await guard(req);
  if ("res" in g) return g.res;
  try {
    const { id } = z.object({ id: z.string().min(1).max(200) }).parse(await req.json());
    const catalog = await getCatalog();
    const r = await catalog.deleteAddress(g.token!, id);
    if ("error" in r) return NextResponse.json({ error: t(r.error) }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: t("Не удалось удалить адрес") }, { status: 400 });
  }
}
