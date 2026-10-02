"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = {
  configured: boolean;
  domain?: string | null;
  message?: string;
  error?: string;
  shop?: { name: string; domain: string; currency: string; apiVersion: string };
  collectionsCount?: number;
  collections?: { handle: string; title: string }[];
  sampleProducts?: { handle: string; title: string; price: { amount: number; currencyCode: string }; image?: string; sizes: number }[];
  categories?: { id: string; path: string; title: string; collectionHandle: string | null; linked: boolean }[];
};

export default function ShopifyPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/shopify");
      setStatus(await r.json());
    } catch (e) {
      setStatus({ configured: false, error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function autoMap() {
    setMsg("Сопоставляем…");
    const r = await fetch("/api/admin/shopify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "auto" }) });
    const j = await r.json();
    setMsg(r.ok ? `Привязано категорий: ${j.updated}. Без совпадений: ${j.unmatched?.length ?? 0}` : j.error);
    load();
  }
  async function setOne(categoryId: string, collectionHandle: string) {
    await fetch("/api/admin/shopify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "set", categoryId, collectionHandle }) });
    load();
  }

  if (loading && !status) return <p className="text-sm text-gray-500">Проверяем подключение…</p>;
  if (!status) return null;

  return (
    <div className="space-y-6">
      <section className={cn("rounded-sm border p-5", status.configured && !status.error ? "border-success/40 bg-success/5" : "border-badge/30 bg-pale-pink/40")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            {status.configured && !status.error ? <CheckCircle2 className="text-success" size={18} /> : <XCircle className="text-badge" size={18} />}
            {status.configured ? (status.error ? "Ошибка подключения" : `Подключено: ${status.shop?.name}`) : "Shopify не подключен"}
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-xsm hover:border-black"><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Проверить снова</button>
        </div>
        {status.shop && (
          <dl className="mt-3 grid gap-x-8 gap-y-1 text-xsm sm:grid-cols-4">
            <div><dt className="text-gray-500">Магазин</dt><dd className="font-medium">{status.shop.domain}</dd></div>
            <div><dt className="text-gray-500">Валюта</dt><dd className="font-medium">{status.shop.currency}</dd></div>
            <div><dt className="text-gray-500">Версия API</dt><dd className="font-medium">{status.shop.apiVersion}</dd></div>
            <div><dt className="text-gray-500">Коллекций</dt><dd className="font-medium">{status.collectionsCount}</dd></div>
          </dl>
        )}
        {(status.message || status.error) && <p className="mt-3 text-xsm text-gray-900">{status.error ?? status.message}</p>}
        {!status.configured && (
          <pre className="mt-3 overflow-x-auto rounded-sm bg-white p-3 text-[11px]">{`SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxx…
SHOPIFY_API_VERSION=2026-10`}</pre>
        )}
      </section>

      {status.sampleProducts && status.sampleProducts.length > 0 && (
        <section className="rounded-sm border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold">Проверка товаров (первая коллекция)</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {status.sampleProducts.map((p) => (
              <li key={p.handle} className="flex gap-3 text-xsm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image && <img src={p.image} alt="" className="h-16 w-12 rounded-xs object-cover" />}
                <div><p className="font-medium">{p.title}</p><p className="text-gray-500">{p.price.amount} {p.price.currencyCode} · размеров: {p.sizes}</p><a href={`/product/${p.handle}`} target="_blank" className="underline">Открыть на сайте</a></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {status.categories && status.collections && (
        <section className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Привязка категорий сайта к коллекциям Shopify</h2>
            <button onClick={autoMap} className="btn-primary h-9 rounded-sm px-4 text-xsm"><Link2 size={12} className="mr-1" /> Сопоставить автоматически</button>
          </div>
          {msg && <p className="mb-3 text-xsm">{msg}</p>}
          <p className="mb-3 text-xsm text-gray-500">Автоподбор ищет коллекцию по handle последнего сегмента URL, по названию категории или по транслиту названия. Остальное выбери вручную.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xsm">
              <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-3 py-2">Страница сайта</th><th className="px-3 py-2">Коллекция Shopify</th><th className="px-3 py-2 w-16">Статус</th></tr></thead>
              <tbody>
                {status.categories.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-3 py-2"><span className="font-medium">{c.title}</span><br /><code className="text-[10px] text-gray-500">/{c.path}</code></td>
                    <td className="px-3 py-2">
                      <select value={c.collectionHandle ?? ""} onChange={(e) => setOne(c.id, e.target.value)} className="h-9 w-full max-w-sm rounded-sm border border-gray-300 bg-white px-2">
                        <option value="">— не привязана —</option>
                        {!c.linked && c.collectionHandle && <option value={c.collectionHandle}>{c.collectionHandle} (нет в Shopify)</option>}
                        {status.collections!.map((col) => <option key={col.handle} value={col.handle}>{col.title} ({col.handle})</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">{c.linked ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-gray-300" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
