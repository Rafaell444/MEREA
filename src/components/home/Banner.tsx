import Link from "next/link";
import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";
import ProductCarousel from "@/components/product/ProductCarousel";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  image?: string;
  cta?: string;
  href?: string;
  textTheme?: string;
  products: ProductCard[];
  badges: PromoBadge[];
};

/** Full-width banner with text overlay (like "Пижамы для неё") + product carousel underneath. */
export default function Banner({ title, subtitle, image, cta, href, textTheme = "light", products, badges }: Props) {
  const light = textTheme !== "dark";
  return (
    <section className="py-8 sm:py-10">
      <Reveal className="px-4 sm:px-10">
        <div className="relative h-[420px] overflow-hidden rounded-lg bg-off-white sm:h-[560px]">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          )}
          <div className={cn("absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent", light ? "from-black/50" : "from-white/50")} />
          <div className={cn("absolute bottom-8 left-6 max-w-[480px] sm:bottom-12 sm:left-12", light ? "text-white" : "text-black")}>
            {title && <h2 className="text-[28px] font-bold leading-tight sm:text-[36px]">{title}</h2>}
            {subtitle && <p className="mt-2 text-sm">{subtitle}</p>}
            {cta && href && <Link href={href} className={cn("mt-5 h-11 px-7 text-xsm", light ? "btn-white" : "btn-primary")}>{cta}</Link>}
          </div>
        </div>
      </Reveal>
      <ProductCarousel products={products} badges={badges} className="pb-0" />
    </section>
  );
}
