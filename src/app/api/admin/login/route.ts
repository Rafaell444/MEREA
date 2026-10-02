import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
const schema = z.object({ email: z.string().email().max(120), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: `Слишком много попыток. Повтори через ${Math.ceil(rl.retryAfterSec / 60)} мин.` }, { status: 429 });
  try {
    const { email, password } = schema.parse(await req.json());
    const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    // constant-time-ish: always run bcrypt even if user missing
    const ok = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    if (!user || !ok || !user.active) {
      await db.auditLog.create({ data: { action: "login-failed", entity: "auth", details: JSON.stringify({ email }), ip } }).catch(() => undefined);
      return NextResponse.json({ error: "Неверный e-mail или пароль" }, { status: 401 });
    }
    await createAdminSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
    await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await db.auditLog.create({ data: { userId: user.id, action: "login", entity: "auth", ip } }).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Проверь e-mail и пароль" }, { status: 400 });
  }
}
