import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { getCustomerToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getCustomerToken();
  if (!token) return NextResponse.json({ customer: null }, { headers: { "Cache-Control": "no-store" } });
  try {
    const catalog = await getCatalog();
    const customer = await catalog.getCustomer(token);
    return NextResponse.json({ customer }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
