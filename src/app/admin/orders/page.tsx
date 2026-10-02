import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { adminGraphql, ADMIN_ORDERS, isAdminConfigured } from "@/lib/shopify/admin";
import { formatMoney } from "@/lib/utils";
import AdminNotConfigured from "@/components/admin/AdminNotConfigured";

export const dynamic = "force-dynamic";

type Order = {
  id: string; name: string; createdAt: string; displayFinancialStatus: string; displayFulfillmentStatus: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  customer?: { id: string; displayName: string; email?: string | null } | null;
  shippingAddress?: { city?: string | null } | null;
  lineItems: { nodes: { title: string; quantity: number }[] };
};

const FIN: Record<string, string> = { PAID: "Оплачен", PENDING: "Ожидает оплаты", REFUNDED: "Возврат", PARTIALLY_REFUNDED: "Частичный возврат", VOIDED: "Отменен", AUTHORIZED: "Авторизован" };
const FUL: Record<string, string> = { FULFILLED: "Отправлен", UNFULFILLED: "Не отправлен", PARTIALLY_FULFILLED: "Частично", IN_PROGRESS: "В работе", ON_HOLD: "На удержании" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; after?: string }> }) {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role)) notFound();
  if (!isAdminConfigured()) return <AdminNotConfigured title="Заказы" />;
  const { q = "", after } = await searchParams;
  let data: { orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: Order[] } } | null = null;
  let error = "";
  try {
    data = await adminGraphql(ADMIN_ORDERS, { first: 50, after: after ?? null, query: q || null });
  } catch (e) { error = (e as Error).message; }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Заказы</h1>
      <p className="mb-5 text-xsm text-gray-500">Реальные заказы магазина из Shopify Admin API. Обработка (отправка, возврат денег) выполняется в Shopify — ссылки ведут туда.</p>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Поиск: номер, e-mail, статус (например financial_status:paid)" className="h-10 w-full max-w-xl rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-black" />
        <button className="btn-primary h-10 rounded-sm px-5 text-xsm">Найти</button>
      </form>
      {error && <p className="mb-4 rounded-sm bg-error/10 p-3 text-xsm text-error">{error}</p>}
      <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-left text-xsm">
          <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-3 py-2">Заказ</th><th className="px-3 py-2">Дата</th><th className="px-3 py-2">Клиент</th><th className="px-3 py-2">Товары</th><th className="px-3 py-2">Оплата</th><th className="px-3 py-2">Доставка</th><th className="px-3 py-2 text-right">Сумма</th></tr></thead>
          <tbody>
            {data?.orders.nodes.map((o) => (
              <tr key={o.id} className="border-t border-gray-100 hover:bg-off-white/60">
                <td className="px-3 py-2 font-medium"><Link href={`/admin/orders/${encodeURIComponent(o.id.split("/").pop()!)}`} className="underline underline-offset-2">{o.name}</Link></td>
                <td className="px-3 py-2 text-gray-500">{new Date(o.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-3 py-2">{o.customer?.displayName ?? "Гость"}<br /><span className="text-gray-500">{o.customer?.email ?? ""}</span></td>
                <td className="px-3 py-2">{o.lineItems.nodes.map((l) => `${l.title} ×${l.quantity}`).join(", ").slice(0, 80)}</td>
                <td className="px-3 py-2">{FIN[o.displayFinancialStatus] ?? o.displayFinancialStatus}</td>
                <td className="px-3 py-2">{FUL[o.displayFulfillmentStatus] ?? o.displayFulfillmentStatus}{o.shippingAddress?.city ? ` · ${o.shippingAddress.city}` : ""}</td>
                <td className="px-3 py-2 text-right font-medium">{formatMoney({ amount: Number(o.totalPriceSet.shopMoney.amount), currencyCode: o.totalPriceSet.shopMoney.currencyCode })}</td>
              </tr>
            ))}
            {data && data.orders.nodes.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Заказов нет</td></tr>}
          </tbody>
        </table>
      </div>
      {data?.orders.pageInfo.hasNextPage && <Link href={`/admin/orders?q=${encodeURIComponent(q)}&after=${encodeURIComponent(data.orders.pageInfo.endCursor ?? "")}`} className="mt-4 inline-block text-xsm underline">Следующие 50 →</Link>}
    </div>
  );
}
