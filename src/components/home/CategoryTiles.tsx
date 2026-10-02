import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

type Item = { label: string; href: string; image?: string };

export default function CategoryTiles({ title, items }: { title?: string | null; items: Item[] }) {
  if (!items.length) return null;
  return (
    <section className="py-8 sm:py-10 px-4 sm:px-10">
      {title && <h2 className="mb-5 text-xl font-bold sm:text-2xl">{title}</h2>}
      <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {items.map((it, i) => (
          <Reveal key={it.href + it.label} delay={i * 60} className="w-[42vw] shrink-0 sm:w-auto">
            <Link href={it.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-off-white">
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </div>
              <p className="mt-2 text-center text-sm font-medium uppercase tracking-wide group-hover:underline underline-offset-4">{it.label}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
