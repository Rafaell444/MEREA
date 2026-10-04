import Link from "@/components/ui/Link";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export type Tile = { label: string; href: string; image?: string | null; active?: boolean };

/** Round-ish image tiles under the PLP title (Посмотреть все / Балконет / Пуш-ап …). */
export default async function SubcategoryTiles({ tiles }: { tiles: Tile[] }) {
  if (tiles.length < 2) return null;
  const { t } = await getT();
  return (
    <div className="scrollbar-hide -mx-4 flex w-[calc(100%+2rem)] overflow-x-auto sm:mx-0 sm:w-auto sm:justify-center">
      <div className="mb-4 mt-2 flex gap-2 px-4 sm:gap-4 sm:px-0">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="shrink-0 last:mr-4 sm:last:mr-0">
            <div className="flex w-[23vw] flex-col items-center text-center sm:w-[6.3vw] sm:min-w-[84px]">
              <div className="mb-2 aspect-square w-full overflow-hidden rounded-sm bg-off-white">
                {tile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tile.image} alt={t(tile.label)} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-gray-400">{t(tile.label).slice(0, 2)}</div>
                )}
              </div>
              <p className={cn("line-clamp-1 w-full text-xsm", tile.active && "font-bold")}>{t(tile.label)}</p>
              {tile.active && <span className="mt-2 h-1 w-1 rounded-full bg-black" />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
