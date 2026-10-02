import Link from "next/link";
import { db } from "@/lib/db";
import { catalogMode } from "@/lib/catalog";
import { getAdminSession } from "@/lib/auth/session";
import { MODELS, roleCan } from "@/lib/admin/registry";
import PurgeCacheButton from "@/components/admin/PurgeCacheButton";

export default async function AdminDashboard() {
  const session = (await getAdminSession())!;
  const [subs, msgs, notify, reviews, audit] = await Promise.all([
    db.subscriber.count(),
    db.contactMessage.count({ where: { handled: false } }),
    db.notifyRequest.count({ where: { notified: false } }),
    db.review.count({ where: { approved: false } }),
    db.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { user: true } }),
  ]);
  const mode = catalogMode();
  const stats = [
    { label: "Подписчики", value: subs, href: "/admin/subscribers" },
    { label: "Необработанные обращения", value: msgs, href: "/admin/messages" },
    { label: "Ждут поступления", value: notify, href: "/admin/notify" },
    { label: "Отзывы на модерации", value: reviews, href: "/admin/reviews" },
  ];
  const quick = MODELS.filter((m) => ["hero", "home", "announcements", "popups", "menus", "categories", "badges", "pages"].includes(m.key) && roleCan(session.role, m, "read"));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Дашборд</h1>
          <p className="text-sm text-gray-500">Привет, {session.name}. Здесь управляется всё содержимое сайта.</p>
        </div>
        <PurgeCacheButton />
      </div>

      <div className={`mb-6 rounded-sm border p-4 text-sm ${mode === "shopify" ? "border-success/40 bg-success/5" : "border-badge/30 bg-pale-pink/50"}`}>
        {mode === "shopify" ? (
          <p><strong>Shopify подключен.</strong> Товары, цены, остатки и корзина приходят из магазина {process.env.SHOPIFY_STORE_DOMAIN}.</p>
        ) : (
          <p><strong>Демо-режим.</strong> Сайт показывает встроенный тестовый каталог. Чтобы подключить Shopify, заполни <code>SHOPIFY_STORE_DOMAIN</code> и <code>SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> в файле <code>.env</code> и перезапусти сервер. Подробности — в README.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:border-black">
            <p className="text-xsm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-widest text-gray-500">Быстрый доступ</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((m) => (
          <Link key={m.key} href={`/admin/${m.key}`} className="rounded-sm border border-gray-200 bg-white p-4 text-sm font-medium transition-colors hover:border-black">{m.labelPlural}</Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-widest text-gray-500">Последние действия</h2>
      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-left text-xsm">
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 text-gray-500">{a.createdAt.toLocaleString("ru-RU")}</td>
                <td className="px-4 py-2">{a.user?.name ?? "—"}</td>
                <td className="px-4 py-2 font-medium">{a.action}</td>
                <td className="px-4 py-2">{a.entity}{a.entityId ? ` · ${a.entityId.slice(0, 8)}` : ""}</td>
              </tr>
            ))}
            {audit.length === 0 && <tr><td className="px-4 py-3 text-gray-500">Пока пусто</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
