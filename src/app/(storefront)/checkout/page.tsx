import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import { catalogMode } from "@/lib/catalog";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Оформление заказа"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

/**
 * With Shopify connected the cart's checkoutUrl points to Shopify Checkout and this page is never used.
 * In mock mode it explains that checkout is handled by Shopify.
 */
export default async function CheckoutPlaceholder() {
  const mode = catalogMode();
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-normal">{t("Оформление заказа")}</h1>
      <p className="mt-4 text-sm text-gray-900">
        {mode === "mock"
          ? t("Сайт работает в демо-режиме без подключения к Shopify. После подключения магазина кнопка «Оформить заказ» будет вести в защищенный Shopify Checkout с оплатой и доставкой.")
          : t("Перенаправляем в защищенный Shopify Checkout…")}
      </p>
      <Link href="/cart" className="btn-outline mt-8 h-11 px-8 text-xsm">{t("Вернуться в корзину")}</Link>
    </div>
  );
}
