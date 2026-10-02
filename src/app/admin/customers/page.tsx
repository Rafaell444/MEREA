import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { adminGraphql, ADMIN_CUSTOMERS, isAdminConfigured } from "@/lib/shopify/admin";
import { formatMoney } from "@/lib/utils";
import AdminNotConfigured from "@/components/admin/AdminNotConfigured";

export const dynamic = "force-dynamic";

type C = { id: string; displayName: string; email?: string | null; phone?: string | null; createdAt: string; numberOfOrders: string; amountSpent: { amount: string; currencyCode: string }; defaultAddress?: { city?: string | null } | null; emailMarketingConsent?: { marketingState: string } | null };

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; after?: string }> }) {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role)) notFound();
  if (!isAdminConfigured()) return <AdminNotConfigured title="Клиенты" />;
  const { q = "", after } = await searchParams;
  let data: { customers: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: C[] } } | null = null;
  let error = "";
  try { data = await adminGraphql(ADMIN_CUSTOMERS, { first: 50, after: after ?? null, query: q || null }); } catch (e) { error = (e as Error).message; }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Клиенты</h1>
      <p className="mb-5 text-xsm text-gray-500">Клиенты магазина из Shopify. Регистрация на сайте создает клиента в Shopify автоматически.</p>
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Поиск по имени, e-mail, телефону" className="h-10 w-full max-w-xl rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-black" />
        <button className="btn-primary h-10 rounded-sm px-5 text-xsm">Найти</button>
      </form>
      {error && <p className="mb-4 rounded-sm bg-error/10 p-3 text-xsm text-error">{error}</p>}
      <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-left text-xsm">
          <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-3 py-2">Клиент</th><th className="px-3 py-2">Контакты</th><th className="px-3 py-2">Город</th><th className="px-3 py-2">Заказов</th><th className="px-3 py-2">Сумма покупок</th><th className="px-3 py-2">Рассылка</th><th className="px-3 py-2">Создан</th></tr></thead>
          <tbody>
            {data?.customers.nodes.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-off-white/60">
                <td className="px-3 py-2 font-medium"><Link href={`/admin/customers/${encodeURIComponent(c.id.split("/").pop()!)}`} className="underline underline-offset-2">{c.displayName}</Link></td>
                <td className="px-3 py-2">{c.email}<br /><span className="text-gray-500">{c.phone}</span></td>
                <td className="px-3 py-2">{c.defaultAddress?.city ?? "—"}</td>
                <td className="px-3 py-2">{c.numberOfOrders}</td>
                <td className="px-3 py-2">{formatMoney({ amount: Number(c.amountSpent.amount), currencyCode: c.amountSpent.currencyCode })}</td>
                <td className="px-3 py-2">{c.emailMarketingConsent?.marketingState === "SUBSCRIBED" ? "Подписан" : "—"}</td>
                <td className="px-3 py-2 text-gray-500">{new Date(c.createdAt).toLocaleDateString("ru-RU")}</td>
              </tr>
            ))}
            {data && data.customers.nodes.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Клиентов нет</td></tr>}
          </tbody>
        </table>
      </div>
      {data?.customers.pageInfo.hasNextPage && <Link href={`/admin/customers?q=${encodeURIComponent(q)}&after=${encodeURIComponent(data.customers.pageInfo.endCursor ?? "")}`} className="mt-4 inline-block text-xsm underline">Следующие 50 →</Link>}
    </div>
  );
}
