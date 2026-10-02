import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <ol className={cn("scrollbar-hide flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs leading-4 text-black", className)} aria-label="Хлебные крошки">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <li key={c.href ?? c.label} className="flex items-center gap-1">
            {c.href && !last ? (
              <Link href={c.href} className="uppercase hover:underline underline-offset-2">{c.label}</Link>
            ) : (
              <span className={cn("uppercase", last && "hidden font-medium sm:inline cursor-default")}>{c.label}</span>
            )}
            {!last && <span className="font-poppins uppercase text-gray-500">&gt;</span>}
          </li>
        );
      })}
    </ol>
  );
}
