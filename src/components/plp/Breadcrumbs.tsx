import Link from "@/components/ui/Link";
import { cn } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export type Crumb = { label: string; href?: string };

export default async function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const { t } = await getT();
  return (
    <ol className={cn("scrollbar-hide flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs leading-4 text-black", className)} aria-label={t("Хлебные крошки")}>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <li key={c.href ?? c.label} className="flex items-center gap-1">
            {c.href && !last ? (
              <Link href={c.href} className="uppercase hover:underline underline-offset-2">{t(c.label)}</Link>
            ) : (
              <span className={cn("uppercase", last && "hidden font-medium sm:inline cursor-default")}>{t(c.label)}</span>
            )}
            {!last && <span className="font-poppins uppercase text-gray-500">&gt;</span>}
          </li>
        );
      })}
    </ol>
  );
}
