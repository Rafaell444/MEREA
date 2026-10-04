import Link from "@/components/ui/Link";
import { ArrowRight } from "lucide-react";
import { getT } from "@/lib/i18n/server";

type Item = { text: string; cta?: string; href?: string };

/** Scrolling promo strip ("3=4 на одежду и нижнее бельё — К акции · Скидки до -70% — К распродаже"). */
export default async function PromoStrip({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const { t } = await getT();
  const row = [...items, ...items, ...items, ...items];
  return (
    <section className="group/strip my-6 overflow-hidden border-y border-black bg-white py-5 sm:my-8">
      <div className="flex w-max items-center animate-marquee group-hover/strip:[animation-play-state:paused]" style={{ animationDuration: `${row.length * 5}s` }}>
        {row.map((it, i) => (
          <div key={i} className="flex items-center gap-6 px-8" aria-hidden={i >= items.length}>
            <span className="whitespace-nowrap text-lg font-bold uppercase tracking-wide sm:text-2xl">{t(it.text)}</span>
            {it.cta && it.href && (
              <Link href={it.href} className="flex items-center gap-1 whitespace-nowrap text-sm font-medium underline-offset-4 hover:underline">
                {t(it.cta)} <ArrowRight size={14} />
              </Link>
            )}
            <span className="mx-2 h-1.5 w-1.5 rounded-full bg-black" />
          </div>
        ))}
      </div>
    </section>
  );
}
