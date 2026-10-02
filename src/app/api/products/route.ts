import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Batch product-card lookup by handles (used by the wishlist page). */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("handles") ?? "";
  const handles = raw.split(",").map((h) => h.trim()).filter((h) => /^[a-z0-9-]+$/i.test(h)).slice(0, 60);
  if (!handles.length) return NextResponse.json({ products: [] });
  try {
    const catalog = await getCatalog();
    const products = await catalog.getProductsByHandles(handles);
    return NextResponse.json({ products }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
