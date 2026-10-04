import type { Metadata } from "next";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Truck, CheckCircle2, Clock, PackageCheck } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { requireCustomer, orderStatus } from "@/lib/account";
import { formatMoney, cn } from "@/lib/utils";
import AccountShell from "@/components/account/AccountShell";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Заказ"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

// i18n: t("Оформлен") t("Оплачен") t("Собирается") t("В пути") t("Доставлен")
const STEPS = ["Оформлен", "Оплачен", "Собирается", "В пути", "Доставлен"];
function stepIndex(o: { financialStatus?: string; fulfillmentStatus?: string }) {
  if (o.fulfillmentStatus === "FULFILLED") return 4;
  if (o.fulfillmentStatus === "PARTIALLY_FULFILLED" || o.fulfillmentStatus === "IN_PROGRESS") return 3;
  if (o.financialStatus === "PAID") return 2;
  return 0;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer, token } = await requireCustomer(`/orders/${id}`);
  const catalog = await getCatalog();
  const order = await catalog.getCustomerOrder(token, decodeURIComponent(id)).catch(() => null);
  if (!order) notFound();
  const { t, locale } = await getT();
  const dl = locale === "ka" ? "ka-GE" : locale === "en" ? "en-GB" : "ru-RU";
  const step = stepIndex(order);
  const a = order.shippingAddress;
  const canReturn = order.fulfillmentStatus === "FULFILLED";

  return (
    <AccountShell title={t("Заказ №{n}", { n: order.orderNumber })} subtitle={`${new Date(order.processedAt).toLocaleDateString(dl, { day: "numeric", month: "long", year: "numeric" })} · ${t(orderStatus(order))}`} name={customer.email}>
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1 text-xsm text-gray-500 hover:text-black"><ChevronLeft size={14} /> {t("Все заказы")}</Link>

      {/* Progress */}
      <ol className="mb-6 grid grid-cols-5 gap-1 rounded-sm border border-gray-200 p-4">
        {STEPS.map((s, i) => {
          const done = i <= step;
          const Icon = i === 4 ? PackageCheck : i === 3 ? Truck : i <= step ? CheckCircle2 : Clock;
          return (
            <li key={s} className="flex flex-col items-center gap-1 text-center">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border", done ? "border-black bg-black text-white" : "border-gray-300 text-gray-400")}><Icon size={14} /></span>
              <span className={cn("text-[10px] sm:text-xsm", done ? "font-medium" : "text-gray-400")}>{t(s)}</span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-sm border border-gray-200">
          <ul className="divide-y divide-gray-100">
            {order.lineItems.map((li, i) => (
              <li key={i} className="flex gap-4 p-4">
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xs bg-off-white">{li.image && <Image src={li.image} alt={li.title} fill sizes="80px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  {li.handle ? <Link href={`/product/${li.handle}`} className="text-sm hover:underline">{li.title}</Link> : <p className="text-sm">{li.title}</p>}
                  <p className="mt-1 text-xsm text-gray-500">{li.variantTitle && `${t("Размер: {size}", { size: li.variantTitle })} · `}{t("Кол-во: {n}", { n: li.quantity })}</p>
                  {li.price && <p className="mt-2 text-sm font-medium">{formatMoney({ amount: li.price.amount * (li.price.amount < 100000 ? li.quantity : 1), currencyCode: li.price.currencyCode })}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <aside className="space-y-4">
          <div className="rounded-sm bg-off-white p-5 text-xsm">
            {order.subtotalPrice && <div className="flex justify-between py-1"><span>{t("Товары")}</span><span>{formatMoney(order.subtotalPrice)}</span></div>}
            {order.shippingPrice && <div className="flex justify-between py-1"><span>{t("Доставка")}</span><span>{order.shippingPrice.amount ? formatMoney(order.shippingPrice) : t("Бесплатно")}</span></div>}
            <div className="mt-2 flex justify-between border-t border-gray-300 pt-3 text-sm font-bold"><span>{t("Итого")}</span><span>{formatMoney(order.totalPrice)}</span></div>
          </div>
          {a && (
            <div className="rounded-sm border border-gray-200 p-5 text-sm">
              <p className="mb-2 text-xsm font-bold uppercase tracking-wider text-gray-500">{t("Доставка")}</p>
              <p>{[a.firstName, a.lastName].filter(Boolean).join(" ")}</p>
              <p className="text-gray-900">{a.address1}{a.address2 ? `, ${a.address2}` : ""}<br />{a.zip ? `${a.zip}, ` : ""}{a.city}</p>
              {order.trackingNumber && <p className="mt-3 text-xsm">{t("Трек-номер:")} <span className="font-medium">{order.trackingNumber}</span></p>}
              {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xsm underline underline-offset-4">{t("Отследить посылку")}</a>}
              {order.statusUrl && <a href={order.statusUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xsm underline underline-offset-4">{t("Статус в Shopify")}</a>}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {canReturn && <Link href={`/returns?order=${order.orderNumber}`} className="btn-outline h-11 text-xsm">{t("Оформить возврат")}</Link>}
            <Link href="/contactform" className="text-center text-xsm underline underline-offset-4">{t("Вопрос по заказу")}</Link>
          </div>
        </aside>
      </div>
    </AccountShell>
  );
}
