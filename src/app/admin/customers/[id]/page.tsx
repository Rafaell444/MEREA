import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { adminGraphql, ADMIN_CUSTOMER, isAdminConfigured } from "@/lib/shopify/admin";
import { SHOPIFY_DOMAIN } from "@/lib/shopify/client";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role) || !isAdminConfigured()) notFound();
  const { id } = await params;
  const data = await adminGraphql<{ customer: {
    id: string; displayName: string; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null; createdAt: string; note?: string | null; tags: string[]; numberOfOrders: string;
    amountSpent: { amount: string; currencyCode: string }; emailMarketingConsent?: { marketingState: string } | null;
    addresses: { address1?: string | null; address2?: string | null; city?: string | null; zip?: string | null; country?: string | null; phone?: string | null }[];
    orders: { nodes: { id: string; name: string; createdAt: string; displayFinancialStatus: string; displayFulfillmentStatus: string; totalPriceSet: { shopMoney: { amount: string; currencyCode: string } } }[] };
  } | null }>(ADMIN_CUSTOMER, { id: `gid://shopify/Customer/${decodeURIComponent(id)}` }).catch(() => null);
  const c = data?.customer;
  if (!c) notFound();
  const numericId = c.id.split("/").pop();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-xsm text-gray-500 hover:text-black"><ChevronLeft size={14} /> Клиенты</Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{c.displayName}</h1><p className="text-xsm text-gray-500">{c.email} · {c.phone} · с {new Date(c.createdAt).toLocaleDateString("ru-RU")}</p></div>
        <a href={`https://${SHOPIFY_DOMAIN}/admin/customers/${numericId}`} target="_blank" rel="noopener noreferrer" className="btn-outline h-10 rounded-sm px-4 text-xsm"><ExternalLink size={14} className="mr-1" /> Открыть в Shopify</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-4"><p className="text-xsm text-gray-500">Заказов</p><p className="text-2xl font-bold">{c.numberOfOrders}</p></div>
        <div className="rounded-sm border border-gray-200 bg-white p-4"><p className="text-xsm text-gray-500">Сумма покупок</p><p className="text-2xl font-bold">{formatMoney({ amount: Number(c.amountSpent.amount), currencyCode: c.amountSpent.currencyCode })}</p></div>
        <div className="rounded-sm border border-gray-200 bg-white p-4"><p className="text-xsm text-gray-500">Рассылка</p><p className="text-2xl font-bold">{c.emailMarketingConsent?.marketingState === "SUBSCRIBED" ? "Да" : "Нет"}</p></div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Адреса</p>
          {c.addresses.length === 0 && <p className="text-gray-500">Нет адресов</p>}
          {c.addresses.map((a, i) => <p key={i} className="mb-2">{a.address1}{a.address2 ? `, ${a.address2}` : ""}, {a.zip} {a.city}, {a.country}<br /><span className="text-xsm text-gray-500">{a.phone}</span></p>)}
          {c.tags.length > 0 && <p className="mt-3 text-xsm">Теги: {c.tags.join(", ")}</p>}
          {c.note && <p className="mt-2 text-xsm text-gray-500">Заметка: {c.note}</p>}
        </div>
        <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Заказы</p>
          <ul className="divide-y divide-gray-100">
            {c.orders.nodes.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 text-xsm">
                <Link href={`/admin/orders/${encodeURIComponent(o.id.split("/").pop()!)}`} className="font-medium underline">{o.name}</Link>
                <span className="text-gray-500">{new Date(o.createdAt).toLocaleDateString("ru-RU")}</span>
                <span>{o.displayFinancialStatus} / {o.displayFulfillmentStatus}</span>
                <span className="font-medium">{formatMoney({ amount: Number(o.totalPriceSet.shopMoney.amount), currencyCode: o.totalPriceSet.shopMoney.currencyCode })}</span>
              </li>
            ))}
            {c.orders.nodes.length === 0 && <li className="py-2 text-gray-500">Заказов нет</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
