import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import type { SortKey } from "@/lib/catalog/types";
import { getBadges } from "@/lib/cms/content";
import FiltersDrawer, { FiltersBar } from "@/components/plp/FiltersDrawer";
import ProductGrid from "@/components/plp/ProductGrid";
import Pagination from "@/components/plp/Pagination";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const { t } = await getT();
  return { title: q ? t("Поиск: {q}", { q }) : t("Поиск"), robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").slice(0, 80).trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const after = typeof sp.after === "string" ? sp.after.slice(0, 500) : null;
  const sort = (typeof sp.sort === "string" ? sp.sort : "RELEVANCE") as SortKey;
  const filters: Record<string, string[]> = {};
  const params = new URLSearchParams();
  params.set("q", q);
  for (const [k, v] of Object.entries(sp)) {
    if (!v) continue;
    const vals = Array.isArray(v) ? v : [v];
    if (k.startsWith("f.")) { filters[k.slice(2)] = vals; vals.forEach((x) => params.append(k, x)); }
    if (k === "sort") params.set("sort", vals[0]);
  }

  const [catalog, badges] = await Promise.all([getCatalog(), getBadges()]);
  const result = q ? await catalog.search(q, { first: PAGE_SIZE, page, after, sort, filters }).catch(() => null) : null;
  const products = result?.products ?? [];
  const total = result?.totalCount ?? 0;
  const { t } = await getT();

  return (
    <div className="px-4 py-4 sm:px-10">
      <p className="text-xs uppercase text-gray-500">{t("Результаты поиска")}</p>
      <h1 className="mt-1 text-xl font-bold sm:text-2xl">{q ? `«${q}»` : t("Поиск")}</h1>
      {q && (
        <>
          <FiltersBar total={total} filters={result?.filters ?? []} />
          <FiltersDrawer total={total} filters={result?.filters ?? []} />
        </>
      )}
      <ProductGrid products={products} badges={badges} />
      {result && <Pagination page={page} pageSize={PAGE_SIZE} total={total} hasNext={result.pageInfo.hasNextPage} basePath="/search" params={params} nextCursor={result.pageInfo.endCursor} />}
    </div>
  );
}
