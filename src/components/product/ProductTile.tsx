"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Clock, Bell, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import type { ProductCard } from "@/lib/catalog/types";
import type { PromoBadge as BadgeDef } from "@/lib/cms/content";
import { PromoBadge } from "@/components/ui/Badge";
import Price from "@/components/ui/Price";
import { resolveBadges } from "@/lib/badges";
import { cn, colorsLabel } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useUI } from "@/store/ui";

type Props = { product: ProductCard; badges: BadgeDef[]; priority?: boolean; className?: string; sizes?: string };

export default function ProductTile({ product, badges, priority, className, sizes = "(max-width: 640px) 50vw, 25vw" }: Props) {
  const [hover, setHover] = useState(false);
  const add = useCart((s) => s.add);
  const openUI = useUI((s) => s.open);
  const wished = useWishlist((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlist((s) => s.toggle);
  const resolved = resolveBadges(product, badges);
  const href = `/product/${product.handle}`;
  const images = product.images.slice(0, 4);

  async function quickAdd(e: React.MouseEvent, size: ProductCard["sizes"][number]) {
    e.preventDefault();
    e.stopPropagation();
    if (size.stockStatus === "outOfStock") {
      openUI("notify", { productHandle: product.handle, variantId: size.variantId, size: size.label, title: product.title });
      return;
    }
    const ok = await add(size.variantId, 1, { title: product.title, image: product.images[0]?.url, size: size.label, color: product.colorName });
    if (ok) openUI("cart");
  }

  return (
    <div className={cn("group/tile relative scroll-mt-nav", className)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link href={href} className="flex h-full flex-col gap-4 no-underline">
        <div className="relative overflow-hidden rounded-lg bg-off-white">
          {images.length > 1 ? (
            <Swiper modules={[Navigation, Pagination]} navigation={{ prevEl: `.tile-prev-${cssId(product.id)}`, nextEl: `.tile-next-${cssId(product.id)}` }} pagination={{ clickable: true }} loop className="tile-swiper aspect-[2/3] w-full">
              {images.map((img, i) => (
                <SwiperSlide key={img.url}>
                  <Image src={img.url} alt={img.alt ?? product.title} fill sizes={sizes} priority={priority && i === 0} className="object-cover transition-transform duration-700 group-hover/tile:scale-[1.02]" />
                </SwiperSlide>
              ))}
              <button aria-label="Предыдущее фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className={cn(`tile-prev-${cssId(product.id)}`, "absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 sm:flex")}>
                <ChevronLeft size={16} />
              </button>
              <button aria-label="Следующее фото" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className={cn(`tile-next-${cssId(product.id)}`, "absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100 sm:flex")}>
                <ChevronRight size={16} />
              </button>
            </Swiper>
          ) : (
            <div className="relative aspect-[2/3] w-full">
              {images[0] && <Image src={images[0].url} alt={images[0].alt ?? product.title} fill sizes={sizes} priority={priority} className="object-cover" />}
            </div>
          )}

          {/* Wishlist heart */}
          <button
            aria-label={wished ? "Убрать из избранного" : "В избранное"}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(product.handle); }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 opacity-0 transition-all duration-300 hover:scale-110 group-hover/tile:opacity-100 max-sm:opacity-100"
          >
            <Heart size={16} strokeWidth={1.5} className={cn("transition-colors", wished && "fill-black")} />
          </button>

          {/* Badges */}
          {resolved.length > 0 && (
            <div className={cn("absolute bottom-4 left-4 z-[5] flex max-w-[calc(100%-32px)] flex-col gap-1 leading-none transition-opacity duration-150", hover && "sm:opacity-0")}>
              {resolved.map((b) => (
                <PromoBadge key={b.tag} label={b.label} textColor={b.textColor} bgColor={b.bgColor} />
              ))}
            </div>
          )}

          {/* Hover size picker (desktop) */}
          <div className={cn("absolute bottom-4 left-4 z-[6] hidden w-[calc(100%-32px)] rounded-xs bg-white p-4 transition-opacity duration-150 ease-linear sm:block", hover ? "opacity-100" : "pointer-events-none opacity-0")}>
            <p className="mb-2 text-center text-xsm text-black">Выбери размер</p>
            <ul className="flex flex-wrap justify-center">
              {product.sizes.map((s) => (
                <li key={s.variantId}>
                  <button
                    type="button"
                    onClick={(e) => quickAdd(e, s)}
                    title={s.stockStatus === "outOfStock" ? "Нет в наличии — уведомить" : s.stockStatus === "lowStock" ? "Осталось мало" : "В наличии"}
                    className={cn("flex h-8 items-center gap-1 rounded-sm px-2 text-xsm font-medium transition-colors hover:bg-off-white", s.stockStatus === "outOfStock" ? "text-gray-400" : "text-black")}
                  >
                    {s.label}
                    {s.stockStatus === "lowStock" && <Clock size={12} strokeWidth={1.5} />}
                    {s.stockStatus === "outOfStock" && <Bell size={12} strokeWidth={1.5} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-1">
          {product.colorsCount > 0 && <p className="text-xsm text-gray-500">{colorsLabel(product.colorsCount)}</p>}
          <p className="line-clamp-2 text-sm text-black">{product.title}</p>
          <Price price={product.price} compareAt={product.compareAtPrice} />
        </div>
      </Link>
    </div>
  );
}

function cssId(id: string) {
  return id.replace(/[^a-zA-Z0-9]/g, "");
}
