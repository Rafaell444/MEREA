import type { Metadata } from "next";
import Link from "next/link";
import { catalogMode } from "@/lib/catalog";

export const metadata: Metadata = { title: "Оформление заказа", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * With Shopify connected the cart's checkoutUrl points to Shopify Checkout and this page is never used.
 * In mock mode it explains that checkout is handled by Shopify.
 */
export default function CheckoutPlaceholder() {
  const mode = catalogMode();
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-normal">Оформление заказа</h1>
      <p className="mt-4 text-sm text-gray-900">
        {mode === "mock"
          ? "Сайт работает в демо-режиме без подключения к Shopify. После подключения магазина кнопка «Оформить заказ» будет вести в защищенный Shopify Checkout с оплатой и доставкой."
          : "Перенаправляем в защищенный Shopify Checkout…"}
      </p>
      <Link href="/cart" className="btn-outline mt-8 h-11 px-8 text-xsm">Вернуться в корзину</Link>
    </div>
  );
}
