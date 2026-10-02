import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { getSettings } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Корзина", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return <CartView notice={settings.cartNotice} returnDays={settings.returnDays} freeShippingFrom={settings.freeShippingFrom} />;
}
