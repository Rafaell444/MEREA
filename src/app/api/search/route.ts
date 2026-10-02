import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { rateLimit, clientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = rateLimit(`search:${clientIp(req)}`, 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Слишком много запросов" }, { status: 429 });
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 80).trim();
  if (q.length < 2) return NextResponse.json({ queries: [], products: [], collections: [] });
  try {
    const catalog = await getCatalog();
    const res = await catalog.predictiveSearch(q);
    return NextResponse.json(res, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return NextResponse.json({ queries: [], products: [], collections: [] });
  }
}
