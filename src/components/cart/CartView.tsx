"use client";
import { useEffect, useState } from "react";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { Minus, Plus, Trash2, Truck, RotateCcw, ShieldCheck, Heart } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useT } from "@/lib/i18n/client";

export default function CartView({ notice, returnDays, freeShippingFrom }: { notice: string; returnDays: number; freeShippingFrom: number }) {
  const t = useT();
  const { cart, init, loading, update, remove, applyDiscount } = useCart();
  const toggleWish = useWishlist((s) => s.toggle);
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  useEffect(() => { init(); }, [init]);

  const lines = cart?.lines ?? [];
  const qty = cart?.totalQuantity ?? 0;
  const subtotal = cart?.cost.subtotalAmount ?? { amount: 0, currencyCode: "RUB" };
  const total = cart?.cost.totalAmount ?? subtotal;
  const discount = cart?.cost.totalDiscountAmount?.amount ?? 0;
  const left = Math.max(0, freeShippingFrom - subtotal.amount);

  return (
    <div className="px-4 py-6 sm:px-10 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {lines.length === 0 ? (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-normal sm:text-[32px]">{t("Твоя корзина пуста!")}</h1>
              <p className="mt-4 text-sm text-gray-900">{t("В корзину еще не добавлено ни одного товара")}</p>
              <Link href="/" className="btn-primary mt-8 h-12 px-12">{t("Начать покупки")}</Link>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-normal sm:text-[32px]">{t("Корзина")}</h1>
              <div className="mt-4 rounded-sm bg-off-white px-4 py-3 text-xsm">
                {left > 0 ? t("До бесплатной доставки осталось {amount}", { amount: formatMoney(left) }) : t("У тебя бесплатная доставка 🎉")}
                <div className="mt-2 h-1 w-full rounded-full bg-gray-200"><div className="h-1 rounded-full bg-black transition-all duration-500" style={{ width: `${Math.min(100, (subtotal.amount / freeShippingFrom) * 100)}%` }} /></div>
              </div>
              <ul className="mt-4 divide-y divide-gray-200">
                {lines.map((l) => (
                  <li key={l.id} className="flex gap-4 py-5 animate-fade-in sm:gap-6">
                    <Link href={`/product/${l.merchandise.product.handle}`} className="relative h-36 w-24 shrink-0 overflow-hidden rounded-sm bg-off-white sm:h-44 sm:w-[118px]">
                      {l.merchandise.image && <Image src={l.merchandise.image.url} alt={l.merchandise.product.title} fill sizes="120px" className="object-cover" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-4">
                        <Link href={`/product/${l.merchandise.product.handle}`} className="text-sm hover:underline">{l.merchandise.product.title}</Link>
                        <span className="shrink-0 text-sm font-medium">{formatMoney(l.cost.totalAmount)}</span>
                      </div>
                      <p className="mt-1 text-xsm text-gray-500">
                        {l.merchandise.product.colorName && <span>{t("Цвет:")} {l.merchandise.product.colorName} · </span>}{t("Размер:")} {l.merchandise.title}
                        {l.merchandise.sku && <span> · {t("Арт.")} {l.merchandise.sku}</span>}
                      </p>
                      {l.merchandise.compareAtPrice && l.merchandise.compareAtPrice.amount > l.merchandise.price.amount && (
                        <p className="mt-1 text-xsm text-gray-500"><span className="line-through">{formatMoney(l.merchandise.compareAtPrice)}</span> <span className="text-sale">{formatMoney(l.merchandise.price)}</span></p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-gray-300">
                          <button aria-label={t("Меньше")} disabled={loading} onClick={() => update(l.id, l.quantity - 1)} className="flex h-9 w-9 items-center justify-center rounded-l-full hover:bg-off-white"><Minus size={12} /></button>
                          <span className="w-8 text-center text-sm">{l.quantity}</span>
                          <button aria-label={t("Больше")} disabled={loading} onClick={() => update(l.id, l.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-r-full hover:bg-off-white"><Plus size={12} /></button>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500">
                          <button onClick={() => { toggleWish(l.merchandise.product.handle); remove(l.id); }} className="flex items-center gap-1 text-xsm hover:text-black"><Heart size={14} /> <span className="hidden sm:inline">{t("В избранное")}</span></button>
                          <button onClick={() => remove(l.id)} className="flex items-center gap-1 text-xsm hover:text-black"><Trash2 size={14} /> <span className="hidden sm:inline">{t("Удалить")}</span></button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm bg-off-white p-5">
            <div className="flex justify-between py-2 text-xsm"><span>{t("Количество:")}</span><span>{qty}</span></div>
            <div className="flex justify-between border-t border-gray-300 py-2 text-xsm"><span>{t("Стоимость заказа:")}</span><span>{formatMoney(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between py-2 text-xsm text-sale"><span>{t("Скидка:")}</span><span>-{formatMoney({ amount: discount, currencyCode: subtotal.currencyCode })}</span></div>}
            <div className="flex justify-between border-t border-gray-300 py-3 text-sm font-bold"><span>{t("Итого:")}</span><span>{formatMoney(total)}</span></div>
            {lines.length > 0 && (
              <>
                <form onSubmit={async (e) => { e.preventDefault(); setCodeMsg(await applyDiscount(code.trim()) ?? (code ? t("Промокод применен") : null)); }} className="mt-3 flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("Промокод")} className="h-10 flex-1 rounded-full border border-gray-300 bg-white px-4 text-xsm focus:border-black" />
                  <button type="submit" className="btn-outline h-10 px-4 text-xsm">OK</button>
                </form>
                {codeMsg && <p className="mt-2 text-xsm">{codeMsg}</p>}
                <a href={cart!.checkoutUrl} className="btn-primary mt-4 w-full">{t("Оформить заказ")}</a>
              </>
            )}
          </div>
          <div className="mt-4 rounded-sm bg-pale-pink/60 p-5 text-xsm">
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"><Truck size={13} /></span><Link href="/pages/delivery" className="underline underline-offset-2">{t("Подробнее о доставке")}</Link></li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"><RotateCcw size={13} /></span>{t("Возврат в течение {n} дней", { n: returnDays })}</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-pink/15 text-brand-pink"><ShieldCheck size={13} /></span>{t("Безопасная оплата")}</li>
            </ul>
          </div>
          <p className="mt-4 text-xsm text-gray-500">{t(notice)}</p>
        </aside>
      </div>
    </div>
  );
}
