export default function AdminNotConfigured({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-3 text-2xl font-bold">{title}</h1>
      <div className="rounded-sm border border-badge/30 bg-pale-pink/40 p-5 text-sm">
        <p className="font-bold">Нужен Admin API токен</p>
        <p className="mt-2 text-xsm text-gray-900">Этот раздел читает реальные данные магазина через Shopify Admin API. Добавь в <code>.env</code> (и в Vercel → Environment Variables):</p>
        <pre className="mt-3 rounded-sm bg-white p-3 text-[11px]">SHOPIFY_STORE_DOMAIN=your-store.myshopify.com{"\n"}SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_…</pre>
        <p className="mt-3 text-xsm text-gray-500">Токен берется из кастомного приложения (Settings → Apps → Develop apps → API credentials) со scopes read_orders, read_customers, write_orders (для заметок), read_products.</p>
      </div>
    </div>
  );
}
