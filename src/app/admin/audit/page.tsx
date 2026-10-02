import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = (await getAdminSession())!;
  if (!["owner", "admin"].includes(session.role)) notFound();
  const { page: p } = await searchParams;
  const page = Math.max(1, Number(p ?? 1) || 1);
  const take = 100;
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ take, skip: (page - 1) * take, orderBy: { createdAt: "desc" }, include: { user: true } }),
    db.auditLog.count(),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-2xl font-bold">Журнал действий</h1>
      <p className="mb-5 text-xsm text-gray-500">Кто, что и когда менял. Всего записей: {total}.</p>
      <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-left text-xsm">
          <thead className="bg-off-white text-[10px] uppercase tracking-wider text-gray-500">
            <tr><th className="px-3 py-2">Время</th><th className="px-3 py-2">Пользователь</th><th className="px-3 py-2">Действие</th><th className="px-3 py-2">Объект</th><th className="px-3 py-2">IP</th><th className="px-3 py-2">Детали</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 align-top">
                <td className="whitespace-nowrap px-3 py-2 text-gray-500">{r.createdAt.toLocaleString("ru-RU")}</td>
                <td className="px-3 py-2">{r.user?.name ?? "—"}</td>
                <td className="px-3 py-2 font-medium">{r.action}</td>
                <td className="px-3 py-2">{r.entity}{r.entityId ? ` · ${r.entityId.slice(0, 10)}` : ""}</td>
                <td className="px-3 py-2 text-gray-500">{r.ip ?? "—"}</td>
                <td className="max-w-md truncate px-3 py-2 font-mono text-[10px] text-gray-500">{r.details ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2 text-xsm">
        {page > 1 && <a href={`/admin/audit?page=${page - 1}`} className="underline">← Новее</a>}
        {page * take < total && <a href={`/admin/audit?page=${page + 1}`} className="underline">Старше →</a>}
      </div>
    </div>
  );
}
