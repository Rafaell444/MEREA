import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { requireCustomer, orderStatus } from "@/lib/account";
import { formatMoney, cn } from "@/lib/utils";
import AccountShell from "@/components/account/AccountShell";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Мои заказы"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { customer, token } = await requireCustomer("/orders");
  const { t, locale } = await getT();
  const dl = locale === "ka" ? "ka-GE" : locale === "en" ? "en-GB" : "ru-RU";
  const catalog = await getCatalog();
  const orders = await catalog.getCustomerOrders(token).catch(() => []);
  return (
    <AccountShell title={t("Мои заказы")} subtitle={t("История покупок, статусы доставки и возвраты")} name={customer.email}>
      {orders.length === 0 ? (
        <div className="rounded-sm border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-900">{t("У тебя пока нет заказов.")}</p>
          <Link href="/women" className="btn-primary mt-6 h-11 px-10 text-xsm">{t("К покупкам")}</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const status = t(orderStatus(o));
            const delivered = o.fulfillmentStatus === "FULFILLED";
            const id = encodeURIComponent(o.id.split("/").pop() ?? o.id);
            return (
              <li key={o.id} className="rounded-sm border border-gray-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{t("Заказ №{n}", { n: o.orderNumber })}</p>
                    <p className="text-xsm text-gray-500">{new Date(o.processedAt).toLocaleDateString(dl, { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium", delivered ? "bg-success/10 text-success" : "bg-off-white text-black")}>{status}</span>
                  <p className="text-sm font-bold">{formatMoney(o.totalPrice)}</p>
                </div>
                <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto">
                  {o.lineItems.map((li, i) => (
                    <div key={i} className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xs bg-off-white">
                      {li.image && <Image src={li.image} alt={li.title} fill sizes="64px" className="object-cover" />}
                      {li.quantity > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black px-1.5 text-[10px] text-white">×{li.quantity}</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-xsm">
                  <Link href={`/orders/${id}`} className="flex items-center gap-1 underline underline-offset-4">{t("Детали заказа")} <ArrowRight size={12} /></Link>
                  {o.trackingNumber && <span className="text-gray-500">{t("Трек: {n}", { n: o.trackingNumber })}</span>}
                  {delivered && <Link href={`/returns?order=${o.orderNumber}`} className="underline underline-offset-4">{t("Оформить возврат")}</Link>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AccountShell>
  );
}
