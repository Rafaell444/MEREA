import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { clearCustomerToken, getCustomerToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = await getCustomerToken();
  if (token) {
    const catalog = await getCatalog();
    await catalog.logout(token).catch(() => undefined);
  }
  await clearCustomerToken();
  return NextResponse.json({ ok: true });
}
