import Link from "next/link";
import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";
import ProductCarousel from "@/components/product/ProductCarousel";
import Reveal from "@/components/ui/Reveal";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  image?: string;
  links?: { label: string; href: string }[];
  products: ProductCard[];
  badges: PromoBadge[];
};

/** Editorial block: large image + headline + category links, followed by a product carousel. */
export default function Editorial({ title, subtitle, image, links = [], products, badges }: Props) {
  return (
    <section className="py-8 sm:py-10">
      <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:items-center sm:gap-10 sm:px-10">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-lg bg-off-white sm:aspect-[5/6]">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.03]" />
          )}
        </Reveal>
        <Reveal delay={120} className="sm:pl-6">
          {title && <h2 className="text-2xl font-bold sm:text-[32px] leading-tight">{title}</h2>}
          {subtitle && <p className="mt-4 max-w-[420px] text-sm leading-6 text-gray-900">{subtitle}</p>}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="btn-outline h-11 px-6 text-xsm">{l.label}</Link>
              ))}
            </div>
          )}
        </Reveal>
      </div>
      <ProductCarousel products={products} badges={badges} className="pb-0" />
    </section>
  );
}
