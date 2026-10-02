import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { adminGraphql, ADMIN_ORDER, isAdminConfigured } from "@/lib/shopify/admin";
import { SHOPIFY_DOMAIN } from "@/lib/shopify/client";
import { formatMoney } from "@/lib/utils";
import OrderNoteForm from "@/components/admin/OrderNoteForm";

export const dynamic = "force-dynamic";

type M = { shopMoney: { amount: string; currencyCode: string } };
const money = (m?: M | null) => (m ? formatMoney({ amount: Number(m.shopMoney.amount), currencyCode: m.shopMoney.currencyCode }) : "—");

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role) || !isAdminConfigured()) notFound();
  const { id } = await params;
  const gid = `gid://shopify/Order/${decodeURIComponent(id)}`;
  const data = await adminGraphql<{ order: {
    id: string; name: string; createdAt: string; note?: string | null; displayFinancialStatus: string; displayFulfillmentStatus: string;
    totalPriceSet: M; subtotalPriceSet: M; totalShippingPriceSet: M;
    customer?: { id: string; displayName: string; email?: string | null; phone?: string | null } | null;
    shippingAddress?: { name?: string | null; address1?: string | null; address2?: string | null; city?: string | null; zip?: string | null; country?: string | null; phone?: string | null } | null;
    fulfillments: { status: string; trackingInfo: { number?: string | null; url?: string | null; company?: string | null }[] }[];
    lineItems: { nodes: { title: string; quantity: number; sku?: string | null; variantTitle?: string | null; originalTotalSet: M; image?: { url: string } | null }[] };
  } | null }>(ADMIN_ORDER, { id: gid }).catch(() => null);
  const o = data?.order;
  if (!o) notFound();
  const numericId = o.id.split("/").pop();
  const a = o.shippingAddress;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-xsm text-gray-500 hover:text-black"><ChevronLeft size={14} /> Заказы</Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Заказ {o.name}</h1>
          <p className="text-xsm text-gray-500">{new Date(o.createdAt).toLocaleString("ru-RU")} · {o.displayFinancialStatus} · {o.displayFulfillmentStatus}</p>
        </div>
        <a href={`https://${SHOPIFY_DOMAIN.replace(".myshopify.com", "")}.myshopify.com/admin/orders/${numericId}`} target="_blank" rel="noopener noreferrer" className="btn-outline h-10 rounded-sm px-4 text-xsm"><ExternalLink size={14} className="mr-1" /> Открыть в Shopify</a>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-sm border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-100">
            {o.lineItems.nodes.map((li, i) => (
              <li key={i} className="flex gap-4 p-4 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {li.image && <img src={li.image.url} alt="" className="h-20 w-14 rounded-xs object-cover" />}
                <div className="flex-1"><p className="font-medium">{li.title}</p><p className="text-xsm text-gray-500">{li.variantTitle} · {li.sku} · ×{li.quantity}</p></div>
                <p className="font-medium">{money(li.originalTotalSet)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 p-4 text-xsm">
            <div className="flex justify-between py-1"><span>Товары</span><span>{money(o.subtotalPriceSet)}</span></div>
            <div className="flex justify-between py-1"><span>Доставка</span><span>{money(o.totalShippingPriceSet)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold"><span>Итого</span><span>{money(o.totalPriceSet)}</span></div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Клиент</p>
            {o.customer ? <Link href={`/admin/customers/${encodeURIComponent(o.customer.id.split("/").pop()!)}`} className="underline">{o.customer.displayName}</Link> : "Гость"}
            <p className="text-xsm text-gray-500">{o.customer?.email}<br />{o.customer?.phone}</p>
          </div>
          {a && (
            <div className="rounded-sm border border-gray-200 bg-white p-4 text-sm">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Доставка</p>
              <p>{a.name}</p><p className="text-gray-900">{a.address1}{a.address2 ? `, ${a.address2}` : ""}<br />{a.zip} {a.city}, {a.country}</p><p className="text-xsm text-gray-500">{a.phone}</p>
              {o.fulfillments.map((f, i) => f.trackingInfo.map((t, j) => (
                <p key={`${i}-${j}`} className="mt-2 text-xsm">Трек: {t.url ? <a href={t.url} target="_blank" rel="noopener noreferrer" className="underline">{t.number}</a> : t.number} {t.company && `(${t.company})`}</p>
              )))}
            </div>
          )}
          <OrderNoteForm orderId={o.id} note={o.note ?? ""} />
        </aside>
      </div>
    </div>
  );
}
