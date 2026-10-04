import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { getSettings } from "@/lib/cms/content";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Корзина"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return <CartView notice={settings.cartNotice} returnDays={settings.returnDays} freeShippingFrom={settings.freeShippingFrom} />;
}
