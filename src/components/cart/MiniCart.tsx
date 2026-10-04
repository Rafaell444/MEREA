"use client";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { Minus, Plus, Trash2, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useT } from "@/lib/i18n/client";

export default function MiniCart({ freeShippingFrom = 3000 }: { freeShippingFrom?: number }) {
  const t = useT();
  const { drawer, close } = useUI();
  const { cart, loading, update, remove, lastAdded, clearLastAdded } = useCart();
  const open = drawer === "cart";
  const lines = cart?.lines ?? [];
  const subtotal = cart?.cost.subtotalAmount.amount ?? 0;
  const left = Math.max(0, freeShippingFrom - subtotal);

  return (
    <Drawer open={open} onClose={() => { close(); clearLastAdded(); }} side="right" title={cart?.totalQuantity ? t("Корзина ({n})", { n: cart.totalQuantity }) : t("Корзина")} width="w-full sm:w-[440px]">
      <div className="flex h-full flex-col">
        {lastAdded && (
          <div className="flex items-center gap-3 border-b border-gray-200 bg-off-white px-6 py-3 text-xsm animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-success" /> {t("Товар добавлен в корзину")}
          </div>
        )}
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-lg font-bold">{t("Твоя корзина пуста!")}</p>
            <p className="text-sm text-gray-500">{t("В корзину еще не добавлено ни одного товара")}</p>
            <button onClick={close} className="btn-primary mt-2">{t("Начать покупки")}</button>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4">
              <div className="mb-1 flex justify-between text-xsm">
                <span>{left > 0 ? t("До бесплатной доставки осталось {amount}", { amount: formatMoney(left) }) : t("Бесплатная доставка 🎉")}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-200">
                <div className="h-1 rounded-full bg-black transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / freeShippingFrom) * 100)}%` }} />
              </div>
            </div>
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-4 animate-fade-in">
                  <Link href={`/product/${l.merchandise.product.handle}`} onClick={close} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xs bg-off-white">
                    {l.merchandise.image && <Image src={l.merchandise.image.url} alt={l.merchandise.product.title} fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${l.merchandise.product.handle}`} onClick={close} className="line-clamp-2 text-sm hover:underline">{l.merchandise.product.title}</Link>
                    <p className="mt-1 text-xsm text-gray-500">
                      {l.merchandise.product.colorName && <span>{l.merchandise.product.colorName} · </span>}
                      {t("Размер:")} {l.merchandise.title}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gray-300">
                        <button aria-label={t("Меньше")} disabled={loading} onClick={() => update(l.id, l.quantity - 1)} className="flex h-8 w-8 items-center justify-center hover:bg-off-white rounded-l-full"><Minus size={12} /></button>
                        <span className="w-6 text-center text-xsm">{l.quantity}</span>
                        <button aria-label={t("Больше")} disabled={loading} onClick={() => update(l.id, l.quantity + 1)} className="flex h-8 w-8 items-center justify-center hover:bg-off-white rounded-r-full"><Plus size={12} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatMoney(l.cost.totalAmount)}</span>
                        <button aria-label={t("Удалить")} disabled={loading} onClick={() => remove(l.id)} className="text-gray-400 hover:text-black"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span>{t("Итого")}</span>
                <span className="text-md font-bold">{formatMoney(cart!.cost.totalAmount)}</span>
              </div>
              <Link href="/cart" onClick={close} className="btn-primary w-full">{t("Перейти в корзину")}</Link>
              <a href={cart!.checkoutUrl} className="btn-outline mt-2 w-full">{t("Оформить заказ")}</a>
              <ul className="mt-5 space-y-2 text-xsm text-gray-500">
                <li className="flex items-center gap-2"><Truck size={14} /> {t("Доставка по всей Грузии")}</li>
                <li className="flex items-center gap-2"><RotateCcw size={14} /> {t("Возврат в течение {n} дней", { n: 14 })}</li>
                <li className="flex items-center gap-2"><ShieldCheck size={14} /> {t("Безопасная оплата")}</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
