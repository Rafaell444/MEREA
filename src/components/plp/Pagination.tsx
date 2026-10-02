import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = { page: number; pageSize: number; total: number; hasNext: boolean; basePath: string; params: URLSearchParams; nextCursor?: string | null };

function withPage(params: URLSearchParams, page: number) {
  const p = new URLSearchParams(params);
  if (page <= 1) p.delete("page"); else p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export default function Pagination({ page, pageSize, total, hasNext, basePath, params, nextCursor }: Props) {
  // Shopify collections paginate by cursor (no total count): render only "Показать еще" with ?after=<cursor>
  if (total < 0 || nextCursor) {
    if (!hasNext || !nextCursor) return null;
    const p = new URLSearchParams(params);
    p.delete("page");
    p.set("after", nextCursor);
    return (
      <div className="mt-10 flex justify-center">
        <Link href={`${basePath}?${p}`} className="btn-outline h-11 px-8 text-xsm" scroll={false}>Показать еще</Link>
      </div>
    );
  }
  const pages = total > 0 ? Math.ceil(total / pageSize) : hasNext ? page + 1 : page;
  if (pages <= 1 && !hasNext) return null;
  const from = (page - 1) * pageSize + 1;
  const to = total > 0 ? Math.min(total, page * pageSize) : page * pageSize;
  const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 3, pages - 6));
    return start + i;
  }).filter((n) => n >= 1 && n <= pages);

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {total > 0 && <p className="text-xsm text-gray-500">{from}–{to} из {total} товаров</p>}
      {hasNext && (
        <Link href={`${basePath}${withPage(params, page + 1)}`} className="btn-outline h-11 px-8 text-xsm" scroll={false}>
          Показать еще
        </Link>
      )}
      <ul className="flex items-center gap-1">
        {nums.map((n) => (
          <li key={n}>
            <Link href={`${basePath}${withPage(params, n)}`} className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xsm transition-colors hover:bg-off-white", n === page && "bg-black text-white hover:bg-black")} aria-current={n === page ? "page" : undefined}>
              {n}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
