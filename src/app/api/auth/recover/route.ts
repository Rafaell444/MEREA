import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/lib/catalog";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
const SAME_REPLY = { ok: true, message: "Если аккаунт существует, мы отправили письмо для восстановления пароля." };

export async function POST(req: Request) {
  const rl = rateLimit(`recover:${clientIp(req)}`, 3, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Попробуй позже" }, { status: 429 });
  try {
    const { email } = z.object({ email: z.string().email().max(120) }).parse(await req.json());
    const catalog = await getCatalog();
    await catalog.recoverPassword(email.toLowerCase());
    // Always respond identically to prevent account enumeration
    return NextResponse.json(SAME_REPLY);
  } catch {
    return NextResponse.json(SAME_REPLY);
  }
}
