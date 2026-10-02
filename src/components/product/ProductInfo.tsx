"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Clock, Bell, Minus, Plus, Ruler, ChevronUp, Truck, RotateCcw, Leaf } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import type { PromoBadge as BadgeDef } from "@/lib/cms/content";
import { PromoBadge } from "@/components/ui/Badge";
import Price from "@/components/ui/Price";
import Stars from "@/components/ui/Stars";
import { AccordionItem } from "@/components/ui/Accordion";
import { resolveBadges } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

export default function ProductInfo({ product, badges, reviewCount, rating }: { product: Product; badges: BadgeDef[]; reviewCount: number; rating: number }) {
  const [variantId, setVariantId] = useState<string | null>(product.variants.length === 1 ? product.variants[0].id : null);
  const [qty, setQty] = useState(1);
  const [sizesOpen, setSizesOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { add, loading } = useCart();
  const { open } = useUI();
  const wished = useWishlist((s) => s.handles.includes(product.handle));
  const toggleWish = useWishlist((s) => s.toggle);

  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) ?? null, [product.variants, variantId]);
  const resolved = resolveBadges(product, badges);
  const sizes = product.variants;

  async function addToCart() {
    if (!variant) { setError("Выбери размер"); setSizesOpen(true); return; }
    setError(null);
    if (variant.stockStatus === "outOfStock") {
      open("notify", { productHandle: product.handle, variantId: variant.id, size: variant.title, title: product.title });
      return;
    }
    const ok = await add(variant.id, qty, { title: product.title, image: product.images[0]?.url, size: variant.title, color: product.colorName });
    if (ok) open("cart");
  }

  return (
    <div className="flex flex-col gap-4">
      {resolved.length > 0 && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto sm:flex-wrap">
          {resolved.map((b) => <PromoBadge key={b.tag} label={b.label} textColor={b.textColor} bgColor={b.bgColor} />)}
        </div>
      )}

      <div className="mt-1">
        <div className="mb-2 flex justify-between gap-2">
          <h1 className="text-sm font-normal sm:text-md">{product.title}</h1>
          <button aria-label="В избранное" onClick={() => toggleWish(product.handle)} className="shrink-0 transition-transform hover:scale-110">
            <Heart size={20} strokeWidth={1.5} className={cn(wished && "fill-black")} />
          </button>
        </div>
        <Price price={variant?.price ?? product.price} compareAt={variant?.compareAtPrice ?? product.compareAtPrice} size="md" />
        {reviewCount > 0 && (
          <a href="#reviewsSection" className="mt-6 flex items-center gap-1.5">
            <span className="mr-1 text-xsm">{rating.toFixed(1).replace(".0", "")}/5</span>
            <Stars value={rating} />
            <span className="text-xsm underline underline-offset-4">({reviewCount} {plural(reviewCount)})</span>
          </a>
        )}
      </div>

      {/* Colours */}
      {product.colorSiblings.length > 0 && (
        <div className="w-full border-t border-gray-300 pt-6 pb-4">
          <p className="flex items-center justify-between text-xsm text-black">
            <span>Цвет: <span className="font-medium">{product.colorName}</span></span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.colorSiblings.map((c) => {
              const active = c.handle === product.handle;
              return (
                <Link key={c.handle} href={`/product/${c.handle}`} title={c.colorName} scroll={false} className={cn("relative aspect-[1/1.5] w-14 overflow-hidden rounded-xs border transition-all duration-200 hover:border-black", active ? "border-black" : "border-transparent", !c.available && "opacity-50")}>
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt={c.colorName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="block h-full w-full" style={{ background: c.hex ?? "#ddd" }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div className="border-t border-gray-300 pt-5">
        <button onClick={() => setSizesOpen((v) => !v)} className="flex w-full items-center justify-between text-xsm">
          <span>Размер: <span className={cn("font-medium", !variant && "text-gray-500")}>{variant ? variant.title : "Выбери размер"}</span></span>
          <ChevronUp size={14} className={cn("transition-transform", !sizesOpen && "rotate-180")} />
        </button>
        <div className={cn("grid transition-[grid-template-rows] duration-300", sizesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <ul className="mt-4 flex flex-wrap gap-2">
              {sizes.map((v) => {
                const active = v.id === variantId;
                const oos = v.stockStatus === "outOfStock";
                return (
                  <li key={v.id}>
                    <button
                      onClick={() => { setVariantId(v.id); setError(null); }}
                      className={cn(
                        "flex h-9 min-w-[56px] items-center justify-center gap-1 rounded-full border px-3 text-xsm font-medium transition-all",
                        active ? "border-black bg-black text-white" : "border-gray-300 hover:border-black",
                        oos && !active && "text-gray-400 border-dashed",
                      )}
                      title={oos ? "Нет в наличии — уведомить о поступлении" : v.stockStatus === "lowStock" ? "Осталось мало" : "В наличии"}
                    >
                      {v.title}
                      {v.stockStatus === "lowStock" && <Clock size={12} strokeWidth={1.5} />}
                      {oos && <Bell size={12} strokeWidth={1.5} />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {error && <p className="mt-2 text-xsm text-error animate-fade-in">{error}</p>}
            <div className="mt-5 rounded-sm bg-off-white p-4">
              <p className="text-xsm font-medium">Не уверен в размере?</p>
              <p className="mt-1 text-xsm text-gray-500">Ознакомься с нашим руководством или обратись за советом по выбору идеального размера</p>
              <button onClick={() => open("sizeGuide", { key: product.sizeGuideKey })} className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xsm hover:border-black">
                <Ruler size={14} strokeWidth={1.5} /> Таблица размеров
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Qty + CTA */}
      <div className="flex items-center gap-4 border-t border-gray-300 pt-5">
        <span className="text-xsm">Количество:</span>
        <div className="flex items-center rounded-full border border-gray-300">
          <button aria-label="Меньше" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-l-full hover:bg-off-white"><Minus size={12} /></button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button aria-label="Больше" onClick={() => setQty((q) => Math.min(10, q + 1))} className="flex h-9 w-9 items-center justify-center rounded-r-full hover:bg-off-white"><Plus size={12} /></button>
        </div>
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 bg-white px-4 py-3 sm:static sm:m-0 sm:p-0">
        <button onClick={addToCart} disabled={loading} className="btn-primary w-full">
          {variant ? (variant.stockStatus === "outOfStock" ? "Сообщить о поступлении" : "Добавить в корзину") : "Выбери размер"}
        </button>
      </div>

      {/* Accordions */}
      <div className="mt-2">
        <AccordionItem title="Доставка и возвраты">
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><Truck size={16} strokeWidth={1.5} /> Доставка по всей России, бесплатно от 3 000 ₽</li>
            <li className="flex items-center gap-2"><RotateCcw size={16} strokeWidth={1.5} /> Возврат в течение 14 дней</li>
          </ul>
        </AccordionItem>
        <AccordionItem title="Описание" defaultOpen>
          {product.sku && <p className="mb-2 text-xsm text-gray-500">Артикул: {product.sku}</p>}
          <div className="prose-cms" dangerouslySetInnerHTML={{ __html: product.descriptionHtml || `<p>${product.description}</p>` }} />
        </AccordionItem>
        <AccordionItem title="Состав и уход">
          {product.composition && <p className="mb-2"><strong>Состав:</strong> {product.composition}</p>}
          {product.care && <p>{product.care}</p>}
          {!product.composition && !product.care && <p>Информация появится позже.</p>}
        </AccordionItem>
        <AccordionItem title={<span className="flex items-center gap-2"><Leaf size={14} strokeWidth={1.5} /> Проект Be The Change: прослеживаемость</span>}>
          <p>Мы раскрываем цепочку поставок: материалы, производство и упаковка этого изделия соответствуют программе ответственного производства Be The Change.</p>
        </AccordionItem>
      </div>
    </div>
  );
}

function plural(n: number) {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return "отзывов";
  if (b > 1 && b < 5) return "отзыва";
  if (b === 1) return "отзыв";
  return "отзывов";
}
