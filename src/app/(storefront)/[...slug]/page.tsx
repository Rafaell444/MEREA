import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import type { SortKey } from "@/lib/catalog/types";
import { getBadges, getCategory, getCategoryBreadcrumbs, getCategoryChildren, getAllCategories } from "@/lib/cms/content";
import Breadcrumbs from "@/components/plp/Breadcrumbs";
import SubcategoryTiles from "@/components/plp/SubcategoryTiles";
import FiltersDrawer, { FiltersBar } from "@/components/plp/FiltersDrawer";
import ProductGrid from "@/components/plp/ProductGrid";
import Pagination from "@/components/plp/Pagination";
import { getT } from "@/lib/i18n/server";

export const revalidate = 120;
const PAGE_SIZE = 24;
const SORTS: SortKey[] = ["RELEVANCE", "BEST_SELLING", "CREATED", "PRICE_ASC", "PRICE_DESC", "TITLE"];

type Params = { slug: string[] };
type Search = Record<string, string | string[] | undefined>;

function parseSearch(sp: Search) {
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const after = typeof sp.after === "string" ? sp.after.slice(0, 500) : null;
  const sort = SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "RELEVANCE";
  const filters: Record<string, string[]> = {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (!v) continue;
    const vals = Array.isArray(v) ? v : [v];
    if (k.startsWith("f.")) filters[k.slice(2)] = vals.map((x) => x.slice(0, 200));
    if (k === "sort" || k.startsWith("f.")) vals.forEach((x) => params.append(k, x));
  }
  return { page, sort, filters, params, after };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug.join("/"));
  if (!cat) return {};
  const { t } = await getT();
  return {
    title: cat.seoTitle ? t(cat.seoTitle) : t("{title} Merey — купить", { title: t(cat.title) }),
    description: cat.seoDescription ? t(cat.seoDescription) : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const { slug } = await params;
  const path = slug.join("/");
  const cat = await getCategory(path);
  if (!cat) notFound();
  const { t } = await getT();

  const sp = parseSearch(await searchParams);
  const [catalog, badges, rawCrumbs, children, all] = await Promise.all([getCatalog(), getBadges(), getCategoryBreadcrumbs(path), getCategoryChildren(path), getAllCategories()]);

  const crumbs = rawCrumbs.map((c) => ({ ...c, label: t(c.label) }));

  const collection = cat.collectionHandle
    ? await catalog.getCollection(cat.collectionHandle, { first: PAGE_SIZE, page: sp.page, after: sp.after, sort: sp.sort, filters: sp.filters }).catch(() => null)
    : null;

  // Tiles: own children, or siblings when this is a leaf (like "Балконет" shows all bra types)
  const parent = cat.parentPath ? all.find((c) => c.path === cat.parentPath) : null;
  const tileSource = children.length ? children : parent ? all.filter((c) => c.parentPath === parent.path && c.showInTiles) : [];
  const tileRoot = children.length ? cat : parent;
  const tiles = tileRoot && tileSource.length
    ? [{ label: t("Посмотреть все"), href: `/${tileRoot.path}`, image: tileRoot.image, active: tileRoot.path === cat.path }, ...tileSource.map((c) => ({ label: t(c.navTitle ?? c.title), href: `/${c.path}`, image: c.image, active: c.path === cat.path }))]
    : [];

  const products = collection?.products ?? [];
  const total = collection?.totalCount ?? -1;

  return (
    <div>
      <Breadcrumbs items={crumbs} className="mx-4 my-2 sm:mx-10 sm:my-3" />
      <div className="flex flex-col px-4 sm:px-10">
        <h1 className="font-bold text-black"><span className="text-xl sm:text-2xl">{t(cat.title)}</span></h1>
        {cat.bannerImage && (
          <div className="relative mt-4 h-40 overflow-hidden rounded-lg sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cat.bannerImage} alt="" className="h-full w-full object-cover" />
            {(cat.bannerTitle || cat.bannerText) && (
              <div className="absolute bottom-4 left-4 text-white sm:bottom-6 sm:left-8">
                {cat.bannerTitle && <p className="text-lg font-bold sm:text-2xl">{t(cat.bannerTitle)}</p>}
                {cat.bannerText && <p className="text-xsm sm:text-sm">{t(cat.bannerText)}</p>}
              </div>
            )}
          </div>
        )}
        <SubcategoryTiles tiles={tiles} />
        <FiltersBar total={total >= 0 ? total : products.length} filters={collection?.filters ?? []} />
        <FiltersDrawer total={total} filters={collection?.filters ?? []} />
        <ProductGrid products={products} badges={badges} />
        {collection && (
          <Pagination page={sp.page} pageSize={PAGE_SIZE} total={total} hasNext={collection.pageInfo.hasNextPage} basePath={`/${path}`} params={sp.params} nextCursor={collection.pageInfo.endCursor} />
        )}
        {cat.seoText && <div className="prose-cms mx-auto mt-16 max-w-3xl border-t border-gray-200 pt-8" dangerouslySetInnerHTML={{ __html: t(cat.seoText) }} />}
      </div>
    </div>
  );
}
