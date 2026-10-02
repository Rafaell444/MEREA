import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { isShopifyConfigured, shopInfo, SHOPIFY_DOMAIN } from "@/lib/shopify/client";
import { getCatalog } from "@/lib/catalog";
import { revalidateCms } from "@/lib/cms/content";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** GET: connection status + Shopify collections + how they map to category pages. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isShopifyConfigured()) {
    return NextResponse.json({ configured: false, domain: SHOPIFY_DOMAIN || null, message: "Заполни SHOPIFY_STORE_DOMAIN и SHOPIFY_STOREFRONT_ACCESS_TOKEN в .env и перезапусти сервер." });
  }
  try {
    const catalog = await getCatalog();
    const [shop, collections, categories] = await Promise.all([shopInfo(), catalog.listCollections(), db.categoryPage.findMany({ orderBy: { path: "asc" } })]);
    const handles = new Set(collections.map((c) => c.handle));
    const sample = await catalog.getCollection(collections[0]?.handle ?? "", { first: 3 }).catch(() => null);
    return NextResponse.json({
      configured: true,
      shop,
      collectionsCount: collections.length,
      collections,
      sampleProducts: sample?.products.map((p) => ({ handle: p.handle, title: p.title, price: p.price, image: p.images[0]?.url, sizes: p.sizes.length })) ?? [],
      categories: categories.map((c) => ({ id: c.id, path: c.path, title: c.title, collectionHandle: c.collectionHandle, linked: !!c.collectionHandle && handles.has(c.collectionHandle) })),
    });
  } catch (e) {
    return NextResponse.json({ configured: true, error: (e as Error).message }, { status: 502 });
  }
}

const mapSchema = z.object({ mode: z.enum(["auto", "set"]), categoryId: z.string().optional(), collectionHandle: z.string().max(200).optional() });

/** POST: map category pages to Shopify collections (one, or automatically by handle / slug / title). */
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session || !["owner", "admin"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isShopifyConfigured()) return NextResponse.json({ error: "Shopify не подключен" }, { status: 400 });
  try {
    const body = mapSchema.parse(await req.json());
    if (body.mode === "set") {
      if (!body.categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
      await db.categoryPage.update({ where: { id: body.categoryId }, data: { collectionHandle: body.collectionHandle || null } });
      revalidateCms();
      return NextResponse.json({ ok: true, updated: 1 });
    }
    const catalog = await getCatalog();
    const collections = await catalog.listCollections();
    const byHandle = new Map(collections.map((c) => [c.handle, c]));
    const byTitle = new Map(collections.map((c) => [c.title.trim().toLowerCase(), c]));
    const bySlugTitle = new Map(collections.map((c) => [slugify(c.title), c]));
    const categories = await db.categoryPage.findMany();
    let updated = 0;
    const unmatched: string[] = [];
    for (const cat of categories) {
      if (cat.collectionHandle && byHandle.has(cat.collectionHandle)) continue;
      const lastSeg = cat.path.split("/").pop() ?? "";
      const candidate =
        (cat.collectionHandle && byHandle.get(cat.collectionHandle)) ||
        byHandle.get(lastSeg) ||
        byHandle.get(cat.path.replace(/\//g, "-")) ||
        byTitle.get(cat.title.trim().toLowerCase()) ||
        (cat.navTitle ? byTitle.get(cat.navTitle.trim().toLowerCase()) : undefined) ||
        bySlugTitle.get(slugify(cat.title)) ||
        (cat.navTitle ? bySlugTitle.get(slugify(cat.navTitle)) : undefined);
      if (candidate) {
        await db.categoryPage.update({ where: { id: cat.id }, data: { collectionHandle: candidate.handle } });
        updated++;
      } else unmatched.push(cat.path);
    }
    await db.auditLog.create({ data: { userId: session.sub, action: "shopify-automap", entity: "categories", details: JSON.stringify({ updated, unmatched }) } }).catch(() => undefined);
    revalidateCms();
    return NextResponse.json({ ok: true, updated, unmatched });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
