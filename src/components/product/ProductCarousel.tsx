"use client";
import Link from "@/components/ui/Link";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge } from "@/lib/cms/content";
import ProductTile from "./ProductTile";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";

type Props = {
  title?: string | null;
  subtitle?: string | null;
  href?: string;
  products: ProductCard[];
  badges: PromoBadge[];
  className?: string;
  headingClassName?: string;
};

export default function ProductCarousel({ title, subtitle, href, products, badges, className, headingClassName }: Props) {
  const t = useT();
  const ref = useRef<SwiperType | null>(null);
  if (!products.length) return null;
  return (
    <section className={cn("relative py-8 sm:py-10", className)}>
      {(title || subtitle) && (
        <div className={cn("mb-5 flex items-end justify-between px-4 sm:px-10", headingClassName)}>
          <div>
            {subtitle && <p className="text-xsm text-gray-500 mb-1">{t(subtitle)}</p>}
            {title && (href ? <Link href={href} className="text-xl font-bold sm:text-2xl hover:underline underline-offset-4">{t(title)}</Link> : <h2 className="text-xl font-bold sm:text-2xl">{t(title)}</h2>)}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button aria-label={t("Назад")} onClick={() => ref.current?.slidePrev()} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-black hover:bg-black hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button aria-label={t("Вперед")} onClick={() => ref.current?.slideNext()} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition-colors hover:border-black hover:bg-black hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      <Swiper
        modules={[Navigation, FreeMode]}
        onSwiper={(s) => (ref.current = s)}
        freeMode={{ momentumBounce: false }}
        spaceBetween={8}
        slidesPerView={2.2}
        breakpoints={{ 640: { slidesPerView: 3.3, spaceBetween: 16 }, 1024: { slidesPerView: 4.3, spaceBetween: 16 }, 1440: { slidesPerView: 5.2, spaceBetween: 16 } }}
        className="!px-4 sm:!px-10"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductTile product={p} badges={badges} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1440px) 23vw, 19vw" />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
